import { BUNDLED_CONNECTOR_TEMPLATES, type ElementTemplate } from "@bpmnkit/core/connectors"
import { TEMPLATE_PANEL_PARTS } from "./templates/generated.js"

/**
 * What `@bpmnkit/core/connectors` leaves out of a bundled template: the parts
 * only a property panel draws. Both halves are written from one fetch by
 * `scripts/update-connectors.mjs`, so the catalog is never shipped twice.
 */
export interface TemplatePanelParts {
	template: Pick<ElementTemplate, "groups" | "icon"> & Record<string, unknown>
	/** By position in the core template's `properties`; missing entries have none. */
	properties: Array<{ group?: string; placeholder?: string; tooltip?: string }>
}

function join(core: ElementTemplate): ElementTemplate {
	const parts = TEMPLATE_PANEL_PARTS[core.id]
	if (!parts) return core
	return {
		...parts.template,
		...core,
		properties: core.properties.map((p, i) => ({ ...p, ...parts.properties[i] })),
	}
}

/** Every bundled template, whole: core's copy with its panel parts put back. */
export const CAMUNDA_CONNECTOR_TEMPLATES: ElementTemplate[] = BUNDLED_CONNECTOR_TEMPLATES.map(join)

/** The whole template for each of core's bundled copies. */
export const WHOLE_BY_CORE_COPY = new Map(
	BUNDLED_CONNECTOR_TEMPLATES.map((core, i) => [
		core,
		CAMUNDA_CONNECTOR_TEMPLATES[i] as ElementTemplate,
	]),
)
