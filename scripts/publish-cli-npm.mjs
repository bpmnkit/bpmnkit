#!/usr/bin/env node
// Publishes @bpmnkit/cli (2.x, dist-tag `next`) and its five platform packages from the
// cargo-dist release archives. These packages are `private: true` in the tree so the changesets
// release can never ship them without binaries; this script is the only publisher, and it runs
// from .github/workflows/release-cli.yml after the GitHub release exists.
//
//   node scripts/publish-cli-npm.mjs --artifacts <dir>            stage, pack, print (dry run)
//   node scripts/publish-cli-npm.mjs --artifacts <dir> --publish  also `npm publish --tag next`
//
// pnpm only packs (it rewrites the `workspace:` ranges); npm publishes the tarball, because npm's
// own trusted publishing (OIDC, npm >= 11.5) works where `pnpm publish`'s token exchange got a 404.
// A version that is already on npm is skipped, so a re-run after a partial publish is safe.
//
// <dir> holds the release archives: bpmnkit-cli-<target-triple>.tar.xz / .zip.
import { spawnSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { PLATFORMS, releaseUrls } from "../packages/cli/lib/launch.js"
import { ROOT, platformDir, stageBinary } from "./lib/cli-npm.mjs"

const arg = (name) => {
	const i = process.argv.indexOf(name)
	return i >= 0 ? process.argv[i + 1] : undefined
}
const publish = process.argv.includes("--publish")
const artifacts = arg("--artifacts")
if (!artifacts) {
	console.error("usage: publish-cli-npm.mjs --artifacts <dir> [--publish]")
	process.exit(2)
}

function sh(cmd, args, cwd) {
	const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" })
	if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed (${r.status})`)
}

function onNpm(name, version) {
	const r = spawnSync("npm", ["view", `${name}@${version}`, "version"], {
		encoding: "utf8",
		shell: process.platform === "win32",
	})
	return r.status === 0 && r.stdout.trim() === version
}

/**
 * Packs `dir` with `private` dropped: the in-tree flag exists only to stop the changesets release.
 * The manifest is restored byte for byte afterwards.
 */
function packPublic(dir, dest) {
	const p = join(dir, "package.json")
	const original = readFileSync(p, "utf8")
	const pkg = JSON.parse(original)
	pkg.private = undefined
	// The launcher's download fallback fetches the GitHub release of the binary it was published
	// with: the Rust workspace version, which is what the release tag names.
	if (pkg.bpmnkit?.binaryVersion) pkg.bpmnkit.binaryVersion = CARGO_VERSION
	writeFileSync(p, `${JSON.stringify(pkg, null, "\t")}\n`)
	try {
		sh("pnpm", ["pack", "--pack-destination", dest], dir)
	} finally {
		writeFileSync(p, original)
	}
}

const CARGO_VERSION = readFileSync(join(ROOT, "Cargo.toml"), "utf8").match(
	/^\[workspace\.package\][^[]*?^version = "([^"]+)"/m,
)?.[1]
if (!CARGO_VERSION) throw new Error("no [workspace.package] version in Cargo.toml")

const launcher = join(ROOT, "packages", "cli")
const dirs = []
for (const key of Object.keys(PLATFORMS)) {
	const { file } = releaseUrls("x", key)
	const archive = resolve(artifacts, file)
	if (!existsSync(archive)) throw new Error(`missing release archive ${archive}`)
	const out = mkdtempSync(join(tmpdir(), `bpmnkit-${key}-`))
	// GNU tar on the ubuntu runner cannot read zip, so the Windows archive needs unzip.
	if (file.endsWith(".zip")) sh("unzip", ["-q", archive, "-d", out])
	else sh("tar", ["-xf", archive, "-C", out])
	const win = key.startsWith("win32")
	const exe = win ? "bpmnkit.exe" : "bpmnkit"
	// cargo-dist wraps the binary in a directory named after the archive.
	const wrapped = join(out, file.replace(/\.(tar\.xz|zip)$/, ""), exe)
	stageBinary(key, existsSync(wrapped) ? wrapped : join(out, exe))
	dirs.push(platformDir(key))
}
dirs.push(launcher) // after the platform packages, which it lists as optionalDependencies

console.log(`${publish ? "publishing" : "dry run:"} ${dirs.length} packages with --tag next`)
for (const dir of dirs) {
	const { name, version } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))
	if (publish && onNpm(name, version)) {
		console.log(`skip ${name}@${version}: already on npm`)
		continue
	}
	const packDir = mkdtempSync(join(tmpdir(), "bpmnkit-pack-"))
	packPublic(dir, packDir)
	const tarball = readdirSync(packDir).find((f) => f.endsWith(".tgz"))
	if (!tarball) throw new Error(`pnpm pack left no tarball for ${name}`)
	sh(
		"npm",
		[
			"publish",
			join(packDir, tarball),
			"--tag",
			"next",
			"--access",
			"public",
			...(publish ? [] : ["--dry-run"]),
		],
		dir,
	)
}
console.log(readdirSync(artifacts).length > 0 ? "done" : "done (empty artifacts?)")
