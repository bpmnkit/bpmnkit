#!/usr/bin/env node
// Changesets versions the crates as private `@crates/*` packages (crates/<name>/package.json,
// one fixed group). This copies that version into the Cargo manifests and lockfiles; run it right
// after `changeset version` (doc/rust-crates-release.md).
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

/** The one version shared by all `@crates/*` package.json files; throws on a mix. */
export function singleVersion(versions) {
	const set = new Set(versions)
	if (set.size !== 1)
		throw new Error(`crates must share one version, found: ${[...set].join(", ")}`)
	return [...set][0]
}

/**
 * Rewrites the version of the workspace package, of every `bpmnkit-* = { path = ...` entry in
 * `[workspace.dependencies]` and of the inline `bpmnkit-feel` path dependency in member manifests.
 * Path dependencies without a `version` (the unpublished conformance crate) stay untouched.
 */
export function syncCargo(text, version) {
	let section = ""
	return text
		.split("\n")
		.map((line) => {
			const header = line.match(/^\[(.+)\]\s*$/)
			if (header) section = header[1]
			if (section === "workspace.package" && /^version\s*=/.test(line)) {
				return `version = "${version}"`
			}
			if (/^bpmnkit[\w-]*\s*=\s*\{[^}]*\bpath\s*=/.test(line) && /\bversion\s*=\s*"/.test(line)) {
				return line.replace(/(\bversion\s*=\s*)"[^"]*"/, `$1"${version}"`)
			}
			return line
		})
		.join("\n")
}

function main() {
	const dir = join(ROOT, "crates")
	const versions = readdirSync(dir)
		.filter((n) => existsSync(join(dir, n, "package.json")))
		.map((n) => JSON.parse(readFileSync(join(dir, n, "package.json"), "utf8")).version)
	const version = singleVersion(versions)

	const manifests = [
		join(ROOT, "Cargo.toml"),
		...readdirSync(dir)
			.map((n) => join(dir, n, "Cargo.toml"))
			.filter((p) => existsSync(p)),
	]
	for (const path of manifests) {
		const before = readFileSync(path, "utf8")
		const after = syncCargo(before, version)
		if (after !== before) writeFileSync(path, after)
	}

	// Lockfiles: the root workspace, and apps/reebe, which consumes the crates by path.
	for (const manifest of ["Cargo.toml", "apps/reebe/Cargo.toml"]) {
		const r = spawnSync(
			"cargo",
			["update", "--workspace", "--manifest-path", join(ROOT, manifest)],
			{
				cwd: ROOT,
				stdio: "inherit",
			},
		)
		if (r.status !== 0) process.exit(r.status ?? 1)
	}
	console.log(`crates-version: ${version}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
