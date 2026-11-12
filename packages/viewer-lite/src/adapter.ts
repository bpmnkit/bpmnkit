import type { BpmnDefinitions } from "@bpmnkit/core/svg"

/*
 * A DOMParser reader for just the fields `exportSvg` draws from. The full
 * `@bpmnkit/core` parser is ~10x the viewer's size budget, so this mirrors its
 * output for those fields only; tests compare both renders on fixtures.
 */

type Obj = Record<string, unknown>

const kids = (e: Element, ...names: string[]): Element[] =>
	Array.from(e.children).filter((c) => names.length === 0 || names.includes(c.localName))
const kid = (e: Element, name: string): Element | undefined => kids(e, name)[0]
const attr = (e: Element, name: string): string | undefined => e.getAttribute(name) ?? undefined
const num = (e: Element, name: string): number => Number(attr(e, name) ?? 0)
const bool = (e: Element, name: string): boolean | undefined => {
	const v = attr(e, name)
	return v === undefined ? undefined : v === "true"
}

const FLOW_NODE =
	/(Event|Task|Gateway)$|^(task|callActivity|subProcess|adHocSubProcess|transaction|dataObject(Reference)?|dataStoreReference)$/
const CONTAINERS = new Set(["subProcess", "adHocSubProcess", "eventSubProcess", "transaction"])

function flowElement(e: Element): Obj {
	const type = e.localName
	const el: Obj = { id: attr(e, "id"), type, name: attr(e, "name") }
	if (type.endsWith("Event")) {
		el.eventDefinitions = kids(e)
			.filter((c) => c.localName.endsWith("EventDefinition"))
			.map((c) => ({ type: c.localName.slice(0, -15) }))
		el.cancelActivity = bool(e, "cancelActivity")
	}
	const loop = kid(e, "multiInstanceLoopCharacteristics")
	if (loop) el.loopCharacteristics = { isSequential: bool(loop, "isSequential") }
	if (bool(e, "isForCompensation")) el.isForCompensation = true
	if (bool(e, "isCollection")) el.isCollection = true
	el.default = attr(e, "default")
	if (CONTAINERS.has(type)) Object.assign(el, flowContents(e))
	return el
}

function flowContents(e: Element): Obj {
	return {
		flowElements: kids(e)
			.filter((c) => FLOW_NODE.test(c.localName))
			.map(flowElement),
		sequenceFlows: kids(e, "sequenceFlow").map((c) => ({
			id: attr(c, "id"),
			name: attr(c, "name"),
		})),
	}
}

const annotations = (e: Element): Obj[] =>
	kids(e, "textAnnotation").map((c) => ({
		id: attr(c, "id"),
		text: kid(c, "text")?.textContent ?? undefined,
	}))
const groups = (e: Element): Obj[] =>
	kids(e, "group").map((c) => ({
		id: attr(c, "id"),
		categoryValueRef: attr(c, "categoryValueRef"),
	}))

function laneSet(e: Element | undefined): Obj | undefined {
	if (!e) return undefined
	return {
		lanes: kids(e, "lane").map((l) => ({
			id: attr(l, "id"),
			name: attr(l, "name"),
			childLaneSet: laneSet(kid(l, "childLaneSet")),
		})),
	}
}

const bounds = (e: Element | undefined): Obj | undefined =>
	e && { x: num(e, "x"), y: num(e, "y"), width: num(e, "width"), height: num(e, "height") }

function diLabel(e: Element): Obj | undefined {
	const l = kid(e, "BPMNLabel")
	if (!l) return undefined
	return { bounds: bounds(kid(l, "Bounds")) }
}

function diagram(d: Element): Obj {
	const p = kid(d, "BPMNPlane")
	const items = p ? kids(p) : []
	return {
		id: attr(d, "id"),
		plane: {
			id: p && attr(p, "id"),
			bpmnElement: p && attr(p, "bpmnElement"),
			shapes: items
				.filter((s) => s.localName === "BPMNShape")
				.map((s) => ({
					id: attr(s, "id"),
					bpmnElement: attr(s, "bpmnElement"),
					isExpanded: bool(s, "isExpanded"),
					bounds: bounds(kid(s, "Bounds")) ?? { x: 0, y: 0, width: 0, height: 0 },
					label: diLabel(s),
				})),
			edges: items
				.filter((s) => s.localName === "BPMNEdge")
				.map((s) => ({
					id: attr(s, "id"),
					bpmnElement: attr(s, "bpmnElement"),
					waypoints: kids(s, "waypoint").map((w) => ({ x: num(w, "x"), y: num(w, "y") })),
					label: diLabel(s),
				})),
		},
	}
}

/** Parses BPMN 2.0 XML into the subset of `BpmnDefinitions` that `exportSvg` reads. */
export function parseBpmnLite(xml: string): BpmnDefinitions {
	const doc = new DOMParser().parseFromString(xml, "application/xml")
	const root = doc.documentElement
	if (doc.getElementsByTagName("parsererror").length > 0 || root.localName !== "definitions") {
		throw new Error("Not a BPMN 2.0 XML document")
	}
	const defs = {
		processes: kids(root, "process").map((p) => ({
			...flowContents(p),
			textAnnotations: annotations(p),
			groups: groups(p),
			laneSet: laneSet(kid(p, "laneSet")),
		})),
		collaborations: kids(root, "collaboration").map((c) => ({
			participants: kids(c, "participant").map((x) => ({
				id: attr(x, "id"),
				name: attr(x, "name"),
			})),
			messageFlows: kids(c, "messageFlow").map((x) => ({ id: attr(x, "id") })),
			textAnnotations: annotations(c),
			groups: groups(c),
		})),
		categories: kids(root, "category").map((c) => ({
			categoryValues: kids(c, "categoryValue").map((v) => ({
				id: attr(v, "id"),
				value: attr(v, "value"),
			})),
		})),
		diagrams: kids(root, "BPMNDiagram").map(diagram),
	}
	// Only the fields exportSvg reads are filled in; the rest of the model is not needed to draw.
	return defs as unknown as BpmnDefinitions
}
