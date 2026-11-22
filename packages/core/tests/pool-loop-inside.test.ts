import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import { Bpmn } from "../src/bpmn/index.js"

/**
 * A pool is drawn around its process. Loops the router sends over or under
 * every shape must stay inside that frame, not run along or past its border.
 */
const XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="t">
  <bpmn:collaboration id="C">
    <bpmn:participant id="P_Desk" name="Front desk" processRef="Desk" />
    <bpmn:participant id="P_Guest" name="Guest" />
    <bpmn:messageFlow id="M1" sourceRef="T_Ask" targetRef="P_Guest" />
    <bpmn:messageFlow id="M2" sourceRef="P_Guest" targetRef="E_Info" />
  </bpmn:collaboration>
  <bpmn:process id="Desk" isExecutable="false">
    <bpmn:startEvent id="S" name="Form in" />
    <bpmn:exclusiveGateway id="G_Again" name="Check again" />
    <bpmn:userTask id="T_Check" name="Check form" />
    <bpmn:exclusiveGateway id="X_Ok" name="Complete?" />
    <bpmn:userTask id="T_File" name="File form" />
    <bpmn:endEvent id="E_Done" name="Filed" />
    <bpmn:sendTask id="T_Ask" name="Ask for details" />
    <bpmn:exclusiveGateway id="G_Wait" name="Wait again" />
    <bpmn:eventBasedGateway id="EB" name="Reply or deadline?" />
    <bpmn:intermediateCatchEvent id="E_Info" name="Details received"><bpmn:messageEventDefinition /></bpmn:intermediateCatchEvent>
    <bpmn:intermediateCatchEvent id="E_Late" name="Deadline passed"><bpmn:timerEventDefinition /></bpmn:intermediateCatchEvent>
    <bpmn:userTask id="T_Chase" name="Chase guest" />
    <bpmn:exclusiveGateway id="X_Drop" name="Drop it?" />
    <bpmn:endEvent id="E_Drop" name="Dropped" />
    <bpmn:sequenceFlow id="F1" sourceRef="S" targetRef="G_Again" />
    <bpmn:sequenceFlow id="F2" sourceRef="G_Again" targetRef="T_Check" />
    <bpmn:sequenceFlow id="F3" sourceRef="T_Check" targetRef="X_Ok" />
    <bpmn:sequenceFlow id="F4" name="Yes" sourceRef="X_Ok" targetRef="T_File" />
    <bpmn:sequenceFlow id="F5" sourceRef="T_File" targetRef="E_Done" />
    <bpmn:sequenceFlow id="F6" name="No" sourceRef="X_Ok" targetRef="T_Ask" />
    <bpmn:sequenceFlow id="F7" sourceRef="T_Ask" targetRef="G_Wait" />
    <bpmn:sequenceFlow id="F8" sourceRef="G_Wait" targetRef="EB" />
    <bpmn:sequenceFlow id="F9" sourceRef="EB" targetRef="E_Info" />
    <bpmn:sequenceFlow id="F10" sourceRef="E_Info" targetRef="G_Again" />
    <bpmn:sequenceFlow id="F11" sourceRef="EB" targetRef="E_Late" />
    <bpmn:sequenceFlow id="F12" sourceRef="E_Late" targetRef="T_Chase" />
    <bpmn:sequenceFlow id="F13" sourceRef="T_Chase" targetRef="X_Drop" />
    <bpmn:sequenceFlow id="F14" name="No" sourceRef="X_Drop" targetRef="G_Wait" />
    <bpmn:sequenceFlow id="F15" name="Yes" sourceRef="X_Drop" targetRef="E_Drop" />
  </bpmn:process>
</bpmn:definitions>`

describe("auto-layout: loops stay inside their pool", () => {
	it("draws every sequence flow within the pool frame", () => {
		const defs = applyAutoLayout(Bpmn.parse(XML))
		const plane = defs.diagrams[0]?.plane
		const pool = plane?.shapes.find((s) => s.bpmnElement === "P_Desk")?.bounds
		expect(pool).toBeDefined()
		if (!pool) return
		for (const edge of plane?.edges ?? []) {
			if (!edge.bpmnElement.startsWith("F")) continue
			for (const w of edge.waypoints) {
				expect(w.y, edge.bpmnElement).toBeGreaterThan(pool.y)
				expect(w.y, edge.bpmnElement).toBeLessThan(pool.y + pool.height)
			}
		}
	})
})
