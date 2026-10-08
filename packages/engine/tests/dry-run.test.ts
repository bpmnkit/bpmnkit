import { Bpmn, type BpmnDefinitions, expand, parseProcessText } from "@bpmnkit/core"
import { applyConnectorLines } from "@bpmnkit/core/connectors"
import { describe, expect, it } from "vitest"
import { dryRun } from "../src/testing/index.js"

function diagram(text: string): BpmnDefinitions {
	const parsed = parseProcessText(text)
	expect(parsed.problems).toEqual([])
	const applied = applyConnectorLines(expand(parsed.diagram), parsed.connectors)
	expect(applied.problems).toEqual([])
	return applied.definitions
}

describe("dryRun", () => {
	it("runs a connected process to its end with every connector mocked", async () => {
		const defs = diagram(`# Triage
start[start Triage requested] > list[service List open issues] > any[xor New issues?]
any >(Yes: count(issues) > 0) post[service Post summary to Slack] > done[end Summary posted]
any >(No: default) quiet[end Nothing new]
with list: http GET https://api.github.com/repos/acme/shop/issues | result=issues: response.body
with post: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#triage | data.text=New issues`)
		const result = await dryRun(defs)
		expect(result.reachedEnd).toBe(true)
		expect(result.state).toBe("completed")
		expect(result.connectors[0]).toEqual({ elementId: "list", type: "io.camunda:http-json:1" })
		expect(result.stoppedAt).toEqual([])
	})

	it("answers with the response given, mapped by the result expression", async () => {
		const defs = diagram(`start[start Go] > list[service List issues] > any[xor Any?]
any >(Yes: count(issues) > 0) post[service Post to Slack] > done[end Posted]
any >(No: default) quiet[end Quiet]
with list: http GET https://api.github.com/issues | result=issues: response.body
with post: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#x | data.text=hi`)
		const result = await dryRun(defs, { response: { status: 200, body: [{ id: 1 }] } })
		expect(result.path).toContain("post")
		expect((await dryRun(defs, { response: { status: 200, body: [] } })).path).toContain("quiet")
		expect(result.connectors.map((c) => c.type)).toEqual([
			"io.camunda:http-json:1",
			"io.camunda:slack:1",
		])
	})

	it("completes user and plain service tasks, delivers messages and fires timers", async () => {
		const defs =
			diagram(`start[start Order placed] > review[user Review order] > pay[service Charge card]
pay > wait[catch:message Payment confirmed] > done[end Done]`)
		const result = await dryRun(defs)
		expect(result.reachedEnd).toBe(true)
		expect(result.steps).toEqual([{ kind: "message", elementId: "wait", message: "wait" }])
		expect(result.path).toEqual(expect.arrayContaining(["review", "pay", "wait", "done"]))
	})

	it("moves the clock on for a timer", async () => {
		const defs = Bpmn.parse(`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="t">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:intermediateCatchEvent id="cool"><bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing>
      <bpmn:timerEventDefinition><bpmn:timeDuration>PT2H</bpmn:timeDuration></bpmn:timerEventDefinition>
    </bpmn:intermediateCatchEvent>
    <bpmn:endEvent id="done"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="cool"/>
    <bpmn:sequenceFlow id="f2" sourceRef="cool" targetRef="done"/>
  </bpmn:process>
</bpmn:definitions>`)
		const result = await dryRun(defs)
		expect(result.reachedEnd).toBe(true)
		expect(result.steps).toEqual([{ kind: "timer", elementIds: ["cool"] }])
	})

	it("says where a run stops and why", async () => {
		const defs = Bpmn.parse(`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="t">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:exclusiveGateway id="check"><bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing><bpmn:outgoing>f3</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:endEvent id="big"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="small"><bpmn:incoming>f3</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="check"/>
    <bpmn:sequenceFlow id="f2" sourceRef="check" targetRef="big"><bpmn:conditionExpression>=decision = "big"</bpmn:conditionExpression></bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="f3" sourceRef="check" targetRef="small"><bpmn:conditionExpression>=decision = "small"</bpmn:conditionExpression></bpmn:sequenceFlow>
  </bpmn:process>
</bpmn:definitions>`)
		const result = await dryRun(defs)
		expect(result.reachedEnd).toBe(false)
		expect(result.state).toBe("failed")
		expect(result.error).toMatch(/No condition matched at gateway "check"/)
		expect(result.path).toEqual(["start", "check"])
	})

	it("runs a multi-instance over a variable once, unless the list is given", async () => {
		const defs = Bpmn.parse(`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="t">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="each"><bpmn:extensionElements><zeebe:taskDefinition type="notify"/></bpmn:extensionElements>
      <bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing>
      <bpmn:multiInstanceLoopCharacteristics><bpmn:extensionElements><zeebe:loopCharacteristics inputCollection="=recipients" inputElement="recipient"/></bpmn:extensionElements></bpmn:multiInstanceLoopCharacteristics>
    </bpmn:serviceTask>
    <bpmn:endEvent id="done"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="each"/>
    <bpmn:sequenceFlow id="f2" sourceRef="each" targetRef="done"/>
  </bpmn:process>
</bpmn:definitions>`)
		expect((await dryRun(defs)).reachedEnd).toBe(true)
		const given = await dryRun(defs, { variables: { recipients: "nobody" } })
		expect(given.reachedEnd).toBe(false)
		expect(given.error).toMatch(/is not a list/)
	})

	it("takes a gateway's branch from the starting variables", async () => {
		const defs = diagram(`start[start Go] > check[xor Big?]
check >(Yes: amount > 1000) big[end Big]
check >(No: default) small[end Small]`)
		expect((await dryRun(defs, { variables: { amount: 5000 } })).path).toContain("big")
		expect((await dryRun(defs)).path).toContain("small")
	})
})
