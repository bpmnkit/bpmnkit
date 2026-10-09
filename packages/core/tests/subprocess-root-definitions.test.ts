import { beforeEach, describe, expect, it } from "vitest"
import { Bpmn, resetIdCounter } from "../src/index.js"
import type { BpmnDefinitions, SubProcessContentBuilder } from "../src/index.js"

/** Every `*Ref` attribute an event definition carries in the exported XML. */
function eventRefs(xml: string): string[] {
	return [...xml.matchAll(/(?:errorRef|messageRef|signalRef|escalationRef)="([^"]+)"/g)].map(
		(m) => m[1] as string,
	)
}

function rootIds(defs: BpmnDefinitions): Set<string> {
	return new Set(
		[...defs.errors, ...defs.messages, ...defs.signals, ...defs.escalations].map((d) => d.id),
	)
}

/** bpmn-moddle ships no declarations for its entry point, so it is imported by a non-literal specifier. */
type Moddle = new () => { fromXML(xml: string): Promise<{ warnings: Array<{ message: string }> }> }
const moddleSpecifier = "bpmn-moddle"
const { BpmnModdle } = (await import(moddleSpecifier)) as { BpmnModdle: Moddle }

async function moddleWarnings(xml: string): Promise<string[]> {
	const { warnings } = await new BpmnModdle().fromXML(xml)
	return warnings.map((w) => w.message)
}

/** Throws, catches and ends one of each kind of reference. */
function referencingContent(prefix: string) {
	return (c: SubProcessContentBuilder) => {
		c.startEvent(`${prefix}_s`)
			.intermediateThrowEvent(`${prefix}_esc`, { escalationCode: "E1" })
			.intermediateCatchEvent(`${prefix}_msg`, { messageName: "M1", correlationKey: "=k" })
			.intermediateThrowEvent(`${prefix}_sig`, { signalName: "S1" })
			.endEvent(`${prefix}_err`, { errorCode: "X1" })
	}
}

