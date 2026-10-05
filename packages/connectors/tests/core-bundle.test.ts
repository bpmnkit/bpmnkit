import {
	BUNDLED_CONNECTOR_TEMPLATES,
	applyElementTemplate as applyCore,
	summarizeTemplate,
} from "@bpmnkit/core/connectors"
import type { ElementTemplate } from "@bpmnkit/core/connectors"
import { describe, expect, it } from "vitest"
import {
	CAMUNDA_CONNECTOR_TEMPLATES,
	applyConnectorTemplate,
	clearRegisteredTemplates,
	getTemplate,
	registerElementTemplates,
} from "../src/index.js"
import { TEMPLATE_PANEL_PARTS } from "../src/templates/generated.js"

/**
 * `@bpmnkit/core/connectors` bundles the templates without what only a property
 * panel draws, and this package adds those parts back. Both halves are written
 * by `scripts/update-connectors.mjs`; these tests fail when one is regenerated
 * without the other, or when the split moves something that changes what a
 * template does.
 */
const slimById = new Map(BUNDLED_CONNECTOR_TEMPLATES.map((t) => [t.id, t]))

/** A value for every property, so every binding — conditional ones included — is resolved. */
function valuesFor(template: ElementTemplate): Record<string, string> {
	const values: Record<string, string> = {}
	for (const p of template.properties) {
		if (p.type === "Hidden" || p.id === undefined) continue
		values[p.id] = p.choices?.[0]?.value ?? (p.type === "Boolean" ? "true" : "x")
	}
	return values
}

function withoutIcon<T extends object>(options: T | undefined): Omit<T, "modelerTemplateIcon"> {
	const { modelerTemplateIcon: _icon, ...rest } = (options ?? {}) as T & {
		modelerTemplateIcon?: string
	}
	return rest
}

describe("core connector bundle", () => {
	it("has panel parts for every template core bundles, and no others", () => {
		expect(Object.keys(TEMPLATE_PANEL_PARTS).sort()).toEqual(
			BUNDLED_CONNECTOR_TEMPLATES.map((t) => t.id).sort(),
		)
		for (const core of BUNDLED_CONNECTOR_TEMPLATES) {
			const parts = TEMPLATE_PANEL_PARTS[core.id]
			expect(parts?.properties.length ?? 0).toBeLessThanOrEqual(core.properties.length)
		}
	})

	it("puts the panel parts back", () => {
		const slack = CAMUNDA_CONNECTOR_TEMPLATES.find((t) => t.id === "io.camunda.connectors.Slack.v1")
		expect(slack?.groups?.length).toBeGreaterThan(0)
		expect(slack?.properties.some((p) => p.group !== undefined)).toBe(true)
		expect(slack?.icon?.contents).toMatch(/^data:image/)
	})

	it.each(CAMUNDA_CONNECTOR_TEMPLATES.map((t) => [t.id, t] as const))(
		"%s summarises and applies the same from both bundles",
		(id, full) => {
			const slim = slimById.get(id)
			if (!slim) throw new Error(`${id} is missing from the core bundle`)
			expect(summarizeTemplate(slim)).toEqual(summarizeTemplate(full))

			const values = valuesFor(full)
			const fromFull = applyCore(full, values)
			const fromSlim = applyCore(slim, values)
			expect(fromSlim.problems).toEqual(fromFull.problems)
			expect(withoutIcon(fromSlim.serviceTask)).toEqual(withoutIcon(fromFull.serviceTask))
			expect(withoutIcon(fromSlim.startEvent)).toEqual(withoutIcon(fromFull.startEvent))
			expect(withoutIcon(fromSlim.boundaryEvent)).toEqual(withoutIcon(fromFull.boundaryEvent))
			expect(withoutIcon(fromSlim.intermediateEvent)).toEqual(
				withoutIcon(fromFull.intermediateEvent),
			)
			expect(withoutIcon(fromSlim.adHocSubProcess)).toEqual(withoutIcon(fromFull.adHocSubProcess))
		},
	)
})

describe("full templates through this package", () => {
	it("getTemplate answers with the full template, icon included", () => {
		const template = getTemplate("io.camunda.connectors.Slack.v1")
		expect(template).toBe(
			CAMUNDA_CONNECTOR_TEMPLATES.find((t) => t.id === "io.camunda.connectors.Slack.v1"),
		)
		expect(template?.icon?.contents).toMatch(/^data:image/)
	})

	it("applyConnectorTemplate stamps the template icon", () => {
		const result = applyConnectorTemplate("io.camunda.connectors.HttpJson.v2", {
			url: "https://example.com",
		})
		expect(result.serviceTask?.modelerTemplateIcon).toMatch(/^data:image/)
	})

	it("returns a registered template as given, and reports an unknown id", () => {
		const own: ElementTemplate = {
			id: "io.camunda.connectors.Slack.v1",
			name: "Our Slack",
			appliesTo: ["bpmn:Task"],
			properties: [],
		}
		registerElementTemplates([own])
		try {
			expect(getTemplate(own.id)).toBe(own)
		} finally {
			clearRegisteredTemplates()
		}
		expect(applyConnectorTemplate("nope").problems[0]?.message).toMatch(/Unknown connector/)
	})
})
