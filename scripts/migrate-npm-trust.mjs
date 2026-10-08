/**
 * Moves the npm trusted-publishing configuration of every published package
 * from the old GitHub repository to the new one. One-off, for the rename of
 * bpmnkit/monorepo to bpmnkit/bpmnkit — see doc/repo-rename.md.
 *
 * The registry allows one trust configuration per package, so the old one has
 * to be revoked before the new one can be created. A package whose current
 * configuration names neither repository is left alone and reported.
 *
 *   node scripts/migrate-npm-trust.mjs           # dry run: list and plan
 *   node scripts/migrate-npm-trust.mjs --apply   # revoke + create
 *
 * Needs npm >= 11.15.0, `npm login` as an owner of the @bpmnkit packages, an
 * interactive terminal, and account-level 2FA. Every trust call — listing too —
 * asks for 2FA; tick "skip two-factor authentication for the next 5 minutes"
 * when the browser asks, or there is one prompt per call.
 */
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { PUBLISHED } from "./published-packages.mjs"

const OLD_REPO = "bpmnkit/monorepo"
const NEW_REPO = "bpmnkit/bpmnkit"
const WORKFLOW = "release.yml"
const apply = process.argv.includes("--apply")

// npm asks for 2FA only on a terminal; piped or redirected, every call fails with EOTP.
if (!process.stdin.isTTY || !process.stdout.isTTY) {
	console.error("Run this in an interactive terminal, without piping or redirecting its output.")
	process.exit(1)
}

/** Runs npm attached to the terminal, so it can ask for 2FA itself. */
function npm(args) {
	const result = spawnSync("npm", args, { stdio: "inherit" })
	if (result.status !== 0) throw new Error(`npm ${args.join(" ")} exited with ${result.status}`)
}

/**
 * The package's trust configurations, from `npm trust list --json`.
 *
 * Capturing the output means stdout is not a terminal, and npm only asks for
 * 2FA on a terminal — otherwise it fails with EOTP. On EOTP the same list runs
 * once attached to the terminal, to authenticate, and the capture is retried;
 * that retry succeeds only inside the "skip 2FA for 5 minutes" window.
 */
function configs(name) {
	const args = ["trust", "list", name, "--json"]
	let result = spawnSync("npm", args, { encoding: "utf8" })
	if (result.status !== 0 && result.stderr.includes("EOTP")) {
		console.log(
			`  2FA needed — authenticate in the browser and tick "skip 2FA for the next 5 minutes"`,
		)
		npm(["trust", "list", name])
		result = spawnSync("npm", args, { encoding: "utf8" })
	}
	if (result.status !== 0) {
		process.stderr.write(result.stderr)
		throw new Error(`npm ${args.join(" ")} exited with ${result.status}`)
	}
	// One pretty-printed JSON object per configuration, or nothing when there is none.
	return result.stdout
		.split(/^(?=\{)/m)
		.filter((chunk) => chunk.trim())
		.map((chunk) => JSON.parse(chunk))
}

const failed = []
for (const dir of PUBLISHED) {
	const { name } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))
	console.log(`\n${name}`)
	try {
		const current = configs(name)
		for (const c of current) console.log(`  current: ${JSON.stringify(c)}`)

		if (current.some((c) => c.repository === NEW_REPO)) {
			console.log(`  already trusts ${NEW_REPO} — skipping`)
			continue
		}
		const old = current.find((c) => c.repository === OLD_REPO)
		if (current.length > 0 && !old) {
			console.log(`  ! configuration does not name ${OLD_REPO} — left alone, check by hand`)
			failed.push(name)
			continue
		}

		const create = [
			"trust",
			"github",
			name,
			`--repo=${NEW_REPO}`,
			`--file=${old?.file ?? WORKFLOW}`,
			...(old?.environment ? [`--env=${old.environment}`] : []),
			"--allow-publish",
			"--yes",
		]
		if (old) console.log(`  npm trust revoke ${name} --id=${old.id}`)
		console.log(`  npm ${create.join(" ")}`)
		if (!apply) continue

		if (old) npm(["trust", "revoke", name, `--id=${old.id}`])
		npm(create)
	} catch (error) {
		console.error(`  ! ${name}: ${error.message}`)
		failed.push(name)
	}
}

console.log(apply ? "\nDone." : "\nDry run — nothing changed. Re-run with --apply.")
if (failed.length > 0) {
	console.error(`Needs attention: ${failed.join(", ")}`)
	process.exit(1)
}
