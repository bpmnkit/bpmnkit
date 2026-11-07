/**
 * Writes the descriptor-derived placement into `spec/elements/zeebe.json`.
 *
 *   pnpm --filter @bpmnkit/core generate:placement
 *   pnpm --filter @bpmnkit/core check:placement
 *
 * Flow: the vendored descriptors (`descriptors/zeebe.json` resolved against
 * `descriptors/bpmn.json`, see `zeebe-placement-table.ts`) are the source of the
 * placement. This script copies it into each element's `allowedIn` in
 * `spec/elements/zeebe.json`. Then `pnpm spec:gen` turns the spec into
 * `src/generated/zeebe-elements.ts` (`ZEEBE_ALLOWED_IN`), which
 * `src/bpmn/zeebe-placement.ts` re-exports as `ZEEBE_PLACEMENT`, and into the Rust
 * crate. After updating a descriptor, run this, format the spec with Biome, then
 * run `pnpm spec:gen`.
 *
 * `--check` fails if the spec's `allowedIn` differs from the descriptors. Only
 * `allowedIn` is touched: attributes, children and the rest of the spec are
 * hand-written.
 *
 * The resolution itself lives in `zeebe-placement-table.ts`, which the test
 * checking the table for staleness imports directly — the two must agree, and
 * calling the same function is the only way to be sure they do.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { computePlacementTable } from "./zeebe-placement-table.js"

const SPEC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
	"spec",
	"elements",
	"zeebe.json",
)

interface SpecElement {
	name: string
	allowedIn?: string[]
}

const spec = JSON.parse(readFileSync(SPEC, "utf-8")) as { elements: SpecElement[] }
const rows = computePlacementTable()
const owners = new Map(rows)

const known = new Set(spec.elements.map((element) => `zeebe:${element.name}`))
const missing = rows.map(([tag]) => tag).filter((tag) => !known.has(tag))
if (missing.length > 0) {
	console.error(`spec/elements/zeebe.json has no element for: ${missing.join(", ")}`)
	process.exit(1)
}

if (process.argv.includes("--check")) {
	// Compare the data, not the file: Biome owns the formatting of the spec.
	const stale = spec.elements.filter(
		(element) =>
			JSON.stringify(element.allowedIn) !== JSON.stringify(owners.get(`zeebe:${element.name}`)),
	)
	if (stale.length > 0) {
		console.error(
			[
				`spec/elements/zeebe.json allowedIn no longer matches the descriptors (${stale.map((element) => element.name).join(", ")}).`,
				"Run: pnpm --filter @bpmnkit/core generate:placement, format the spec with Biome, then pnpm spec:gen",
			].join("\n"),
		)
		process.exit(1)
	}
	console.log(`spec/elements/zeebe.json allowedIn is up to date (${rows.length} extensions).`)
} else {
	for (const element of spec.elements) {
		element.allowedIn = owners.get(`zeebe:${element.name}`)
	}
	writeFileSync(SPEC, JSON.stringify(spec, null, "\t"))
	console.log(`Wrote ${SPEC} (${rows.length} extensions). Run biome, then pnpm spec:gen.`)
}
