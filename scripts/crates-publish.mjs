#!/usr/bin/env node
// Publishes the Rust crates (doc/rust-crates-release.md).
//
//   node scripts/crates-publish.mjs --check     every publishable crate has its crates.io metadata
//   node scripts/crates-publish.mjs --print     the publish order, dependencies first
//   node scripts/crates-publish.mjs --check-features
//                                               `cargo check` the facade with no features, then
//                                               each feature on its own
//   node scripts/crates-publish.mjs --dry-run   `cargo publish --dry-run` for the whole workspace
//                                               (+ --allow-dirty for a working tree with changes)
//   node scripts/crates-publish.mjs --publish   publish in order; needs CARGO_REGISTRY_TOKEN
//   node scripts/crates-publish.mjs --print-new the crates with no version on crates.io yet
//   node scripts/crates-publish.mjs --trust     register the release workflow as each crate's
//                                               trusted publisher; needs CARGO_REGISTRY_TOKEN
//                                               with the trusted-publishing scope
//   node scripts/crates-publish.mjs --release   tag `crates-v<V>` and create the GitHub release
//                                               (idempotent; needs `gh` and a token)
//
// Only workspace members with `publish` unset (or a registry list) are handled; the conformance
// crate stays `publish = false`. The `bpmnkit` facade depends on every other crate, so it is
// published last.
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

function run(cmd, args, options = {}) {
	return spawnSync(cmd, args, {
		cwd: ROOT,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
		...options,
	})
}

export function loadCrates() {
	const result = run("cargo", ["metadata", "--format-version", "1", "--no-deps"])
	if (result.status !== 0) throw new Error(`cargo metadata failed:\n${result.stderr}`)
	const all = JSON.parse(result.stdout).packages
	// `publish: []` is `publish = false`.
	const crates = all.filter((p) => !(Array.isArray(p.publish) && p.publish.length === 0))
	const names = new Set(crates.map((c) => c.name))
	return crates.map((c) => ({
		...c,
		// Dev-dependencies are stripped when packaging, so they do not constrain the order.
		internal: c.dependencies.filter((d) => d.kind !== "dev" && names.has(d.name)),
		internalAll: c.dependencies.filter((d) => names.has(d.name)),
	}))
}

/** Dependencies first; ties by name, so the order is stable. */
export function publishOrder(crates) {
	const pending = new Map(crates.map((c) => [c.name, new Set(c.internal.map((d) => d.name))]))
	const order = []
	while (pending.size > 0) {
		const ready = [...pending].filter(([, deps]) => deps.size === 0).map(([name]) => name)
		if (ready.length === 0)
			throw new Error(`dependency cycle among: ${[...pending.keys()].join(", ")}`)
		ready.sort()
		for (const name of ready) {
			pending.delete(name)
			order.push(name)
		}
		for (const deps of pending.values()) for (const name of ready) deps.delete(name)
	}
	return order
}

/** The facade name; it re-exports every other published crate behind a feature. */
export const FACADE = "bpmnkit"

/** A new crate that the facade does not re-export would ship without a way in through it. */
export function facadeProblems(crates) {
	const facade = crates.find((c) => c.name === FACADE)
	if (!facade) return [`${FACADE}: the facade crate is missing`]
	const deps = new Set(facade.internalAll.map((d) => d.name))
	return crates
		.filter((c) => c.name !== FACADE && !deps.has(c.name))
		.map((c) => `${FACADE}: the facade does not re-export ${c.name}`)
}

export function check(crates) {
	const problems = [...facadeProblems(crates)]
	// Lockstep: every crate inherits `[workspace.package] version`.
	const version = crates[0]?.version
	for (const c of crates) {
		const dir = dirname(c.manifest_path)
		const need = (cond, message) => {
			if (!cond) problems.push(`${c.name}: ${message}`)
		}
		need(c.description, "missing description")
		need(c.license, "missing license")
		need(c.repository, "missing repository")
		need(c.homepage, "missing homepage")
		need(c.keywords.length > 0 && c.keywords.length <= 5, "keywords must have 1 to 5 entries")
		for (const k of c.keywords) need(/^[a-z0-9][a-z0-9_-]{0,19}$/.test(k), `invalid keyword "${k}"`)
		need(c.categories.length > 0, "missing categories")
		need(c.rust_version, "missing rust-version")
		need(c.readme && existsSync(join(dir, c.readme)), "readme file missing")
		need(existsSync(join(dir, "LICENSE-MIT")), "LICENSE-MIT missing")
		need(existsSync(join(dir, "LICENSE-APACHE")), "LICENSE-APACHE missing")
		need(c.version === version, `version ${c.version} differs from the other crates ${version}`)
		for (const d of c.internalAll) {
			// `req` is ">=0.1.0, <0.2.0"-style normalized; a bare path dependency reports "*".
			need(d.req !== "*", `dependency ${d.name} has no version`)
			need(d.req === `^${version}`, `dependency ${d.name} requires ${d.req}, expected ^${version}`)
		}
	}
	return problems
}

