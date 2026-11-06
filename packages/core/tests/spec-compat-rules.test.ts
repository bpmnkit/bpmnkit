import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
	CAMUNDA_COMPAT_PLUGIN_VERSION,
	CAMUNDA_COMPAT_RULES,
	CAMUNDA_COMPAT_VERSIONS,
	CRON_TIMER_SINCE,
	ELEMENT_SUPPORT,
	FEATURE_SINCE,
	FEEL_BUILTIN_SINCE,
	IMPLEMENTATION_SUPPORT,
	INBOUND_CONNECTOR_PROPERTY_SINCE,
	TIMER_SUPPORT,
} from "../src/bpmn/camunda-compat-data.js"

// spec/compat-rules.json is the single source for the Camunda compatibility tables (pnpm spec:gen).
const spec = JSON.parse(
	fs.readFileSync(
		path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../spec/compat-rules.json"),
		"utf8",
	),
) as {
	source: { pluginVersion: string }
	versions: string[]
	elementSupport: unknown
	implementationSupport: unknown
	timerSupport: Record<
		string,
		Record<
			string,
			Record<
				"interrupting" | "nonInterrupting",
				{ inEventSubProcess: string | null; elsewhere: string | null }
			>
		>
	>
	cronTimerSince: string
	featureSince: Record<string, { since: string }>
	feelBuiltinSince: unknown
	inboundConnectorPropertySince: unknown
	rules: unknown
}

describe("spec/compat-rules.json", () => {
	it("drives the facade's tables, keeping key order", () => {
		expect(CAMUNDA_COMPAT_PLUGIN_VERSION).toBe(spec.source.pluginVersion)
		expect([...CAMUNDA_COMPAT_VERSIONS]).toEqual(spec.versions)
		expect(ELEMENT_SUPPORT).toEqual(spec.elementSupport)
		expect(IMPLEMENTATION_SUPPORT).toEqual(spec.implementationSupport)
		expect(CRON_TIMER_SINCE).toBe(spec.cronTimerSince)
		expect(FEEL_BUILTIN_SINCE).toEqual(spec.feelBuiltinSince)
		expect(INBOUND_CONNECTOR_PROPERTY_SINCE).toEqual(spec.inboundConnectorPropertySince)
		expect(CAMUNDA_COMPAT_RULES).toEqual(spec.rules)
		expect(Object.keys(FEATURE_SINCE)).toEqual(Object.keys(spec.featureSince))
		expect(Object.entries(FEATURE_SINCE).map(([k, v]) => [k, v])).toEqual(
			Object.entries(spec.featureSince).map(([k, f]) => [k, f.since]),
		)
		expect(Object.keys(ELEMENT_SUPPORT)).toEqual(Object.keys(spec.elementSupport as object))
		expect(Object.keys(CAMUNDA_COMPAT_RULES)).toEqual(Object.keys(spec.rules as object))
	})

	it("only names known versions", () => {
		const text = JSON.stringify([
			spec.elementSupport,
			spec.implementationSupport,
			spec.timerSupport,
			spec.featureSince,
			spec.feelBuiltinSince,
			spec.inboundConnectorPropertySince,
		])
		for (const [, v] of text.matchAll(/"(\d+\.\d+)"/g)) expect(spec.versions).toContain(v)
	})

	it("builds TIMER_SUPPORT's functions from the 2x2 table", () => {
		expect(Object.keys(TIMER_SUPPORT)).toEqual(Object.keys(spec.timerSupport))
		for (const [event, props] of Object.entries(spec.timerSupport)) {
			expect(Object.keys(TIMER_SUPPORT[event] ?? {})).toEqual(Object.keys(props))
			for (const [property, cell] of Object.entries(props)) {
				const fn = TIMER_SUPPORT[event]?.[property as "timeCycle"]
				expect(fn?.(true, true)).toBe(cell.interrupting.inEventSubProcess)
				expect(fn?.(true, false)).toBe(cell.interrupting.elsewhere)
				expect(fn?.(false, true)).toBe(cell.nonInterrupting.inEventSubProcess)
				expect(fn?.(false, false)).toBe(cell.nonInterrupting.elsewhere)
			}
		}
	})

	it("keeps the plugin's timer rules", () => {
		expect(TIMER_SUPPORT["bpmn:StartEvent"]?.timeCycle(true, true)).toBeNull()
		expect(TIMER_SUPPORT["bpmn:StartEvent"]?.timeCycle(false, true)).toBe("1.0")
		expect(TIMER_SUPPORT["bpmn:BoundaryEvent"]?.timeCycle(true, false)).toBeNull()
		expect(TIMER_SUPPORT["bpmn:IntermediateCatchEvent"]?.timeCycle(false, false)).toBeNull()
	})
})
