import { readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { header, pascal, rustStr, rustStrSlice, tsJson } from "./util.mjs"

// Element families: every spec/elements/<family>.json is validated against the schema
// (see spec-gen.mjs, which lists each file as one area). Only families in EMITTED generate code.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..")

export const schema = "spec/schema/elements.schema.json"
export const sources = readdirSync(join(ROOT, "spec/elements"))
	.filter((f) => f.endsWith(".json"))
	.sort()
	.map((f) => `spec/elements/${f}`)
export const source = sources[0]

const EMITTED = new Set(["form", "bpmn", "zeebe"])

/** Checks the cross-references the JSON schema cannot express. */
function check(spec) {
	const names = new Set()
	const traits = new Set((spec.traits ?? []).map((t) => t.name))
	for (const e of spec.elements) {
		if (names.has(e.name)) throw new Error(`${spec.family}: duplicate element ${e.name}`)
		names.add(e.name)
		for (const t of e.traits ?? [])
			if (!traits.has(t)) throw new Error(`${spec.family}.${e.name}: undeclared trait ${t}`)
		for (const a of e.attributes ?? []) {
			if ((a.type === "enum") !== (a.values !== undefined))
				throw new Error(`${spec.family}.${e.name}.${a.name}: \`values\` goes with type enum only`)
		}
	}
	for (const e of spec.elements)
		if (e.extends && !e.extends.includes(":") && !names.has(e.extends))
			throw new Error(`${spec.family}.${e.name}: unknown base ${e.extends}`)
}

export function generate(spec) {
	check(spec)
	if (!EMITTED.has(spec.family)) return {}
	const src = `spec/elements/${spec.family}.json`
	const fam = spec.family
	const upper = fam.toUpperCase()
	const traitNames = (spec.traits ?? []).map((t) => t.name)
	const byTrait = Object.fromEntries(
		traitNames.map((t) => [
			t,
			spec.elements.filter((e) => e.traits?.includes(t)).map((e) => e.name),
		]),
	)
	// Placement table for families that constrain parents (Zeebe): keyed by the qualified
	// element name, values as written in the spec. Absent for families with no `allowedIn`.
	const placed = spec.elements.filter((e) => e.allowedIn)
	const qualified = (e) => (spec.namespace ? `${spec.namespace.prefix}:${e.name}` : e.name)
	const tsPlacement = placed.length
		? `
/**
 * Where each ${fam} element may be placed: qualified element name → the parents (\`name\` or
 * \`family:name\`) it may sit directly in. Elements without \`allowedIn\` are absent.
 */
export const ${upper}_ALLOWED_IN: Readonly<Record<string, readonly string[]>> = ${tsJson(Object.fromEntries(placed.map((e) => [qualified(e), e.allowedIn])))}
`
		: ""
	const rsPlacement = placed.length
		? `
/// Where each ${fam} element may be placed: qualified element name and its allowed parents.
pub static ${upper}_ALLOWED_IN: &[(&str, &[&str])] = &[
${placed.map((e) => `    (${rustStr(qualified(e))}, ${rustStrSlice(e.allowedIn)}),`).join("\n")}
];
`
		: ""
	const ts = `${header(src)}
/** Every ${fam} element, in the spec's order. */
export const ${upper}_ELEMENT_NAMES = ${tsJson(spec.elements.map((e) => e.name))} as const

/** The elements carrying each trait, in the spec's order. */
export const ${upper}_ELEMENTS_BY_TRAIT: Readonly<Record<${traitNames.map((t) => JSON.stringify(t)).join(" | ")}, readonly string[]>> = ${tsJson(byTrait)}
${tsPlacement}`

	const opt = (v, f) => (v === undefined ? "None" : `Some(${f(v)})`)
	const slice = (items, f) => (items?.length ? `&[${items.map(f).join(", ")}]` : "&[]")
	const defaultOf = (v) =>
		typeof v === "string"
			? `DefaultValue::Str(${rustStr(v)})`
			: typeof v === "boolean"
				? `DefaultValue::Bool(${v})`
				: `DefaultValue::Num(${Number.isInteger(v) ? `${v}.0` : v})`
	const attr = (a) =>
		`AttributeDef { name: ${rustStr(a.name)}, ty: AttributeType::${pascal(a.type)}, values: ${slice(a.values, rustStr)}, default: ${opt(a.default, defaultOf)}, required: ${a.required === true} }`
	const child = (c) =>
		`ChildDef { element: ${rustStr(c.element)}, multiplicity: Multiplicity::${{ 1: "One", "0..1": "Optional", "0..*": "Many", "1..*": "OneOrMore" }[c.multiplicity ?? "0..*"]} }`
	const traitList = (e) => slice(e.traits, (t) => `${pascal(fam)}Trait::${pascal(t)}`)
	const rs = `${header(src)}
// A family without attributes or children leaves some of these unused.
#[allow(unused_imports)]
use crate::elements::{
    AttributeDef, AttributeType, ChildDef, DefaultValue, ElementDef, ElementFamily, Multiplicity,
    ${pascal(fam)}Trait, Namespace,
};

pub static ${upper}_ELEMENTS: ElementFamily<${pascal(fam)}Trait> = ElementFamily {
    family: ${rustStr(fam)},
    namespace: ${opt(spec.namespace, (n) => `Namespace { prefix: ${rustStr(n.prefix)}, uri: ${rustStr(n.uri)} }`)},
    source: ${rustStr(spec.source)},
    elements: &[
${spec.elements
	.map(
		(e) =>
			`        ElementDef { name: ${rustStr(e.name)}, extends: ${opt(e.extends, rustStr)}, is_abstract: ${e.abstract === true}, attributes: ${slice(e.attributes, attr)}, children: ${slice(e.children, child)}, allowed_in: ${slice(e.allowedIn, rustStr)}, traits: ${traitList(e)} },`,
	)
	.join("\n")}
    ],
};
${rsPlacement}`
	return {
		[`packages/core/src/generated/${fam}-elements.ts`]: ts,
		[`crates/bpmnkit-spec/src/generated/${fam}_elements.rs`]: rs,
	}
}
