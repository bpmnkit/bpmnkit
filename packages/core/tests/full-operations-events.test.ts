import { describe, expect, it } from "vitest"
import type { BpmnFlowElement } from "../src/bpmn/bpmn-model.js"
import { applyBpmnOperations } from "../src/bpmn/full-operations.js"
import { Bpmn } from "../src/bpmn/index.js"
import type { ElementPatch } from "../src/bpmn/operations.js"

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="D" targetNamespace="x">
  <bpmn:message id="M" name="payment"><bpmn:extensionElements><zeebe:subscription correlationKey="=orderId" /></bpmn:extensionElements></bpmn:message>
  <bpmn:error id="Er" name="Boom" errorCode="E1" />
  <bpmn:escalation id="Es" name="Late" escalationCode="L1" />
  <bpmn:signal id="Sg" name="go" />
  <bpmn:process id="P" isExecutable="true">
    <bpmn:intermediateCatchEvent id="Msg"><bpmn:messageEventDefinition id="MD1" messageRef="M" /></bpmn:intermediateCatchEvent>
    <bpmn:intermediateCatchEvent id="Msg2"><bpmn:messageEventDefinition id="MD2" messageRef="M" /></bpmn:intermediateCatchEvent>
    <bpmn:intermediateCatchEvent id="Bare"><bpmn:messageEventDefinition id="MD3" /></bpmn:intermediateCatchEvent>
    <bpmn:intermediateCatchEvent id="Tmr"><bpmn:timerEventDefinition id="TD"><bpmn:timeDuration>PT5M</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:intermediateCatchEvent>
    <bpmn:endEvent id="Err"><bpmn:errorEventDefinition id="ED" errorRef="Er" /></bpmn:endEvent>
    <bpmn:endEvent id="Esc"><bpmn:escalationEventDefinition id="XD" escalationRef="Es" /></bpmn:endEvent>
    <bpmn:intermediateThrowEvent id="Sig"><bpmn:signalEventDefinition id="SD" signalRef="Sg" /></bpmn:intermediateThrowEvent>
    <bpmn:intermediateCatchEvent id="Cnd"><bpmn:conditionalEventDefinition id="CD"><bpmn:condition xsi:type="bpmn:tFormalExpression" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">=a</bpmn:condition></bpmn:conditionalEventDefinition></bpmn:intermediateCatchEvent>
    <bpmn:serviceTask id="T"><bpmn:extensionElements><zeebe:taskDefinition type="w" /></bpmn:extensionElements></bpmn:serviceTask>
    <bpmn:serviceTask id="MI">
      <bpmn:multiInstanceLoopCharacteristics><bpmn:extensionElements><zeebe:loopCharacteristics inputCollection="=xs" inputElement="x" outputCollection="ys" /></bpmn:extensionElements><bpmn:loopCardinality>3</bpmn:loopCardinality></bpmn:multiInstanceLoopCharacteristics>
    </bpmn:serviceTask>
  </bpmn:process>
