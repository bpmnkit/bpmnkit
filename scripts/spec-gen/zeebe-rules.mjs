import { header, pascal, rustStr } from "./util.mjs"

export const source = "spec/zeebe-rules.json"
export const schema = "spec/schema/zeebe-rules.schema.json"

export function generate(spec) {
	const ids = new Set()
	const names = new Set()
	for (const r of spec.rules) {
		if (ids.has(r.id)) throw new Error(`duplicate zeebe rule id ${r.id}`)
		if (names.has(r.name)) throw new Error(`duplicate zeebe rule name ${r.name}`)
		if (r.check === "none" && r.note === undefined)
			throw new Error(`${r.id}: check "none" needs a note`)
		for (const c of r.coveredBy ?? [])
			if (!spec.rules.some((o) => o.id === c)) throw new Error(`${r.id}: coveredBy unknown ${c}`)
		ids.add(r.id)
		names.add(r.name)
	}
	const tsRule = (r) =>
		`\t{ id: ${JSON.stringify(r.id)}, name: ${JSON.stringify(r.name)}, kind: ${JSON.stringify(r.kind)}, severity: ${JSON.stringify(r.severity)}, check: ${JSON.stringify(r.check)}, since: ${JSON.stringify(r.since)}${r.until ? `, until: ${JSON.stringify(r.until)}` : ""}, message: ${JSON.stringify(r.messages[0])} },`
	const ts = `${header(source)}
/** How BPMN Kit decides a Zeebe rule (see spec/schema/zeebe-rules.schema.json). */
export type ZeebeRuleCheck = "model" | "xml" | "context" | "none"

/** One Zeebe deployment rule; the finding id is \`zeebe/<name>\`. */
export interface ZeebeRuleMeta {
	id: string
	name: ZeebeRuleName
	kind: "static" | "feel" | "context"
	severity: "error" | "warning" | "info"
	check: ZeebeRuleCheck
	/** First Camunda version the rule applies to. */
	since: string
	/** Last Camunda version the rule applies to, when Zeebe dropped it. */
	until?: string
	/** Zeebe's first message for the rule, \`%s\` for a placeholder. */
	message: string
}

/** The \`<name>\` of every rule, so a check can only report a rule the spec has. */
export type ZeebeRuleName =
${spec.rules.map((r) => `\t| ${JSON.stringify(r.name)}`).join("\n")}

/** The Camunda version validation targets when none is given. */
export const ZEEBE_LATEST_VERSION = ${JSON.stringify(spec.latestVersion)}

/** The Zeebe version the rules were last checked against with tools/zeebe-check. */
export const ZEEBE_VERIFIED_VERSION = ${JSON.stringify(spec.source.verifiedAgainst)}

/** Every Zeebe deployment rule, in \`zeebe-rules.md\` order. */
export const ZEEBE_RULES: readonly ZeebeRuleMeta[] = [
${spec.rules.map(tsRule).join("\n")}
]
`
	const rsRule = (r) =>
		`    ZeebeRule { id: ${rustStr(r.id)}, name: ${rustStr(r.name)}, kind: RuleKind::${pascal(r.kind)}, severity: RuleSeverity::${pascal(r.severity)}, check: RuleCheck::${pascal(r.check)}, since: ${rustStr(r.since)}, until: ${r.until ? `Some(${rustStr(r.until)})` : "None"}, message: ${rustStr(r.messages[0])} },`
	const rs = `${header(source)}
use crate::zeebe::{RuleCheck, RuleKind, RuleSeverity, ZeebeRule};

/// The Camunda version validation targets when none is given.
pub const ZEEBE_LATEST_VERSION: &str = ${rustStr(spec.latestVersion)};

/// The Zeebe version the rules were last checked against with tools/zeebe-check.
pub const ZEEBE_VERIFIED_VERSION: &str = ${rustStr(spec.source.verifiedAgainst)};

/// Every Zeebe deployment rule, in \`zeebe-rules.md\` order.
pub static ZEEBE_RULES: &[ZeebeRule] = &[
${spec.rules.map(rsRule).join("\n")}
];
`
	return {
		"packages/core/src/generated/zeebe-rules.ts": ts,
		"crates/bpmnkit-spec/src/generated/zeebe_rules.rs": rs,
	}
}
