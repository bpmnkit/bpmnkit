import { Bpmn } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { createProcessTest } from "../src/testing/index.js"

type Declare = (tag: "incoming" | "outgoing", ...ids: string[]) => string

const xml = (body: (d: Declare) => string, declare: boolean): string => {
	const d: Declare = (tag, ...ids) =>
		declare ? ids.map((id) => `<bpmn:${tag}>${id}</bpmn:${tag}>`).join("") : ""
	return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="x">
${body(d)}
</bpmn:definitions>`
}

const flat = (d: Declare): string => `<bpmn:process id="p" isExecutable="true">
  <bpmn:startEvent id="start">${d("outgoing", "f1")}</bpmn:startEvent>
  <bpmn:parallelGateway id="fork">${d("incoming", "f1")}${d("outgoing", "f2", "f3")}</bpmn:parallelGateway>
  <bpmn:parallelGateway id="join">${d("incoming", "f2", "f3")}${d("outgoing", "f4")}</bpmn:parallelGateway>
  <bpmn:endEvent id="end">${d("incoming", "f4")}</bpmn:endEvent>
  <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="fork"/>
  <bpmn:sequenceFlow id="f2" sourceRef="fork" targetRef="join"/>
  <bpmn:sequenceFlow id="f3" sourceRef="fork" targetRef="join"/>
  <bpmn:sequenceFlow id="f4" sourceRef="join" targetRef="end"/>
</bpmn:process>`

const nested = (d: Declare): string => `<bpmn:process id="p" isExecutable="true">
  <bpmn:startEvent id="s0"/>
  <bpmn:subProcess id="sub">
    <bpmn:startEvent id="start">${d("outgoing", "f1")}</bpmn:startEvent>
    <bpmn:parallelGateway id="fork"/>
    <bpmn:parallelGateway id="join"/>
    <bpmn:endEvent id="end"/>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="fork"/>
    <bpmn:sequenceFlow id="f2" sourceRef="fork" targetRef="join"/>
    <bpmn:sequenceFlow id="f3" sourceRef="fork" targetRef="join"/>
    <bpmn:sequenceFlow id="f4" sourceRef="join" targetRef="end"/>
  </bpmn:subProcess>
  <bpmn:endEvent id="e0"/>
  <bpmn:sequenceFlow id="g1" sourceRef="s0" targetRef="sub"/>
  <bpmn:sequenceFlow id="g2" sourceRef="sub" targetRef="e0"/>
</bpmn:process>`

// join declares only f2 although f3 also targets it
const partial = (d: Declare): string =>
	flat(d).replace(
		/(<bpmn:parallelGateway id="join">)[\s\S]*?(<\/bpmn:parallelGateway>)/,
		"$1<bpmn:incoming>f2</bpmn:incoming>$2",
	)

async function counts(source: string): Promise<{ join: number; end: number; state: string }> {
	const t = await createProcessTest({ bpmn: Bpmn.parse(source) })
	const run = await t.start("p", {})
	const n = (id: string) => run.enteredElements.filter((e) => e === id).length
	const r = { join: n("join"), end: n("end"), state: run.state }
	t.dispose()
	return r
}

describe("undeclared incoming/outgoing", () => {
	it("fires a parallel join once (issue #336)", async () => {
		expect(await counts(xml(flat, false))).toEqual({ join: 1, end: 1, state: "completed" })
		expect(await counts(xml(flat, true))).toEqual({ join: 1, end: 1, state: "completed" })
	})

	it("fires a join once inside a sub-process", async () => {
		expect(await counts(xml(nested, false))).toEqual({ join: 1, end: 1, state: "completed" })
	})

	it("merges partially declared lists with the sequence flows", async () => {
		expect(await counts(xml(partial, true))).toEqual({ join: 1, end: 1, state: "completed" })
	})

	it("leaves the parsed model untouched", () => {
		const defs = Bpmn.parse(xml(flat, false))
		const join = defs.processes[0]?.flowElements.find((e) => e.id === "join")
		expect(join?.incoming).toEqual([])
	})
})
