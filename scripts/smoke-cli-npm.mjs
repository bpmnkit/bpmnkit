#!/usr/bin/env node
// Packs @bpmnkit/cli, @bpmnkit/cli-legacy and this machine's platform package from the working
// tree, installs the tarballs into an empty project and runs the installed commands, so the
// npm launcher path is exercised without publishing anything. This is the offline equivalent of
// `npx @bpmnkit/cli@next --version`.
//
//   node scripts/smoke-cli-npm.mjs --bin target/release/bpmnkit[.exe]
import { spawnSync } from "node:child_process"
import {
	chmodSync,
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { platformKey } from "../packages/cli/lib/launch.js"
import { platformDir, stageBinary } from "./lib/cli-npm.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const win = process.platform === "win32"

const flag = process.argv.indexOf("--bin")
if (flag < 0 || !process.argv[flag + 1]) {
	console.error("usage: smoke-cli-npm.mjs --bin <path to the built bpmnkit binary>")
	process.exit(2)
}
const bin = resolve(process.argv[flag + 1])
const key = platformKey()
if (!key) {
	console.error(`no platform package for ${process.platform}-${process.arch}`)
	process.exit(2)
}

function run(cmd, args, cwd, env = {}) {
	const r = spawnSync(cmd, args, {
		cwd,
		encoding: "utf8",
		shell: win,
		env: { ...process.env, ...env },
	})
	return { code: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` }
}
function must(label, r) {
	if (r.code !== 0) {
		console.error(`✗ ${label} (exit ${r.code})\n${r.out}`)
		process.exit(1)
	}
	return r.out
}

// The binary goes into the platform package exactly as the release job stages it.
stageBinary(key, bin)
const platDir = platformDir(key)

const tarballs = mkdtempSync(join(tmpdir(), "bpmnkit-pack-"))
// `pnpm pack` turns `workspace:^` into the working-tree version, which a release commit has just
// bumped and the registry may not serve yet. So every workspace package the CLI needs at runtime
// is packed and installed from disk too, and the smoke never waits on a publish.
function workspaceClosure(roots) {
	const byName = new Map()
	for (const base of ["packages", "apps"]) {
		for (const d of readdirSync(join(ROOT, base), { withFileTypes: true })) {
			if (!d.isDirectory()) continue
			try {
				const dir = join(ROOT, base, d.name)
				const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))
				byName.set(pkg.name, { dir, pkg })
			} catch {}
		}
	}
	const seen = new Map()
	const visit = (dir) => {
		if (seen.has(dir)) return
		const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))
		seen.set(dir, pkg.name)
		// Optional deps are the other platforms' binaries; only this machine's is staged.
		for (const dep of Object.keys(pkg.dependencies ?? {})) {
			const ws = byName.get(dep)
			if (ws) visit(ws.dir)
		}
	}
	for (const r of roots) visit(r)
	return [...seen.keys()]
}

const packDirs = workspaceClosure([join(ROOT, "apps", "cli"), join(ROOT, "packages", "cli")])
for (const dir of [platDir, ...packDirs]) {
	must(`pnpm pack ${dir}`, run("pnpm", ["pack", "--pack-destination", tarballs], dir))
}
const files = readdirSync(tarballs).map((f) => join(tarballs, f))

const project = mkdtempSync(join(tmpdir(), "bpmnkit-smoke-"))
writeFileSync(join(project, "package.json"), '{"name":"smoke","private":true}\n')
must(
	"npm install <tarballs>",
	run("npm", ["install", "--no-audit", "--no-fund", "--ignore-scripts", ...files], project),
)

const expectVersion = /^bpmnkit \d+\.\d+\.\d+/m
// `@bpmnkit/cli` is what `npx @bpmnkit/cli …` runs: npm needs a single bin to pick one.
for (const name of ["bpmnkit", "@bpmnkit/cli"]) {
	const out = must(
		`${name} --version`,
		run("npm", ["exec", "--no-install", "--", name, "--version"], project),
	)
	if (!expectVersion.test(out)) {
		console.error(`✗ ${name} --version printed ${JSON.stringify(out)}`)
		process.exit(1)
	}
	console.log(`✓ ${name} --version: ${out.trim()}`)
}

// An npm install must not update itself behind the package manager's back.
const upd = run("npm", ["exec", "--no-install", "--", "bpmnkit", "self", "update"], project)
if (upd.code === 0 || !/installed through npm/.test(upd.out)) {
	console.error(`✗ self update should refuse on an npm install:\n${upd.out}`)
	process.exit(1)
}
console.log("✓ self update refuses on an npm install")
