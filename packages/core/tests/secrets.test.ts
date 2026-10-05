import { describe, expect, it } from "vitest"
import { applyConnectorLines } from "../src/connectors/index.js"
import { Bpmn, expand, listSecrets, parseProcessText } from "../src/index.js"

describe("listSecrets", () => {
	it("lists every secret a diagram's connectors read, with the elements that read it", () => {
		const parsed =
			parseProcessText(`start[start Go] > list[service List issues] > post[service Post to Slack] > ping[service Ping Slack] > done[end Done]
with list: http GET https://api.github.com/issues | authentication.type=bearer | authentication.token={{secrets.GITHUB_TOKEN}}
with post: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops | data.text=hi
with ping: slack chat.postMessage | token={{ secrets.SLACK_TOKEN }} | data.channel=#ops | data.text==camunda.secrets.GREETING`)
		const defs = applyConnectorLines(expand(parsed.diagram), parsed.connectors).definitions
		expect(listSecrets(Bpmn.parse(Bpmn.export(defs)))).toEqual([
			{ name: "GITHUB_TOKEN", elementIds: ["list"] },
			{ name: "GREETING", elementIds: ["ping"] },
			{ name: "SLACK_TOKEN", elementIds: ["post", "ping"] },
		])
	})

	it("reads a message's correlation key for the events that wait for it", () => {
		const defs = Bpmn.parse(`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="t">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:intermediateCatchEvent id="wait"><bpmn:incoming>f1</bpmn:incoming><bpmn:messageEventDefinition messageRef="m"/></bpmn:intermediateCatchEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="wait"/>
  </bpmn:process>
  <bpmn:message id="m" name="Paid"><bpmn:extensionElements><zeebe:subscription correlationKey="={{secrets.KEY}}"/></bpmn:extensionElements></bpmn:message>
</bpmn:definitions>`)
		expect(listSecrets(defs)).toEqual([{ name: "KEY", elementIds: ["wait"] }])
	})

	it("is empty for a diagram without secrets", () => {
		expect(
			listSecrets(expand(parseProcessText("start[start Go] > done[end Done]").diagram)),
		).toEqual([])
	})
})
