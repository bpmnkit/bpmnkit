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
//
// Only workspace members with `publish` unset (or a registry list) are handled; the conformance
// crate stays `publish = false`. The `bpmnkit` facade depends on every other crate, so it is
// published last.
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
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

/** Whether `name@version` is already on crates.io, by the sparse index. */
async function published(name, version) {
	const n = name.toLowerCase()
	const path =
		n.length <= 2
			? `${n.length}/${n}`
			: n.length === 3
				? `3/${n[0]}/${n}`
				: `${n.slice(0, 2)}/${n.slice(2, 4)}/${n}`
	const response = await fetch(`https://index.crates.io/${path}`)
	if (response.status === 404) return false
	if (!response.ok) throw new Error(`crates.io index answered ${response.status} for ${name}`)
	const lines = (await response.text()).split("\n").filter(Boolean)
	return lines.some((line) => JSON.parse(line).vers === version)
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
		const problems = check(crates)
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
			if (await published(name, version)) {
				console.log(`skip ${name}@${version}: already on crates.io`)
				continue
			}
			console.log(`publish ${name}@${version}`)
			const status = cargo(["publish", "-p", name])
			if (status !== 0) process.exit(status)
			// The index needs a moment before dependents can resolve this version.
			await new Promise((resolve) => setTimeout(resolve, 15000))
		}
	} else {
		console.error(
			"usage: crates-publish.mjs --check | --print | --check-features | --dry-run | --publish",
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
