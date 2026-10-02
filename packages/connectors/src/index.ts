/**
 * The connector API lives in `@bpmnkit/core/connectors`; this package re-exports
 * it with the full Camunda templates. Core bundles the templates without icons,
 * groups, tooltips and placeholders; this package adds those back (it ships
 * only them, not a second copy of the catalog). {@link getTemplate} and
 * {@link applyConnectorTemplate} answer with the full template, so applied
 * elements carry their icon and a property panel can draw its groups.
 *
 * @packageDocumentation
 */
import {
	type ApplyResult,
	type ElementTemplate,
	applyConnectorTemplate as applyCoreTemplate,
	applyElementTemplate,
	getTemplate as getCoreTemplate,
} from "@bpmnkit/core/connectors"
import { CAMUNDA_CONNECTOR_TEMPLATES, WHOLE_BY_CORE_COPY } from "./panel-parts.js"

export {
	listConnectors,
	searchConnectors,
	propertyKey,
	registerElementTemplates,
	clearRegisteredTemplates,
	summarizeTemplate,
	applyElementTemplate,
	applyTemplateToElement,
	validateElementTemplate,
	readTemplateDocument,
	CONNECTOR_ALIASES,
	connectorAlias,
	connectorCards,
	findConnectorCards,
	formatConnectorCard,
	listConnectorCards,
	templateIdForAlias,
	CONNECT_GUIDE,
	applyConnectorLines,
	connectorLineFor,
	resolveConnectorLine,
} from "@bpmnkit/core/connectors"
export type {
	ConnectorSummary,
	ConnectorInputSpec,
	ConnectorDirection,
	ApplyResult,
	ApplyProblem,
	ApplyToElementResult,
	ElementTemplate,
	TemplateGroup,
	TemplateProperty,
	TemplateBinding,
	TemplateCondition,
	TemplateProblem,
	TemplateValidation,
	TemplateDocumentResult,
	CardInput,
	CardMode,
	ConnectorCard,
	AppliedConnectorLines,
	ResolvedConnectorLine,
} from "@bpmnkit/core/connectors"
export { CAMUNDA_CONNECTOR_TEMPLATES }

/** The full element template for a given template id, registered or bundled. */
export function getTemplate(id: string): ElementTemplate | undefined {
	const template = getCoreTemplate(id)
	// A registered template is returned as given; only core's bundled copies are made whole
	return template && (WHOLE_BY_CORE_COPY.get(template) ?? template)
}

/**
 * Applies a bundled Camunda 8 out-of-the-box connector element template by
 * id, from the full template, so the applied element carries its icon. See
 * `applyElementTemplate` for the binding-resolution behavior.
 */
export function applyConnectorTemplate(
	templateId: string,
	values: Record<string, string> = {},
): ApplyResult {
	const template = getTemplate(templateId)
	return template ? applyElementTemplate(template, values) : applyCoreTemplate(templateId, values)
}
