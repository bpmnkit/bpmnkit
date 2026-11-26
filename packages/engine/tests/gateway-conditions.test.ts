import { Bpmn } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { createProcessTest } from "../src/testing/index.js"

const GATEWAYS = ["exclusiveGateway", "inclusiveGateway", "complexGateway"] as const

const xml = (
	gateway: string,
	conds: string[],
	withDefault: boolean,
) => `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="d" targetNamespace="x">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f0</bpmn:outgoing></bpmn:startEvent>
    <bpmn:${gateway} id="gw"${withDefault ? ' default="fd"' : ""}><bpmn:incoming>f0</bpmn:incoming>${conds.map((_, i) => `<bpmn:outgoing>f${i}c</bpmn:outgoing>`).join("")}${withDefault ? "<bpmn:outgoing>fd</bpmn:outgoing>" : ""}</bpmn:${gateway}>
    ${conds.map((_, i) => `<bpmn:endEvent id="end${i}"><bpmn:incoming>f${i}c</bpmn:incoming></bpmn:endEvent>`).join("")}
    ${withDefault ? '<bpmn:endEvent id="endD"><bpmn:incoming>fd</bpmn:incoming></bpmn:endEvent>' : ""}
    <bpmn:sequenceFlow id="f0" sourceRef="start" targetRef="gw"/>
    ${conds.map((c, i) => `<bpmn:sequenceFlow id="f${i}c" sourceRef="gw" targetRef="end${i}"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${c}</bpmn:conditionExpression></bpmn:sequenceFlow>`).join("")}
    ${withDefault ? '<bpmn:sequenceFlow id="fd" sourceRef="gw" targetRef="endD"/>' : ""}
  </bpmn:process>
</bpmn:definitions>`

describe("gateway conditions", () => {
	for (const gw of GATEWAYS) {
		it(`${gw}: fails when no condition matches and there is no default flow`, async () => {
			const t = await createProcessTest({
				bpmn: Bpmn.parse(xml(gw, ["= x &gt; 1", "= x &gt; 5"], false)),
			})
			const run = await t.start("p", { x: 0 })
			expect(run.state).toBe("failed")
			expect(run.error).toMatch(/No condition matched at gateway "gw"/)
			t.dispose()
		})

		for (const [label, cond, type] of [
			["unset variable", "= amount &gt; 100", "NULL"],
			["null", "= null", "NULL"],
			["string", '= "abc"', "STRING"],
			["number", "= 1", "NUMBER"],
		] as const) {
			it(`${gw}: fails on non-boolean condition (${label})`, async () => {
				const t = await createProcessTest({ bpmn: Bpmn.parse(xml(gw, [cond], true)) })
				const run = await t.start("p", {})
				expect(run.state).toBe("failed")
				expect(run.error).toBe(
					`Condition of flow "f0c" at gateway "gw" must evaluate to BOOLEAN, but was ${type}`,
				)
				t.dispose()
			})
		}

		it(`${gw}: still takes the default flow when conditions are false booleans`, async () => {
			const t = await createProcessTest({ bpmn: Bpmn.parse(xml(gw, ["= x &gt; 1"], true)) })
			const run = await t.start("p", { x: 0 })
			expect(run.state).toBe("completed")
			expect(run.enteredElements).toContain("endD")
			t.dispose()
		})
	}
})
