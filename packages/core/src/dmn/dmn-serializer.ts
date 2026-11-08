import type { XmlElement } from "../types/xml-element.js"
import { serializeXml } from "../xml/xml-parser.js"
import type {
	DmnAssociation,
	DmnAuthorityRequirement,
	DmnBusinessKnowledgeModel,
	DmnDecision,
	DmnDecisionTable,
	DmnDefinitions,
	DmnDiagram,
	DmnInput,
	DmnInputData,
	DmnKnowledgeRequirement,
	DmnKnowledgeSource,
	DmnLiteralExpression,
	DmnOutput,
	DmnRule,
	DmnTextAnnotation,
} from "./dmn-model.js"

function textElement(text: string): XmlElement {
	return { name: "text", attributes: {}, children: [], text }
}

function serializeInput(input: DmnInput): XmlElement {
	const exprAttrs: Record<string, string> = { id: input.inputExpression.id }
	if (input.inputExpression.typeRef) {
		exprAttrs.typeRef = input.inputExpression.typeRef
	}

	const exprChildren: XmlElement[] = []
	if (input.inputExpression.text) {
		exprChildren.push(textElement(input.inputExpression.text))
	}

	const inputAttrs: Record<string, string> = { id: input.id }
	if (input.label) inputAttrs.label = input.label

	return {
		name: "input",
		attributes: inputAttrs,
		children: [
			{
				name: "inputExpression",
				attributes: exprAttrs,
				children: exprChildren,
			},
		],
	}
}

function serializeOutput(output: DmnOutput): XmlElement {
	const attrs: Record<string, string> = { id: output.id }
	if (output.label) attrs.label = output.label
	if (output.name) attrs.name = output.name
	if (output.typeRef) attrs.typeRef = output.typeRef

	const children: XmlElement[] = []
	if (output.outputValues) {
		children.push({
			name: "outputValues",
			attributes: {},
			children: [textElement(output.outputValues)],
		})
	}
	return { name: "output", attributes: attrs, children }
}

function serializeRule(rule: DmnRule): XmlElement {
	const children: XmlElement[] = []

	if (rule.description) {
		children.push({
			name: "description",
			attributes: {},
			children: [],
			text: rule.description,
		})
	}

	for (const entry of rule.inputEntries) {
		children.push({
			name: "inputEntry",
			attributes: { id: entry.id },
			children: [textElement(entry.text)],
		})
	}

	for (const entry of rule.outputEntries) {
		children.push({
			name: "outputEntry",
			attributes: { id: entry.id },
			children: [textElement(entry.text)],
		})
	}

	return {
		name: "rule",
		attributes: { id: rule.id },
		children,
	}
}

function serializeDecisionTable(table: DmnDecisionTable): XmlElement {
	const attrs: Record<string, string> = { id: table.id }
	// Written whenever the model has one, including `UNIQUE`. Omitting the
	// schema default looked tidy and broke the round trip: the parser reads
	// `hitPolicy="UNIQUE"` into the model, so dropping it here meant
	// `parse(export(m))` no longer equalled `m` — and a preserving write, which
	// checks itself against exactly that, had to throw away everything else it
	// was keeping about the file.
	if (table.hitPolicy) attrs.hitPolicy = table.hitPolicy
	if (table.aggregation) attrs.aggregation = table.aggregation

	const children: XmlElement[] = [
		...table.inputs.map(serializeInput),
		...table.outputs.map(serializeOutput),
		...table.rules.map(serializeRule),
	]

	return { name: "decisionTable", attributes: attrs, children }
}

function refElement(name: string, target: string | undefined): XmlElement[] {
	// A reference that parsed to nothing stays nothing: \`href="#undefined"\` would
	// read back as a reference to an element with that id.
	return target ? [{ name, attributes: { href: `#${target}` }, children: [] }] : []
}

function serializeInformationRequirements(decision: DmnDecision): XmlElement[] {
	return decision.informationRequirements.map((req) => ({
		name: "informationRequirement",
		attributes: { id: req.id },
		children: req.requiredDecision
			? refElement("requiredDecision", req.requiredDecision)
			: refElement("requiredInput", req.requiredInput),
	}))
}

function serializeKnowledgeRequirements(reqs: DmnKnowledgeRequirement[]): XmlElement[] {
	return reqs.map((req) => ({
		name: "knowledgeRequirement",
		attributes: { id: req.id },
		children: refElement("requiredKnowledge", req.requiredKnowledge),
	}))
}

function serializeAuthorityRequirements(reqs: DmnAuthorityRequirement[]): XmlElement[] {
	return reqs.map((req) => ({
		name: "authorityRequirement",
		attributes: { id: req.id },
		children: req.requiredDecision
			? refElement("requiredDecision", req.requiredDecision)
			: req.requiredInput
				? refElement("requiredInput", req.requiredInput)
				: refElement("requiredAuthority", req.requiredAuthority),
	}))
}

function serializeLiteralExpression(literal: DmnLiteralExpression): XmlElement {
	const attrs: Record<string, string> = {}
	if (literal.id) attrs.id = literal.id
	if (literal.typeRef) attrs.typeRef = literal.typeRef
	if (literal.expressionLanguage) attrs.expressionLanguage = literal.expressionLanguage
	return {
		name: "literalExpression",
		attributes: attrs,
		children: literal.text ? [textElement(literal.text)] : [],
	}
}