/**
 * Changesets versions each publishable crate as a private `@crates/<name>` package
 * (crates/<name>/package.json); scripts/crates-version.mjs copies that into Cargo. `read` returns
 * the parsed package.json of a crate directory, or null when there is none.
 */
export function packageJsonProblems(packages, read) {
	const problems = []
	for (const p of packages) {
		const pkg = read(dirname(p.manifest_path))
		if (Array.isArray(p.publish) && p.publish.length === 0) {
			if (pkg) problems.push(`${p.name}: publish = false, so package.json must not exist`)
			continue
		}
		if (!pkg) problems.push(`${p.name}: package.json missing (changesets versions the crate)`)
		else {
			if (pkg.private !== true) problems.push(`${p.name}: package.json must be private`)
			if (pkg.name !== `@crates/${p.name}`)
				problems.push(`${p.name}: package.json name is ${pkg.name}, expected @crates/${p.name}`)
			if (pkg.version !== p.version)
				problems.push(
					`${p.name}: package.json version ${pkg.version} differs from Cargo ${p.version}`,
				)
		}
	}
	return problems
}

function readPackageJson(dir) {
	const path = join(dir, "package.json")
	return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null
}

/** Sparse index path of a crate: `bp/mn/bpmnkit-xml`. */
export function indexPath(name) {
	const n = name.toLowerCase()
	if (n.length <= 2) return `${n.length}/${n}`
	if (n.length === 3) return `3/${n[0]}/${n}`
	return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n}`
}

/**
 * When crates.io refuses with 429 it names the time to retry ("try again after Tue, 10 Nov 2026
 * 09:11:57 GMT"); new crates are limited to a short burst, then about one per 10 minutes.
 */
export function retryAfter(stderr) {
	if (!/429 Too Many Requests/.test(stderr)) return null
	const match = /try again after ([^.]+? GMT)/.exec(stderr)
	const at = match ? Date.parse(match[1]) : Number.NaN
	return Number.isNaN(at) ? null : new Date(at)
}

/** The versions of `name` on crates.io, by the sparse index; empty when the crate does not exist. */
async function publishedVersions(name) {
	const response = await fetch(`https://index.crates.io/${indexPath(name)}`)
	if (response.status === 404) return []
	if (!response.ok) throw new Error(`crates.io index answered ${response.status} for ${name}`)
	const lines = (await response.text()).split("\n").filter(Boolean)
	return lines.map((line) => JSON.parse(line).vers)
}

/** The GitHub workflow allowed to publish by OIDC (crates.io trusted publishing). */
export const TRUSTED_PUBLISHER = {
	repository_owner: "bpmnkit",
	repository_name: "bpmnkit",
	workflow_filename: "release-crates.yml",
	environment: "crates-io",
}

/** Whether a crate's existing configs already include our workflow (owner and repo ignore case). */
export function hasTrustedPublisher(configs) {
	const t = TRUSTED_PUBLISHER
	return configs.some(
		(c) =>
			c.repository_owner.toLowerCase() === t.repository_owner &&
			c.repository_name.toLowerCase() === t.repository_name &&
			c.workflow_filename === t.workflow_filename &&
			c.environment === t.environment,
	)
}

async function cratesApi(path, token, init = {}) {
	const response = await fetch(`https://crates.io/api/v1${path}`, {
		...init,
		headers: {
			Authorization: token,
			"Content-Type": "application/json",
			// crates.io rejects requests without a User-Agent that names the client.
			"User-Agent": "bpmnkit-release (https://github.com/bpmnkit/bpmnkit)",
		},
	})
	if (!response.ok) {
		throw new Error(
			`crates.io ${init.method ?? "GET"} ${path}: ${response.status} ${await response.text()}`,
		)
	}
	return response.json()
}

