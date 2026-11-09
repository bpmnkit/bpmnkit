import { beforeEach, describe, expect, it } from "vitest"
import { createCompactStream } from "../src/bpmn/compact-stream.js"
import type { CompactDiagram } from "../src/bpmn/compact.js"
import { compactify, expand } from "../src/bpmn/compact.js"
import { writeProcessText } from "../src/bpmn/process-text-writer.js"
import { createProcessTextStream, parseProcessText } from "../src/bpmn/process-text.js"
import { Bpmn, DeployabilityError, resetIdCounter } from "../src/index.js"

/**
 * `expand`'s deploy gate and the names, codes and timers a compact diagram
 * carries. Every message is pinned by a `conformance/compact` or
 * `conformance/text` case; this file covers the options and the error shape.
 */

beforeEach(() => resetIdCounter())

const diagram = (elements: CompactDiagram["processes"][0]["elements"]): CompactDiagram => ({
	id: "D",
	processes: [
		{
			id: "P",
			elements: [{ id: "s", type: "startEvent" }, ...elements, { id: "e", type: "endEvent" }],
			flows: [
				{ id: "f1", from: "s", to: elements[0]?.id ?? "e" },
				{ id: "f2", from: elements[0]?.id ?? "s", to: "e" },
			],
		},
	],
})

const unkeyed = () =>
	diagram([{ id: "w", type: "intermediateCatchEvent", eventType: "message", messageName: "m" }])

describe("expand() gate", () => {
	it("throws a DeployabilityError for what Zeebe would refuse", () => {
		let thrown: unknown
		try {
			expand(unkeyed())
		} catch (err) {
			thrown = err
		}
		expect(thrown).toBeInstanceOf(DeployabilityError)
		expect((thrown as DeployabilityError).findings[0]?.id).toBe("zeebe/message-subscription")
		expect((thrown as Error).message).toBe(
			"Not deployable on Camunda 8.10: 1 error(s)\n- Message_m: Must have exactly one zeebe:subscription extension element (zeebe/message-subscription)",
		)
	})

	it("marks gated output as Camunda 8, so Bpmn.export checks it the same way", () => {
		const defs = expand(
			diagram([
				{
					id: "w",
					type: "intermediateCatchEvent",
					eventType: "message",
					messageName: "m",
					correlationKey: "=id",
				},
			]),
		)
		expect(defs.unknownAttributes["modeler:executionPlatform"]).toBe("Camunda Cloud")
		expect(() => Bpmn.export(defs)).not.toThrow()
	})

	it("skips the gate and the platform with validate: false", () => {
		const defs = expand(unkeyed(), { validate: false })
		expect(defs.unknownAttributes).toEqual({})
		// Not marked Camunda 8, so export's "auto" check leaves it alone too
		expect(() => Bpmn.export(defs)).not.toThrow()
	})

	it("fills placeholders when asked", () => {
		const defs = expand(unkeyed(), { placeholders: true })
		expect(defs.messages[0]?.extensionElements?.[0]?.attributes.correlationKey).toBe(
			'="placeholder-Message_m"',
		)
	})

	it("checks the version asked for, else the diagram's", () => {
		const agent: CompactDiagram = {
			...diagram([{ id: "agent", type: "adHocSubProcess" }]),
			executionPlatformVersion: "8.6.0",
		}
		// Zeebe 8.6 has no rule for an empty ad-hoc sub-process; 8.7 refuses it
		expect(() => expand(agent)).not.toThrow()
		expect(() => expand(agent, { camundaVersion: "8.7" })).toThrow(/^Not deployable on Camunda 8.7/)
	})

	it("leaves previews ungated: the compact and process-text streams", () => {
		const stream = createCompactStream()
		expect(
			stream.push('{"id":"w","type":"intermediateCatchEvent","eventType":"message"}'),
		).not.toBe(null)
		const text = createProcessTextStream()
		expect(text.push("s[start] > w[catch:message Paid]\n")).not.toBe(null)
	})
})

describe("names, codes and timers", () => {
	it("writes one root element per name, key or code, and compactify reads them back", () => {
		const defs = expand(
			diagram([
				{ id: "a", type: "receiveTask", messageName: "paid", correlationKey: "=id" },
				{
					id: "b",
					type: "intermediateCatchEvent",
					eventType: "message",
					messageName: "paid",
					correlationKey: "=id",
				},
				{
					id: "c",
					type: "intermediateCatchEvent",
					eventType: "message",
					messageName: "paid",
					correlationKey: "=other",
				},
				{ id: "t", type: "intermediateCatchEvent", eventType: "timer", timerDate: "=due" },
				{ id: "x", type: "intermediateThrowEvent", eventType: "signal", signalName: "go" },
				{ id: "y", type: "intermediateThrowEvent", eventType: "escalation", escalationCode: "UP" },
			]),
			{ validate: false },
		)
		expect(defs.messages.map((m) => m.id)).toEqual(["Message_paid", "Message_paid_2"])
		expect(defs.signals.map((s) => s.id)).toEqual(["Signal_go"])
		expect(defs.escalations.map((s) => s.escalationCode)).toEqual(["UP"])
		const back = compactify(defs).processes[0]?.elements
		expect(back?.find((e) => e.id === "c")).toMatchObject({
			messageName: "paid",
			correlationKey: "=other",
		})
		expect(back?.find((e) => e.id === "t")?.timerDate).toBe("=due")
		expect(back?.find((e) => e.id === "y")?.escalationCode).toBe("UP")
	})

	it("round-trips the line format's names through the writer", () => {
		const text =
			"s[start:timer Daily | every=R/P1D] > w[catch:message Paid | msg=paid key=orderId] > c[call Child | called=child] > e[end:error Failed | error=FAILED]"
		const { diagram: parsed, problems } = parseProcessText(text)
		expect(problems).toEqual([])
		const written = writeProcessText(expand(parsed)).text
		expect(written).toContain("msg=paid key=orderId")
		expect(written).toContain("every=R/P1D")
		expect(written).toContain("called=child")
		expect(written).toContain("error=FAILED")
	})
})
