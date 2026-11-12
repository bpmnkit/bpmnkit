import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
	BPMNLINT_RULE_MAP,
	applyBpmnlintConfig,
	resolveBpmnlintConfig,
} from "../../src/bpmn/bpmnlint.js"
import { Bpmn } from "../../src/bpmn/index.js"
import { optimize } from "../../src/bpmn/optimize/index.js"
import { runBpmnlint } from "../../src/node/bpmnlint.js"

// Side by side with real bpmnlint (a root devDependency, like in ./bpmnlint.test.ts):
// under `bpmnlint:all`, every rule marked exact must report the same elements
// BPMN Kit reports under that rule, on every .bpmn file in the repository.

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url))
const CORE = fileURLToPath(new URL("../../", import.meta.url))
// `target` is Cargo's build directory: `cargo test` for apps/reebe runs in parallel
// under turbo and creates and removes directories there while this walk reads it.
const SKIP = new Set(["node_modules", "dist", ".git", ".turbo", ".astro", "target"])

function bpmnFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory()) return SKIP.has(entry.name) ? [] : bpmnFiles(join(dir, entry.name))
		return entry.name.endsWith(".bpmn") ? [join(dir, entry.name)] : []
	})
}

// Layout conformance inputs that are malformed on purpose, so neither side has an
// answer to compare: one has no ids (BPMN Kit's parser refuses it), the other gives
// two elements one DI id (bpmnlint resolves DI by id, so it sees only one of them).
// The builder cases' inputs and outputs have ids that are not XML names, which
// bpmn-moddle skips, on purpose: they pin that continuing a document reads such ids
// whole and that the build-time XSD check leaves a parsed document's ids alone.
// The deployability repro z07 has a nested id that is not an XML name, to pin that Zeebe
// rejects it.
const MALFORMED = new Set([
	"conformance/layout/edge-no-di-no-ids/input.bpmn",
	"conformance/layout/edge-existing-di-duplicate-id/input.bpmn",
	"conformance/builder/from-insert-after-arrow-in-id/input.bpmn",
	"conformance/builder/from-insert-after-arrow-in-id/expected/output.bpmn",
	"conformance/builder/xsd-continue-keeps-invalid-ids/input.bpmn",
	"conformance/builder/xsd-continue-keeps-invalid-ids/expected/output.bpmn",
	// zeebe-rules.md section A: XSD-invalid on purpose (Zeebe's parse stage).
	"conformance/validate/z01-bad-end-tag/input.bpmn",
	"conformance/validate/z02-bad/input.bpmn",
	"conformance/validate/z03-bad/input.bpmn",
	"conformance/validate/z04-bad/input.bpmn",
	"conformance/validate/z05-bad/input.bpmn",
	"conformance/validate/z07-bad/input.bpmn",
	"conformance/validate/z07-bad-ncname/input.bpmn",
	"conformance/validate/z08-bad/input.bpmn",
	"conformance/validate/z10-bad/input.bpmn",
	"doc/deployability/repro/z07_ncname_nested.bpmn",
	// Viewer golden inputs with no XML at all, to pin the empty-viewer page.
	"crates/bpmnkit-viewer/tests/golden/blank.bpmn",
	"crates/bpmnkit-viewer/tests/golden/empty.bpmn",
])

const FILES = bpmnFiles(ROOT)
	.map((file) => relative(ROOT, file))
	.filter((file) => !MALFORMED.has(file))
	.sort()
const ALL = resolveBpmnlintConfig({ extends: "bpmnlint:all" })
const EXACT = Object.entries(BPMNLINT_RULE_MAP)
	.filter(([, mapping]) => mapping.match === "exact")
	.map(([rule]) => rule)

/** Rule → sorted element ids, from a list of (rule, element ids) pairs. */
function byRule(reports: [string, string[]][]): Record<string, string[]> {
	const sets = new Map<string, Set<string>>()
	for (const [rule, ids] of reports) {
		const set = sets.get(rule) ?? new Set<string>()
		for (const id of ids) set.add(id)
		sets.set(rule, set)
	}
	return Object.fromEntries(EXACT.map((rule) => [rule, [...(sets.get(rule) ?? [])].sort()]))
}

const reported = new Map<string, number>()

describe("parity with bpmnlint under bpmnlint:all", () => {
	it("finds the repository's .bpmn files", () => {
		expect(FILES.length).toBeGreaterThanOrEqual(40)
		expect(FILES).toContain("packages/core/tests/fixtures/bpmnlint/scopes-and-exemptions.bpmn")
	})

	it.each(FILES)("%s", async (file) => {
		const xml = readFileSync(join(ROOT, file), "utf-8")
		const result = await runBpmnlint(xml, { extends: "bpmnlint:all" }, CORE)
		expect(result.status).toBe("ok")
		if (result.status !== "ok") return
		const theirs = byRule(
			result.reports.map((r) => [r.rule, r.elementId === undefined ? [] : [r.elementId]]),
		)

		const defs = Bpmn.parse(xml)
		const { findings } = applyBpmnlintConfig(defs, optimize(defs).findings, ALL)
		const ours = byRule(
			findings.flatMap((f) =>
				// A finding about a whole process (no start event, say) names no element;
				// bpmnlint reports it on the process, so compare by the process id.
				f.bpmnlintRule === undefined
					? []
					: [[f.bpmnlintRule, f.elementIds.length > 0 ? f.elementIds : [f.processId]]],
			),
		)

		expect(ours).toEqual(theirs)
		for (const [rule, ids] of Object.entries(theirs)) {
			reported.set(rule, (reported.get(rule) ?? 0) + ids.length)
		}
	})

	it("exercises every rule that used to be approximate", () => {
		for (const rule of [
			"conditional-flows",
			"fake-join",
			"label-required",
			"no-gateway-join-fork",
			"no-implicit-end",
			"no-implicit-start",
			"superfluous-gateway",
		]) {
			expect(reported.get(rule) ?? 0, rule).toBeGreaterThan(0)
		}
	})
})
