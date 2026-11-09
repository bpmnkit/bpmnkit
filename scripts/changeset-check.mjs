#!/usr/bin/env node
/**
 * Fails when a published package's runtime source changed against the base ref and no
 * `.changeset/*.md` names it. Without a changeset the package is never versioned or
 * published, so a dependent (the CLI) can import a symbol the npm release lacks.
 * `changeset status` only checks that *some* changeset exists, not one per package.
 *
 *   node scripts/changeset-check.mjs [--base origin/main]
 */
import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { PUBLISHED } from "./published-packages.mjs"

const TEST_OR_DOC = /(^|\/)(__tests__|test|tests)\/|\.(test|spec)\.[cm]?[jt]sx?$|\.md$/

/** Published packages with changed non-test files under `src/` and no changeset naming them. */
export function missingChangesets(changedFiles, changesetTexts, packages) {
	const named = changesetTexts.join("\n")
	return packages.filter(
		({ dir, name }) =>
			changedFiles.some((f) => f.startsWith(`${dir}/src/`) && !TEST_OR_DOC.test(f)) &&
			!named.includes(`"${name}"`),
	)
}

function main() {
	const i = process.argv.indexOf("--base")
	const base = i > 0 ? process.argv[i + 1] : "origin/main"
	const changed = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], {
		encoding: "utf8",
	})
		.split("\n")
		.filter(Boolean)
	const texts = readdirSync(".changeset")
		.filter((f) => f.endsWith(".md") && f !== "README.md")
		.map((f) => readFileSync(`.changeset/${f}`, "utf8"))
	const packages = PUBLISHED.map((dir) => ({
		dir,
		name: JSON.parse(readFileSync(`${dir}/package.json`, "utf8")).name,
	}))
	const missing = missingChangesets(changed, texts, packages)
	for (const m of missing) console.error(`${m.name}: src changed, no changeset names it`)
	if (missing.length > 0) {
		console.error("Add one with `pnpm changeset`.")
		process.exit(1)
	}
	console.log("changeset-check: every changed published package has a changeset")
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main()