describe("SubProcessContentBuilder root definitions (#220)", () => {
	beforeEach(() => resetIdCounter())

	it("creates root definitions for event refs inside a sub-process", async () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sub", referencingContent("a"))
			.endEvent("e")
			.build()
		const xml = Bpmn.export(defs)

		expect(defs.escalations.map((e) => e.escalationCode)).toEqual(["E1"])
		expect(defs.messages.map((m) => m.name)).toEqual(["M1"])
		expect(defs.signals.map((s) => s.name)).toEqual(["S1"])
		expect(defs.errors.map((e) => e.errorCode)).toEqual(["X1"])
		expect(xml).toMatch(/<bpmn:escalation [^>]*escalationCode="E1"/)
		expect(xml).toMatch(/<bpmn:message [^>]*name="M1"/)

		const ids = rootIds(defs)
		const refs = eventRefs(xml)
		expect(refs).toHaveLength(4)
		for (const ref of refs) expect(ids, ref).toContain(ref)
		expect(await moddleWarnings(xml)).toEqual([])
	})

	it("resolves refs in every nested container kind, two levels deep", async () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("outer", (c) => {
				c.startEvent("os")
					.subProcess("inner", referencingContent("in"))
					.transaction("tx", referencingContent("tx"))
					.adHocSubProcess("ah", (a) => {
						a.subProcess("ahSub", referencingContent("ah"))
					})
					.exclusiveGateway("gw")
					.branch("x", (b) => b.condition("= x").endEvent("bx", { escalationCode: "E1" }))
					.branch("y", (b) =>
						b.defaultFlow().subProcess("bSub", referencingContent("br")).endEvent("by"),
					)
				c.eventSubProcess("evt", (ev) => {
					ev.startEvent("evs", { messageName: "M1" }).endEvent("eve", { signalName: "S1" })
				})
			})
			.endEvent("e")
			.build()
		const xml = Bpmn.export(defs)

		const ids = rootIds(defs)
		const refs = eventRefs(xml)
		// Four refs in each of inner, tx, ahSub and bSub, plus bx, evs and eve.
		expect(refs).toHaveLength(19)
		for (const ref of refs) expect(ids, ref).toContain(ref)
		expect(await moddleWarnings(xml)).toEqual([])
	})

	it("resolves refs on boundary events inside sub-process content", async () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sub", (c) => {
				c.startEvent("ss").serviceTask("work", { name: "Work", taskType: "w" }).endEvent("se")
				c.boundaryEvent("onErr", { attachedTo: "work", errorCode: "B_ERR" }).endEvent("ee")
				c.boundaryEvent("onMsg", {
					attachedTo: "work",
					messageName: "B_MSG",
					correlationKey: "=k",
				}).endEvent("me")
				c.boundaryEvent("onSig", { attachedTo: "work", signalName: "B_SIG" }).endEvent("ge")
			})
			.endEvent("e")
			.build()
		const xml = Bpmn.export(defs)

		expect(defs.errors.map((e) => e.errorCode)).toEqual(["B_ERR"])
		expect(defs.messages.map((m) => m.name)).toEqual(["B_MSG"])
		expect(defs.signals.map((s) => s.name)).toEqual(["B_SIG"])
		const ids = rootIds(defs)
		const refs = eventRefs(xml)
		expect(refs).toHaveLength(3)
		for (const ref of refs) expect(ids, ref).toContain(ref)
		expect(await moddleWarnings(xml)).toEqual([])
	})

	it("resolves refs in every container a branch creates", async () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.parallelGateway("fork")
			.branch("tx", (b) => b.transaction("bTx", referencingContent("tx")).endEvent("txe"))
			.branch("ah", (b) =>
				b
					.adHocSubProcess("bAh", (a) => {
						a.subProcess("bAhSub", referencingContent("ah"))
					})
					.endEvent("ahe"),
			)
			.branch("evt", (b) =>
				b
					.subProcess("host", (c) => {
						c.startEvent("hs").endEvent("he")
					})
					.eventSubProcess("bEvt", (ev) => {
						ev.startEvent("evs", { messageName: "EV_MSG" }).endEvent("eve", {
							escalationCode: "EV_ESC",
						})
					})
					.endEvent("evte"),
			)
			.build()
		const xml = Bpmn.export(defs)

		const ids = rootIds(defs)
		const refs = eventRefs(xml)
		// Four refs in each of bTx and bAhSub, plus evs and eve.
		expect(refs).toHaveLength(10)
		for (const ref of refs) expect(ids, ref).toContain(ref)
		expect(defs.messages.map((m) => m.name).sort()).toEqual(["EV_MSG", "M1"])
		expect(defs.escalations.map((e) => e.escalationCode).sort()).toEqual(["E1", "EV_ESC"])
		expect(await moddleWarnings(xml)).toEqual([])
	})

	it("shares one root definition between process level and sub-process", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.intermediateThrowEvent("top", { escalationCode: "E1" })
			.subProcess("sub", (c) => {
				c.startEvent("ss").intermediateThrowEvent("nested", { escalationCode: "E1" }).endEvent()
			})
			.boundaryEvent("b", { attachedTo: "sub", errorCode: "X1" })
			.endEvent("be")
			.subProcess("sub2", (c) => {
				c.startEvent("ss2").endEvent("se2", { errorCode: "X1" })
			})
			.build()

		expect(defs.escalations).toHaveLength(1)
		expect(defs.errors).toHaveLength(1)
		const xml = Bpmn.export(defs)
		const escalationId = defs.escalations[0]?.id
		expect(xml.match(new RegExp(`escalationRef="${escalationId}"`, "g"))).toHaveLength(2)
	})

	it("uses an explicitly declared root definition from inside a sub-process", () => {
		const defs = Bpmn.createProcess("p")
			.message("Msg_Order", { name: "Order" })
			.startEvent("s")
			.subProcess("sub", (c) => {
				c.startEvent("ss")
					.intermediateCatchEvent("wait", { messageName: "Order", correlationKey: "=id" })
					.endEvent()
			})
			.endEvent("e")
			.build()

		expect(defs.messages.map((m) => m.id)).toEqual(["Msg_Order"])
		expect(Bpmn.export(defs)).toContain('messageRef="Msg_Order"')
	})
})
