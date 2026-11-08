import { header, pascal, rustStr, tsJson } from "./util.mjs"

export const source = "spec/lint-rules.json"
export const schema = "spec/schema/lint-rules.schema.json"

export function generate(spec) {
	const { rules, nativeOrder, standardSize, presets } = spec
	const names = rules.map((r) => r.name)
	const category = new Map(rules.filter((r) => r.category).map((r) => [r.name, r.category]))
	for (const n of nativeOrder)
		if (!category.has(n)) throw new Error(`native rule ${n} has no category`)
	for (const n of category.keys())
		if (!nativeOrder.includes(n)) throw new Error(`${n} is missing from nativeOrder`)
	for (const [p, map] of Object.entries(presets))
		for (const n of Object.keys(map))
			if (!names.includes(n)) throw new Error(`preset ${p}: unknown rule ${n}`)
	const categories = Object.fromEntries(nativeOrder.map((n) => [n, category.get(n)]))

	const ts = `${header(source)}import type { OptimizationCategory } from "../bpmn/optimize/types.js"

/** The bpmnlint release these rule names and presets are taken from. */
export const BPMNLINT_VERSION = ${JSON.stringify(spec.bpmnlintVersion)}

/** Every bpmnlint rule, in bpmnlint's order. */
export const RULE_NAMES_ALL = ${tsJson(names)} as const

/** The natively implemented rules, in check order, and the category of each. */
export const NATIVE_RULE_CATEGORIES: Readonly<Record<string, OptimizationCategory>> = ${tsJson(categories)}

/** Default sizes of the \`standard-size\` rule (bpmn-js's, as bpmnlint copies them). */
export const STANDARD_SIZE_DEFAULTS: Readonly<Record<string, { width: number; height: number }>> = ${tsJson(standardSize.defaults)}

/** bpmnlint's \`correctness\` preset. */
export const CORRECTNESS_PRESET: Readonly<Record<string, "off" | "warn" | "error" | "info">> = ${tsJson(presets.correctness)}

/** bpmnlint's \`recommended\` preset. */
export const RECOMMENDED_PRESET: Readonly<Record<string, "off" | "warn" | "error" | "info">> = ${tsJson(presets.recommended)}
`

	const sev = (s) => `Severity::${pascal(s)}`
	const preset = (id, map) =>
		`pub static ${id}: &[(&str, Severity)] = &[\n${Object.entries(map)
			.map(([n, s]) => `    (${rustStr(n)}, ${sev(s)}),`)
			.join("\n")}\n];\n`
	const rs = `${header(source)}
use crate::lint::{Category, LintRule, Severity, SizeDefault};

pub const BPMNLINT_VERSION: &str = ${rustStr(spec.bpmnlintVersion)};

/// Every bpmnlint rule, in bpmnlint's order.
pub static LINT_RULES: &[LintRule] = &[
${rules
	.map(
		(r) =>
			`    LintRule { name: ${rustStr(r.name)}, category: ${r.category ? `Some(Category::${pascal(r.category)})` : "None"} },`,
	)
	.join("\n")}
];

/// The natively implemented rules, in check order.
pub static NATIVE_ORDER: &[&str] = &[${nativeOrder.map(rustStr).join(", ")}];

pub static STANDARD_SIZE_DEFAULTS: &[SizeDefault] = &[
${Object.entries(standardSize.defaults)
	.map(
		([t, s]) =>
			`    SizeDefault { bpmn_type: ${rustStr(t)}, width: ${s.width}, height: ${s.height} },`,
	)
	.join("\n")}
];

${preset("CORRECTNESS", presets.correctness)}
${preset("RECOMMENDED", presets.recommended)}`

	return {
		"packages/core/src/generated/lint-rules.ts": ts,
		"crates/bpmnkit-spec/src/generated/lint_rules.rs": rs,
	}
}
