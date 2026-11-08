import { Bpmn, isDeployable, validateDeployableXml } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import {
	REFUSAL_HINT,
	declareDiNamespaces,
	deployCheckLine,
	finalDiagramEvents,
	finalGateOf,
	refuseUndeployable,
} from "../src/final-diagram.js"

// A service task with no job type: Zeebe refuses the deployment.
const REFUSED = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f</bpmn:outgoing></bpmn:startEvent>
    <bpmn:sequenceFlow id="f" sourceRef="s" targetRef="charge"/>
    <bpmn:serviceTask id="charge"><bpmn:incoming>f</bpmn:incoming></bpmn:serviceTask>
  </bpmn:process>
</bpmn:definitions>`
const GATE_LINES =
	/^Not deployable on Camunda \d+\.\d+: 1 error\(s\)\n- charge: Must have exactly one 'zeebe:taskDefinition' extension element \(zeebe\/service-task-definition\)/

describe("finalDiagramEvents", () => {
	it("returns a deployable diagram as it is", () => {
		const xml = Bpmn.makeEmpty("p", "P")
		expect(finalDiagramEvents(xml)).toEqual([{ type: "xml", xml }])
	})

	it("refuses with the gate's message and the ways out, and no XML", () => {
		const events = finalDiagramEvents(REFUSED)
		expect(events).toHaveLength(1)
		const [event] = events
		expect(event?.type).toBe("error")
		if (event?.type !== "error") return
		expect(event.message).toMatch(GATE_LINES)
		expect(event.message.endsWith(REFUSAL_HINT)).toBe(true)
	})

	it("fills placeholders when asked, and lists them", () => {
		const [xml, fills] = finalDiagramEvents(REFUSED, { placeholders: true })
		expect(xml?.type).toBe("xml")
		if (xml?.type !== "xml" || fills?.type !== "placeholders") throw new Error("events")
		expect(isDeployable(validateDeployableXml(xml.xml))).toBe(true)
		expect(fills.placeholders).toEqual([
			{
				elementId: "charge",
				field: "jobType",
				value: "placeholder-charge",
				rule: "zeebe/service-task-definition",
			},
		])
	})

	it("returns a draft with the gate's message as advice when validate is false", () => {
		const [xml, advice] = finalDiagramEvents(REFUSED, { validate: false })
		expect(xml).toEqual({ type: "xml", xml: REFUSED })
		expect(advice?.type).toBe("deployability")
		if (advice?.type === "deployability") expect(advice.message).toMatch(GATE_LINES)
	})
})

describe("finalGateOf", () => {
	it("reads only boolean validate and a true placeholders", () => {
		expect(finalGateOf({ validate: false, placeholders: true })).toEqual({
			validate: false,
			placeholders: true,
		})
		expect(finalGateOf({ validate: "no", placeholders: "yes" })).toEqual({})
		expect(finalGateOf(null)).toEqual({})
	})
})

describe("deployCheckLine", () => {
	it("names every error for the model to fix", () => {
		const line = deployCheckLine(REFUSED)
		expect(line.startsWith("Deploy check: Not deployable on Camunda ")).toBe(true)
		expect(line).toContain("- charge: ")
		expect(line).toContain("Fix every error above before you finish")
	})

	it("says so when the diagram deploys", () => {
		expect(deployCheckLine(Bpmn.makeEmpty("p", "P"))).toBe(
			"Deploy check: the diagram deploys on Camunda 8.",
		)
	})
})

describe("declareDiNamespaces", () => {
	it("declares the diagram namespaces a parsed model lacks, once", () => {
		const defs = Bpmn.parse(REFUSED)
		declareDiNamespaces(defs)
		expect(defs.namespaces.bpmndi).toBe("http://www.omg.org/spec/BPMN/20100524/DI")
		const again = { ...defs.namespaces }
		declareDiNamespaces(defs)
		expect(defs.namespaces).toEqual(again)
	})
})

describe("refuseUndeployable (bpmn_deploy, model writes)", () => {
	it("throws the gate's lines, then what to do next", () => {
		expect(() => refuseUndeployable(REFUSED, "Not deployed.")).toThrow(GATE_LINES)
		expect(() => refuseUndeployable(REFUSED, "Not deployed.")).toThrow(/\nNot deployed\.$/)
		expect(() => refuseUndeployable(Bpmn.makeEmpty("p", "P"), "x")).not.toThrow()
	})
})
