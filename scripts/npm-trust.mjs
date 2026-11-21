#!/usr/bin/env node
/**
 * Registers the GitHub Actions workflows as npm trusted publishers of the packages that need one
 * for the native CLI release (doc/release-setup.md, step 2). Wraps `npm trust` (recent npm; check
 * with `npm trust --help`). A package already trusting the right workflow is skipped; a config for
 * another workflow of this repo is revoked first, so `@bpmnkit/cli` stops trusting `release.yml`.
 *
 *   node scripts/npm-trust.mjs            print the plan (reads the current configs, changes nothing)
 *   node scripts/npm-trust.mjs --apply    revoke and create; npm asks for 2FA on each change
 *
 * Every package must exist on npm (step 1 publishes the placeholders) and you must be logged in
 * as an owner (`npm login`).
 */
import { spawnSync } from "node:child_process"
import { pathToFileURL } from "node:url"

export const REPOSITORY = "bpmnkit/bpmnkit"

/** Package → workflow file that publishes it. */
export const WANT = {
	"@bpmnkit/cli": "release-cli.yml",
	"@bpmnkit/cli-linux-x64": "release-cli.yml",
	"@bpmnkit/cli-linux-arm64": "release-cli.yml",
	"@bpmnkit/cli-darwin-x64": "release-cli.yml",
	"@bpmnkit/cli-darwin-arm64": "release-cli.yml",
	"@bpmnkit/cli-win32-x64": "release-cli.yml",
	"@bpmnkit/cli-legacy": "release.yml",
	"@bpmnkit/create-bpmnkit-plugin": "release.yml",
}

/**
 * `npm trust list --json` prints one pretty-printed JSON object per config, separated by blank
 * lines (not an array), and nothing when there is none.
 */
export function parseTrustList(stdout) {
	return stdout
		.split(/\n\s*\n/)
		.map((chunk) => chunk.trim())
		.filter((chunk) => chunk.startsWith("{"))
		.map((chunk) => JSON.parse(chunk))
}

/**
 * What to do for one package given its current configs: `revoke` lists ids to remove, `create`
 * is true when the wanted config is missing. Configs of other repositories or providers are
 * reported, never touched.
 */
export function planPackage(configs, file, repository = REPOSITORY) {
	const ours = configs.filter((c) => c.type === "github" && c.repository === repository)
	const ok = ours.some((c) => c.file === file && !c.environment)
	return {
		revoke: ok ? [] : ours.map((c) => c.id),
		create: !ok,
		foreign: configs.filter((c) => !ours.includes(c)),
	}
}

function npm(args, capture) {
	const r = spawnSync("npm", args, {
		stdio: capture ? ["inherit", "pipe", "inherit"] : "inherit",
		encoding: "utf8",
		shell: process.platform === "win32",
	})
	if (r.status !== 0) throw new Error(`npm ${args.join(" ")} exited ${r.status}`)
	return r.stdout ?? ""
}

function main() {
	const apply = process.argv.includes("--apply")
	try {
		npm(["trust", "--help"], true)
	} catch {
		console.error("`npm trust` is missing: update npm (npm i -g npm@latest)")
		process.exit(1)
	}
	console.log(`npm user: ${npm(["whoami"], true).trim()}`)

	let failed = 0
	for (const [pkg, file] of Object.entries(WANT)) {
		try {
			const configs = parseTrustList(npm(["trust", "list", pkg, "--json"], true))
			const { revoke, create, foreign } = planPackage(configs, file)
			for (const c of foreign)
				console.log(`! ${pkg}: other trust config left alone: ${JSON.stringify(c)}`)
			if (!create) {
				console.log(`✓ ${pkg}: trusts ${REPOSITORY} ${file}`)
				continue
			}
			for (const id of revoke) {
				console.log(`${apply ? "-" : "would revoke"} ${pkg}: config ${id}`)
				if (apply) npm(["trust", "revoke", pkg, `--id=${id}`])
			}
			console.log(`${apply ? "+" : "would add"} ${pkg}: ${REPOSITORY} ${file}`)
			if (apply)
				npm([
					"trust",
					"github",
					pkg,
					"--repo",
					REPOSITORY,
					"--file",
					file,
					"--allow-publish",
					"--yes",
				])
		} catch (e) {
			failed++
			console.error(`✗ ${pkg}: ${e.message}`)
		}
	}
	if (!apply) console.log("\nDry run. Run again with --apply to make the changes.")
	process.exit(failed ? 1 : 0)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main()
