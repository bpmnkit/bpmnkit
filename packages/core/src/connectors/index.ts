/**
 * The Camunda 8 out-of-the-box connector catalog and deterministic
 * element-template application, as `@bpmnkit/core/connectors`.
 *
 * A separate entry so the catalog's data (about 100 KB gzipped) is only paid
 * for by code that imports it; `@bpmnkit/core` itself does not grow. The
 * bundled templates leave out icons, groups, tooltips and placeholders, which
 * only a property panel draws — `@bpmnkit/connectors` has the full templates
 * and re-exports this API on top of them.
 *
 * @packageDocumentation
 */
export {
	listConnectors,
	searchConnectors,
	getTemplate,
	propertyKey,
	registerElementTemplates,
	clearRegisteredTemplates,
	summarizeTemplate,
} from "./catalog.js"
export type { ConnectorSummary, ConnectorInputSpec, ConnectorDirection } from "./catalog.js"
export { applyConnectorTemplate, applyElementTemplate } from "./apply.js"
export type { ApplyResult, ApplyProblem } from "./apply.js"
export { applyTemplateToElement } from "./apply-element.js"
export type { ApplyToElementResult } from "./apply-element.js"
export { BUNDLED_CONNECTOR_TEMPLATES } from "./templates/generated.js"
export { CONNECTOR_ALIASES } from "./aliases.js"
export {
	connectorAlias,
	connectorCards,
	findConnectorCards,
	formatConnectorCard,
	listConnectorCards,
	templateIdForAlias,
} from "./cards.js"
export type { CardInput, CardMode, ConnectorCard } from "./cards.js"
export type {
	ElementTemplate,
	TemplateGroup,
	TemplateProperty,
	TemplateBinding,
	TemplateCondition,
} from "./template-types.js"
export { validateElementTemplate, readTemplateDocument } from "./validate.js"
export type {
	TemplateProblem,
	TemplateValidation,
	TemplateDocumentResult,
} from "./validate.js"