function serializeDecision(decision: DmnDecision): XmlElement {
	const children: XmlElement[] = []

	if (decision.extensionElements && decision.extensionElements.length > 0) {
		children.push({
			name: "extensionElements",
			attributes: {},
			children: decision.extensionElements,
		})
	}

	children.push(...serializeInformationRequirements(decision))
	children.push(...serializeKnowledgeRequirements(decision.knowledgeRequirements))
	children.push(...serializeAuthorityRequirements(decision.authorityRequirements))

	if (decision.decisionTable) {
		children.push(serializeDecisionTable(decision.decisionTable))
	}
	if (decision.literalExpression) {
		children.push(serializeLiteralExpression(decision.literalExpression))
	}

	const attrs: Record<string, string> = { id: decision.id }
	if (decision.name) attrs.name = decision.name

	return { name: "decision", attributes: attrs, children }
}

function serializeInputData(inputData: DmnInputData): XmlElement {
	const attrs: Record<string, string> = { id: inputData.id }
	if (inputData.name) attrs.name = inputData.name
	return { name: "inputData", attributes: attrs, children: [] }
}

function serializeKnowledgeSource(ks: DmnKnowledgeSource): XmlElement {
	const attrs: Record<string, string> = { id: ks.id }
	if (ks.name) attrs.name = ks.name
	return {
		name: "knowledgeSource",
		attributes: attrs,
		children: serializeAuthorityRequirements(ks.authorityRequirements),
	}
}

function serializeBusinessKnowledgeModel(bkm: DmnBusinessKnowledgeModel): XmlElement {
	const attrs: Record<string, string> = { id: bkm.id }
	if (bkm.name) attrs.name = bkm.name
	return {
		name: "businessKnowledgeModel",
		attributes: attrs,
		children: [
			...serializeKnowledgeRequirements(bkm.knowledgeRequirements),
			...serializeAuthorityRequirements(bkm.authorityRequirements),
		],
	}
}

function serializeTextAnnotation(ann: DmnTextAnnotation): XmlElement {
	const children: XmlElement[] = []
	if (ann.text) {
		children.push(textElement(ann.text))
	}
	return { name: "textAnnotation", attributes: { id: ann.id }, children }
}

function serializeAssociation(assoc: DmnAssociation): XmlElement {
	return {
		name: "association",
		attributes: {
			id: assoc.id,
			sourceRef: `#${assoc.sourceRef}`,
			targetRef: `#${assoc.targetRef}`,
		},
		children: [],
	}
}

function serializeDiagram(diagram: DmnDiagram): XmlElement {
	const shapes: XmlElement[] = diagram.shapes.map((shape) => ({
		name: "dmndi:DMNShape",
		attributes: { dmnElementRef: shape.dmnElementRef },
		children: [
			{
				name: "dc:Bounds",
				attributes: {
					height: String(shape.bounds.height),
					width: String(shape.bounds.width),
					x: String(shape.bounds.x),
					y: String(shape.bounds.y),
				},
				children: [],
			},
		],
	}))

	const edges: XmlElement[] = diagram.edges.map((edge) => ({
		name: "dmndi:DMNEdge",
		attributes: { dmnElementRef: edge.dmnElementRef },
		children: edge.waypoints.map((wp) => ({
			name: "di:waypoint",
			attributes: { x: String(wp.x), y: String(wp.y) },
			children: [],
		})),
	}))

	return {
		name: "dmndi:DMNDI",
		attributes: {},
		children: [
			{
				name: "dmndi:DMNDiagram",
				attributes: {},
				children: [...shapes, ...edges],
			},
		],
	}
}

/** Serialize a DmnDefinitions model to a DMN XML string. */
export function serializeDmn(definitions: DmnDefinitions): string {
	const attrs: Record<string, string> = {}

	// Namespace declarations
	for (const [prefix, uri] of Object.entries(definitions.namespaces)) {
		if (prefix === "") {
			attrs.xmlns = uri
		} else {
			attrs[`xmlns:${prefix}`] = uri
		}
	}

	attrs.id = definitions.id
	attrs.name = definitions.name
	attrs.namespace = definitions.namespace

	if (definitions.exporter) attrs.exporter = definitions.exporter
	if (definitions.exporterVersion) attrs.exporterVersion = definitions.exporterVersion

	// Modeler attributes
	for (const [key, value] of Object.entries(definitions.modelerAttributes)) {
		attrs[`modeler:${key}`] = value
	}

	const children: XmlElement[] = []

	for (const decision of definitions.decisions) {
		children.push(serializeDecision(decision))
	}
	for (const id of definitions.inputData) {
		children.push(serializeInputData(id))
	}
	for (const ks of definitions.knowledgeSources) {
		children.push(serializeKnowledgeSource(ks))
	}
	for (const bkm of definitions.businessKnowledgeModels) {
		children.push(serializeBusinessKnowledgeModel(bkm))
	}
	for (const ann of definitions.textAnnotations) {
		children.push(serializeTextAnnotation(ann))
	}
	for (const assoc of definitions.associations) {
		children.push(serializeAssociation(assoc))
	}

	if (definitions.diagram) {
		children.push(serializeDiagram(definitions.diagram))
	}

	const root: XmlElement = {
		name: "definitions",
		attributes: attrs,
		children,
	}

	return serializeXml(root)
}
