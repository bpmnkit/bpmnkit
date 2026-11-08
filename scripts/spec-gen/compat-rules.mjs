import { header, pascal, rustStr, tsJson } from "./util.mjs"

export const source = "spec/compat-rules.json"
export const schema = "spec/schema/compat-rules.schema.json"

const variant = (v) => `V${v.replace(".", "_")}`
const doc = (text, indent = "") => `${indent}/** ${text} */\n`

export function generate(spec) {
	const { versions } = spec
	const known = (v, where) => {
		if (!versions.includes(v)) throw new Error(`${where}: unknown version ${v}`)
	}
	const supports = (map, where) => {
		for (const [k, v] of Object.entries(map)) {
			if (typeof v === "string") known(v, `${where} ${k}`)
			else for (const [d, dv] of Object.entries(v)) known(dv, `${where} ${k} ${d}`)
		}
	}
	supports(spec.elementSupport, "elementSupport")
	for (const [kind, map] of Object.entries(spec.implementationSupport)) supports(map, kind)
	for (const [ev, props] of Object.entries(spec.timerSupport))
		for (const [p, cell] of Object.entries(props))
			for (const a of Object.values(cell))
				for (const v of Object.values(a)) if (v !== null) known(v, `timer ${ev} ${p}`)
	known(spec.cronTimerSince, "cronTimerSince")
	for (const [k, f] of Object.entries(spec.featureSince)) known(f.since, k)
	for (const [k, v] of Object.entries(spec.feelBuiltinSince)) known(v, k)
	for (const [k, p] of Object.entries(spec.inboundConnectorPropertySince)) known(p.since, k)
	for (const [k, r] of Object.entries(spec.rules)) {
		if (r.since) known(r.since, k)
		if (r.until) known(r.until, k)
	}

	const s = spec.source
	const ts = `${header(source)}
/** The \`${s.plugin}\` release these tables were taken from. */
export const CAMUNDA_COMPAT_PLUGIN_VERSION = ${JSON.stringify(s.pluginVersion)}

/**
 * The Camunda 8 (and Camunda Cloud 1.x) versions the plugin ships a
 * \`camunda-cloud-X-Y\` config for, oldest first.
 */
export const CAMUNDA_COMPAT_VERSIONS = ${tsJson(versions)} as const

/** A version in \`CAMUNDA_COMPAT_VERSIONS\`. */
export type CamundaCompatVersion = (typeof CAMUNDA_COMPAT_VERSIONS)[number]

/** \`_\` stands for "no event definition". */
export type EventSupport = Readonly<Record<string, CamundaCompatVersion>>

/**
 * First version supporting each element, keyed by BPMN type. Events map their
 * event definition (or \`_\` for none) to a version instead. A flow element whose
 * type is absent — \`bpmn:ComplexGateway\`, \`bpmn:Transaction\` — is supported by
 * no version.
 */
export const ELEMENT_SUPPORT: Readonly<Record<string, CamundaCompatVersion | EventSupport>> = ${tsJson(spec.elementSupport)}

/** The three ways Zeebe implements a task, as \`zeebe:\` extension element names. */
export type ImplementationKind = "calledDecision" | "script" | "taskDefinition"

/** First version each element accepts each implementation kind in. */
export const IMPLEMENTATION_SUPPORT: Readonly<
	Record<ImplementationKind, Readonly<Record<string, CamundaCompatVersion | EventSupport>>>
> = ${tsJson(spec.implementationSupport)}

/** The timer properties of \`bpmn:TimerEventDefinition\`. */
export type TimerProperty = "timeCycle" | "timeDate" | "timeDuration"

/** First version a timer property is allowed in, per interrupting and event sub-process placement. */
export interface TimerSupportCell {
	readonly interrupting: TimerSupportPair
	readonly nonInterrupting: TimerSupportPair
}

/** \`null\` means never. */
export interface TimerSupportPair {
	readonly inEventSubProcess: CamundaCompatVersion | null
	readonly elsewhere: CamundaCompatVersion | null
}

/**
 * First version each timer property is allowed in, per event type, as a 2x2
 * table (interrupting or not, in an event sub-process or elsewhere); \`null\`
 * means never.
 */
export const TIMER_SUPPORT_TABLE: Readonly<
	Record<string, Readonly<Record<TimerProperty, TimerSupportCell>>>
> = ${tsJson(spec.timerSupport)}

/** First version a timer cycle may be a cron expression rather than ISO 8601. */
export const CRON_TIMER_SINCE: CamundaCompatVersion = ${JSON.stringify(spec.cronTimerSince)}

/**
 * First version each property-level feature is supported in — the version
 * constants of the plugin's \`no-*\` rules, gathered in one place.
 */
export const FEATURE_SINCE = {
${Object.entries(spec.featureSince)
	.map(([k, f]) => `${doc(f.description, "\t")}\t${k}: ${JSON.stringify(f.since)},`)
	.join("\n")}
} as const satisfies Record<string, CamundaCompatVersion>

/**
 * First version each Camunda FEEL built-in function is available in, for
 * \`feel-compatibility\`. Functions every version has are absent.
 *
 * Taken from the \`engines.camunda\` ranges of \`${s.feelBuiltins}\` ${s.feelBuiltinsVersion}
 * (${s.license}, © ${s.copyright}) — \`camundaBuiltins\` and
 * \`camundaReservedNameBuiltins\` — the table the plugin ${s.pluginVersion} checks against.
 * Every range there is \`>=X.Y\`.
 */
export const FEEL_BUILTIN_SINCE: Readonly<Record<string, CamundaCompatVersion>> = ${tsJson(spec.feelBuiltinSince)}

/**
 * Inbound connector properties (\`zeebe:property\` names) that need a newer
 * Camunda version, and the \`inbound.type\` values of the connectors that take
 * them — \`rules/camunda-cloud/connector-properties/config.js\` of the plugin.
 */
export const INBOUND_CONNECTOR_PROPERTY_SINCE: Readonly<
	Record<string, { since: CamundaCompatVersion; connectors: readonly string[] }>
> = ${tsJson(spec.inboundConnectorPropertySince)}

/** Whether BPMN Kit runs a plugin rule, and how closely. */
export type CamundaCompatCoverage = "implemented" | "partial" | "existing" | "not-implemented"

/** One \`${s.plugin}\` rule. */
export interface CamundaCompatRule {
	/** The severity the plugin's configs give it. */
	severity: "error" | "warn"
	/** First config that enables it; absent for "every version". */
	since?: CamundaCompatVersion
	/** First config that no longer enables it; absent for "still enabled". */
	until?: CamundaCompatVersion
	/**
	 * - \`implemented\` — \`analyzeCamundaCompat\` reports it as \`compat/<rule>\`;
	 * - \`partial\` — reported, with the difference in \`note\`;
	 * - \`existing\` — another BPMN Kit finding (\`equivalents\`) reports the same problem;
	 * - \`not-implemented\` — not checked; \`note\` says why.
	 */
	coverage: CamundaCompatCoverage
	/** BPMN Kit findings outside \`compat/*\` that report the same problem. */
	equivalents?: readonly string[]
	note?: string
}

/**
 * Every rule of the plugin's \`camunda-cloud-*\` configs, with the versions it
 * is enabled for — \`index.js\` of the plugin, as data.
 */
export const CAMUNDA_COMPAT_RULES: Readonly<Record<string, CamundaCompatRule>> = ${tsJson(spec.rules)}
`

	const ver = (v) => `CamundaVersion::${variant(v)}`
	const optVer = (v) => (v ? `Some(${ver(v)})` : "None")
	const support = (v) =>
		typeof v === "string"
			? `ElementSupport::Since(${ver(v)})`
			: `ElementSupport::ByEventDefinition(&[${Object.entries(v)
					.map(([d, dv]) => `(${rustStr(d)}, ${ver(dv)})`)
					.join(", ")}])`
	const supportMap = (id, map, docText) =>
		`${docText}pub static ${id}: &[(&str, ElementSupport)] = &[\n${Object.entries(map)
			.map(([k, v]) => `    (${rustStr(k)}, ${support(v)}),`)
			.join("\n")}\n];\n`
	const pair = (p) =>
		`TimerPair { in_event_sub_process: ${optVer(p.inEventSubProcess)}, elsewhere: ${optVer(p.elsewhere)} }`
	const cell = (c) =>
		`TimerCell { interrupting: ${pair(c.interrupting)}, non_interrupting: ${pair(c.nonInterrupting)} }`
	const strSlice = (a) => `&[${a.map(rustStr).join(", ")}]`

	const rs = `${header(source)}
use crate::compat::{
    ElementSupport, Feature, ImplementationKind, InboundProperty, RuleCoverage, RuleSeverity,
    TimerCell, TimerEventSupport, TimerPair, CompatRule,
};

pub const PLUGIN_VERSION: &str = ${rustStr(s.pluginVersion)};

/// A Camunda 8 version a compatibility table knows, oldest first.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum CamundaVersion {
${versions.map((v) => `    ${variant(v)},`).join("\n")}
}

impl CamundaVersion {
    /// Every version, oldest first.
    pub const ALL: &'static [CamundaVersion] = &[${versions.map((v) => `CamundaVersion::${variant(v)}`).join(", ")}];

    /// The version as the plugin spells it, e.g. \`8.10\`.
    pub const fn as_str(self) -> &'static str {
        match self {
${versions.map((v) => `            CamundaVersion::${variant(v)} => ${rustStr(v)},`).join("\n")}
        }
    }

    /// The version spelled \`text\`, if it is one of \`ALL\`.
    pub fn parse(text: &str) -> Option<CamundaVersion> {
        match text {
${versions.map((v) => `            ${rustStr(v)} => Some(CamundaVersion::${variant(v)}),`).join("\n")}
            _ => None,
        }
    }
}

${supportMap("ELEMENT_SUPPORT", spec.elementSupport, "/// First version supporting each element, in the spec's order.\n")}
/// First version each element accepts each implementation kind in.
pub static IMPLEMENTATION_SUPPORT: &[(ImplementationKind, &[(&str, ElementSupport)])] = &[
${Object.entries(spec.implementationSupport)
	.map(
		([kind, map]) =>
			`    (ImplementationKind::${pascal(kind)}, &[\n${Object.entries(map)
				.map(([k, v]) => `        (${rustStr(k)}, ${support(v)}),`)
				.join("\n")}\n    ]),`,
	)
	.join("\n")}
];

/// First version each timer property is allowed in, per event type.
pub static TIMER_SUPPORT: &[TimerEventSupport] = &[
${Object.entries(spec.timerSupport)
	.map(
		([ev, p]) =>
			`    TimerEventSupport {\n        event_type: ${rustStr(ev)},\n        time_cycle: ${cell(p.timeCycle)},\n        time_date: ${cell(p.timeDate)},\n        time_duration: ${cell(p.timeDuration)},\n    },`,
	)
	.join("\n")}
];

pub const CRON_TIMER_SINCE: CamundaVersion = ${ver(spec.cronTimerSince)};

/// First version each property-level feature is supported in.
pub static FEATURE_SINCE: &[Feature] = &[
${Object.entries(spec.featureSince)
	.map(
		([k, f]) =>
			`    Feature { key: ${rustStr(k)}, since: ${ver(f.since)}, description: ${rustStr(f.description)} },`,
	)
	.join("\n")}
];

/// First version each Camunda FEEL built-in function is available in.
pub static FEEL_BUILTIN_SINCE: &[(&str, CamundaVersion)] = &[
${Object.entries(spec.feelBuiltinSince)
	.map(([k, v]) => `    (${rustStr(k)}, ${ver(v)}),`)
	.join("\n")}
];

/// Inbound connector properties that need a newer version, and the connectors that take them.
pub static INBOUND_CONNECTOR_PROPERTY_SINCE: &[InboundProperty] = &[
${Object.entries(spec.inboundConnectorPropertySince)
	.map(
		([k, p]) =>
			`    InboundProperty { name: ${rustStr(k)}, since: ${ver(p.since)}, connectors: ${strSlice(p.connectors)} },`,
	)
	.join("\n")}
];

/// Every rule of the plugin's camunda-cloud-* configs.
pub static RULES: &[CompatRule] = &[
${Object.entries(spec.rules)
	.map(
		([k, r]) =>
			`    CompatRule {\n        name: ${rustStr(k)},\n        severity: RuleSeverity::${pascal(r.severity)},\n        since: ${optVer(r.since)},\n        until: ${optVer(r.until)},\n        coverage: RuleCoverage::${pascal(r.coverage)},\n        equivalents: ${strSlice(r.equivalents ?? [])},\n        note: ${r.note ? `Some(${rustStr(r.note)})` : "None"},\n    },`,
	)
	.join("\n")}
];
`

	return {
		"packages/core/src/generated/camunda-compat-data.ts": ts,
		"crates/bpmnkit-spec/src/generated/compat_rules.rs": rs,
	}
}