/** The `## <version>` section of a changesets CHANGELOG, without its heading; "" when absent. */
export function changelogSection(changelog, version) {
	const lines = changelog.split("\n")
	const start = lines.findIndex((l) => l.trim() === `## ${version}`)
	if (start < 0) return ""
	const end = lines.findIndex((l, i) => i > start && /^## /.test(l))
	return lines
		.slice(start + 1, end < 0 ? undefined : end)
		.join("\n")
		.trim()
}

/**
 * GitHub release notes for `crates-v<version>`: the facade's section first, then the other crates
 * (by name), empty sections skipped, then the corpus provenance line.
 * `changelogs` is `[{ name, text }]` with `name` the crate directory name.
 */
export function buildReleaseNotes({ version, changelogs, corpus }) {
	const sorted = [...changelogs].sort(
		(a, b) => Number(b.name === FACADE) - Number(a.name === FACADE) || a.name.localeCompare(b.name),
	)
	const parts = []
	for (const { name, text } of sorted) {
		const section = changelogSection(text, version)
		if (section) parts.push(`### ${name}\n\n${section}`)
	}
	if (parts.length === 0) parts.push("No user-facing changes.")
	parts.push(
		`Conformance corpus recorded from \`@bpmnkit/core\` ${corpus.core} and \`@bpmnkit/feel\` ${corpus.feel}.`,
	)
	return `${parts.join("\n\n")}\n`
}

/** The release inputs from the crates' package.json files: the common version, and each CHANGELOG. */
export function loadRelease() {
	const dirs = readdirSync(join(ROOT, "crates"), { withFileTypes: true })
		.filter((e) => e.isDirectory() && existsSync(join(ROOT, "crates", e.name, "package.json")))
		.map((e) => e.name)
	const versions = new Set(
		dirs.map(
			(d) => JSON.parse(readFileSync(join(ROOT, "crates", d, "package.json"), "utf8")).version,
		),
	)
	if (versions.size !== 1) throw new Error(`crate versions differ: ${[...versions].join(", ")}`)
	const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8")).version
	return {
		version: [...versions][0],
		changelogs: dirs.map((name) => {
			const f = join(ROOT, "crates", name, "CHANGELOG.md")
			return { name, text: existsSync(f) ? readFileSync(f, "utf8") : "" }
		}),
		corpus: { core: read("packages/core/package.json"), feel: read("packages/feel/package.json") },
	}
}

/** Tag and release `crates-v<V>`; a tag or release that exists is left alone, so a rerun is safe. */
function release() {
	const { version, changelogs, corpus } = loadRelease()
	const tag = `crates-v${version}`
	const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8" })
	if (sh("gh", ["release", "view", tag]).status === 0) {
		console.log(`skip ${tag}: release exists`)
		return
	}
	const remote = sh("git", ["ls-remote", "--tags", "origin", `refs/tags/${tag}`]).stdout
	if (!remote.trim()) {
		for (const args of [
			["tag", tag],
			["push", "origin", tag],
		]) {
			if (cargo_like("git", args) !== 0) process.exit(1)
		}
	} else console.log(`tag ${tag} exists`)
	const notes = buildReleaseNotes({ version, changelogs, corpus })
	const status = cargo_like("gh", [
		"release",
		"create",
		tag,
		"--verify-tag",
		"--title",
		tag,
		"--notes",
		notes,
	])
	if (status !== 0) process.exit(status)
	console.log(`released ${tag}`)
}

function cargo_like(cmd, args) {
	return spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" }).status ?? 1
}

function cargo(args) {
	const result = spawnSync("cargo", args, { cwd: ROOT, stdio: "inherit" })
	return result.status ?? 1
}

async function main() {
	const args = process.argv.slice(2)
	const crates = loadCrates()
	const order = publishOrder(crates)
	if (args.includes("--print")) {
		console.log(order.join("\n"))
	} else if (args.includes("--check")) {
		const all = JSON.parse(run("cargo", ["metadata", "--format-version", "1", "--no-deps"]).stdout)
		const problems = [...check(crates), ...packageJsonProblems(all.packages, readPackageJson)]
		if (problems.length > 0) {
			console.error(`crates-publish: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`)
			process.exit(1)
		}
		console.log(`crates-publish: ${order.length} crates ok (${order.join(", ")})`)
	} else if (args.includes("--check-features")) {
		const facade = crates.find((c) => c.name === FACADE)
		const features = Object.keys(facade.features).filter((f) => f !== "default")
		for (const f of ["", ...features]) {
			console.log(`check ${FACADE} --features "${f}"`)
			const status = cargo(["check", "-p", FACADE, "--no-default-features", "--features", f])
			if (status !== 0) process.exit(status)
		}
	} else if (args.includes("--dry-run")) {
		// The workspace form lets crates whose dependencies are not on crates.io yet verify.
		const exclude = loadExcluded()
		// `--allow-dirty` is passed through for local runs.
		const dirty = args.includes("--allow-dirty") ? ["--allow-dirty"] : []
		process.exit(cargo(["publish", "--dry-run", "--workspace", ...exclude, ...dirty]))
	} else if (args.includes("--publish")) {
		if (!process.env.CARGO_REGISTRY_TOKEN) {
			console.error("crates-publish: CARGO_REGISTRY_TOKEN is not set")
			process.exit(1)
		}
		const versions = new Map(crates.map((c) => [c.name, c.version]))
		for (const name of order) {
			const version = versions.get(name)
			if ((await publishedVersions(name)).includes(version)) {
				console.log(`skip ${name}@${version}: already on crates.io`)
				continue
			}
			console.log(`publish ${name}@${version}`)
			// A bootstrap run publishes many new crates at once and hits the rate limit; wait it out.
			for (let attempt = 1; ; attempt++) {
				const result = spawnSync("cargo", ["publish", "-p", name], {
					cwd: ROOT,
					stdio: ["inherit", "inherit", "pipe"],
					encoding: "utf8",
				})
				process.stderr.write(result.stderr ?? "")
				if (result.status === 0) break
				const at = retryAfter(result.stderr ?? "")
				if (!at || attempt >= 20) process.exit(result.status ?? 1)
				const ms = Math.max(0, at.getTime() - Date.now()) + 10000
				console.log(`rate limited: retry ${name} in ${Math.ceil(ms / 1000)}s`)
				await new Promise((resolve) => setTimeout(resolve, ms))
			}
			// The index needs a moment before dependents can resolve this version.
			await new Promise((resolve) => setTimeout(resolve, 15000))
		}
	} else if (args.includes("--release")) {
		release()
	} else if (args.includes("--print-new")) {
		for (const name of order) if ((await publishedVersions(name)).length === 0) console.log(name)
	} else if (args.includes("--trust")) {
		const token = process.env.CARGO_REGISTRY_TOKEN
		if (!token) {
			console.error("crates-publish: CARGO_REGISTRY_TOKEN is not set")
			process.exit(1)
		}
		for (const name of order) {
			const { github_configs } = await cratesApi(
				`/trusted_publishing/github_configs?crate=${encodeURIComponent(name)}`,
				token,
			)
			if (hasTrustedPublisher(github_configs)) {
				console.log(`skip ${name}: trusted publisher already set`)
				continue
			}
			await cratesApi("/trusted_publishing/github_configs", token, {
				method: "POST",
				body: JSON.stringify({ github_config: { crate: name, ...TRUSTED_PUBLISHER } }),
			})
			console.log(
				`trust ${name}: ${TRUSTED_PUBLISHER.workflow_filename} (${TRUSTED_PUBLISHER.environment})`,
			)
		}
	} else {
		console.error(
			"usage: crates-publish.mjs --check | --print | --check-features | --dry-run | --publish | --print-new | --trust | --release",
		)
		process.exit(2)
	}
}

/** `--exclude <name>` for every workspace member that is not published. */
function loadExcluded() {
	const result = run("cargo", ["metadata", "--format-version", "1", "--no-deps"])
	const kept = new Set(loadCrates().map((c) => c.name))
	return JSON.parse(result.stdout)
		.packages.filter((p) => !kept.has(p.name))
		.flatMap((p) => ["--exclude", p.name])
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