</bpmn:definitions>`

const el = (defs: ReturnType<typeof Bpmn.parse>, id: string): BpmnFlowElement => {
	const found = defs.processes[0]?.flowElements.find((e) => e.id === id)
	if (!found) throw new Error(id)
	return found
}
const patch = (id: string, p: ElementPatch) =>
	applyBpmnOperations(Bpmn.parse(XML), [{ op: "update", id, patch: p }], { strict: false })
const def = (defs: ReturnType<typeof Bpmn.parse>, id: string) => {
	const e = el(defs, id)
	return "eventDefinitions" in e ? e.eventDefinitions[0] : undefined
}

describe("update patches: event definitions", () => {
	it("sets and clears timer duration, date and cycle independently", () => {
		const a = patch("Tmr", { timerDate: "2030-01-01T00:00:00Z", timerCycle: "R3/PT1H" })
		expect(a.problems).toEqual([])
		expect(def(a.definitions, "Tmr")).toMatchObject({
			timeDuration: "PT5M",
			timeDate: "2030-01-01T00:00:00Z",
			timeCycle: "R3/PT1H",
		})
		const b = patch("Tmr", { timerDuration: "" })
		expect(def(b.definitions, "Tmr")).not.toHaveProperty("timeDuration")
	})

	it("sets the condition of a conditional event", () => {
		const { definitions } = patch("Cnd", { condition: "=b > 1" })
		expect(def(definitions, "Cnd")).toMatchObject({ condition: "=b > 1" })
	})

	it("renames an unshared error, escalation and signal in place", () => {
		expect(patch("Err", { errorCode: "E2" }).definitions.errors[0]).toMatchObject({
			id: "Er",
			name: "Boom",
			errorCode: "E2",
		})
		expect(patch("Esc", { escalationCode: "L2" }).definitions.escalations[0]?.escalationCode).toBe(
			"L2",
		)
		expect(patch("Sig", { signalName: "stop" }).definitions.signals[0]?.name).toBe("stop")
		expect(patch("Err", { errorCode: "" }).definitions.errors[0]).not.toHaveProperty("errorCode")
	})

	it("creates the root message when the definition has none, and keeps the rest", () => {
		const { definitions, problems } = patch("Bare", { messageName: "hello" })
		expect(problems).toEqual([])
		const ref = (def(definitions, "Bare") as { messageRef?: string }).messageRef
		expect(ref).toBeDefined()
		expect(definitions.messages.find((m) => m.id === ref)?.name).toBe("hello")
		expect(definitions.messages).toHaveLength(2)
	})

	it("names a message and sets its correlation key in one patch", () => {
		const { definitions, problems } = patch("Bare", { messageName: "hello", correlationKey: "=k" })
		expect(problems).toEqual([])
		const m = definitions.messages.find((x) => x.name === "hello")
		expect(m?.extensionElements?.[0]?.attributes.correlationKey).toBe("=k")
	})

	it("renames an unshared message but refuses a shared one", () => {
		const shared = patch("Msg", { messageName: "other" })
		expect(shared.problems).toHaveLength(1)
		expect(shared.problems[0]?.reason).toMatch(/shared/)
		expect(shared.definitions.messages[0]?.name).toBe("payment")
		const { definitions } = applyBpmnOperations(Bpmn.parse(XML), [
			{ op: "delete", id: "Msg2" },
			{ op: "update", id: "Msg", patch: { messageName: "other" } },
		])
		expect(definitions.messages[0]).toMatchObject({ name: "other" })
		expect(definitions.messages[0]?.extensionElements).toHaveLength(1)
	})

	it("reports a field the element's event definition cannot carry", () => {
		expect(patch("Tmr", { messageName: "x" }).problems[0]?.reason).toMatch(/message/)
		expect(patch("T", { timerDuration: "PT1M" }).problems[0]?.reason).toMatch(/timer/)
	})
})

describe("update patches: multi-instance", () => {
	const loop = (defs: ReturnType<typeof Bpmn.parse>, id: string) => {
		const e = el(defs, id)
		return "loopCharacteristics" in e ? e.loopCharacteristics : undefined
	}

	it("adds multi-instance to a task", () => {
		const { definitions, problems } = patch("T", {
			multiInstance: { collection: "=items", element: "item", sequential: true },
		})
		expect(problems).toEqual([])
		const l = loop(definitions, "T")
		expect(l?.isSequential).toBe(true)
		expect(l?.extensionElements[0]?.attributes).toEqual({
			inputCollection: "=items",
			inputElement: "item",
		})
	})

	it("changes one field and keeps cardinality and the other attributes", () => {
		const { definitions } = patch("MI", { multiInstance: { completionCondition: "=done" } })
		const l = loop(definitions, "MI")
		expect(l?.completionCondition?.text).toBe("=done")
		expect(l?.loopCardinality?.text).toBe("3")
		expect(l?.extensionElements[0]?.attributes).toEqual({
			inputCollection: "=xs",
			inputElement: "x",
			outputCollection: "ys",
		})
	})

	it("clears one attribute with an empty string, and all of it with an empty collection", () => {
		const one = patch("MI", { multiInstance: { outputCollection: "" } })
		expect(loop(one.definitions, "MI")?.extensionElements[0]?.attributes).toEqual({
			inputCollection: "=xs",
			inputElement: "x",
		})
		expect(
			loop(patch("MI", { multiInstance: { collection: "" } }).definitions, "MI"),
		).toBeUndefined()
	})

	it("needs a collection to add one, and only on an activity", () => {
		expect(patch("T", { multiInstance: { sequential: true } }).problems[0]?.reason).toMatch(
			/collection/,
		)
		expect(patch("Tmr", { multiInstance: { collection: "=x" } }).problems[0]?.reason).toMatch(
			/multi-instance/,
		)
	})

	it("removing a loop that is not there is a no-op", () => {
		const r = patch("T", { multiInstance: { collection: "" } })
		expect(r.problems).toEqual([])
		expect("loopCharacteristics" in el(r.definitions, "T")).toBe(false)
	})
})

describe("update patches: guards", () => {
	it("refuses a message shared with a receive task", () => {
		const xml = XML.replace(
			'<bpmn:serviceTask id="T">',
			'<bpmn:receiveTask id="RT" messageRef="M" /><bpmn:serviceTask id="T">',
		).replace(
			'<bpmn:intermediateCatchEvent id="Msg2"><bpmn:messageEventDefinition id="MD2" messageRef="M" /></bpmn:intermediateCatchEvent>',
			"",
		)
		const r = applyBpmnOperations(
			Bpmn.parse(xml),
			[{ op: "update", id: "Msg", patch: { messageName: "z" } }],
			{ strict: false },
		)
		expect(r.problems[0]?.reason).toMatch(/shared/)
	})

	it("does not take a root id that a flow element already has", () => {
		const xml = XML.replace('id="T"', 'id="Message_Bare"')
		const r = applyBpmnOperations(
			Bpmn.parse(xml),
			[{ op: "update", id: "Bare", patch: { messageName: "n" } }],
			{ strict: false },
		)
		expect(r.definitions.messages.map((m) => m.id)).toContain("Message_Bare_")
	})

	it('reports correlationKey together with messageName ""', () => {
		const r = patch("Bare", { messageName: "", correlationKey: "=k" })
		expect(r.problems[0]?.reason).toMatch(/correlationKey/)
	})
})
