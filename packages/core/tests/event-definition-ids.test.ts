import { describe, expect, it } from "vitest"
import { Bpmn, expand, optimize, parseProcessText } from "../src/index.js"

const ids = (xml: string) =>
	[...xml.matchAll(/<bpmn:\w+EventDefinition id="([^"]+)"/g)].map((m) => m[1])

describe("event definition ids", () => {
	it("builder assigns deterministic unique ids", () => {
		const build = () =>
			Bpmn.export(
				Bpmn.createProcess("p")
					.startEvent("Start", { timerCycle: "R/PT1H" })
					.endEvent("End", { errorCode: "E1" })
					.build(),
			)
		const xml = build()
		expect(ids(xml)).toEqual(["Start_TimerEventDefinition", "End_ErrorEventDefinition"])
		expect(build()).toBe(xml)
	})

	it("deploy lint flags an event definition without id", () => {
		const bare = Bpmn.parse(`<?xml version="1.0"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="x">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="S"><bpmn:timerEventDefinition><bpmn:timeCycle>R/PT1H</bpmn:timeCycle></bpmn:timerEventDefinition></bpmn:startEvent>
  </bpmn:process>
</bpmn:definitions>`)
		const found = optimize(bare, { categories: ["deploy"] } as never)
		expect(JSON.stringify(found)).toContain("deploy/event-definition-no-id")
	})
})

describe("compact expand", () => {
	it("derives ids for event definitions it creates", () => {
		const parsed = parseProcessText(
			"work[service Work] > late[boundary:timer 5 days passed | on=work nonint] > done[end Done]",
		)
		const defs = expand(parsed.diagram)
		const late = defs.processes[0]?.flowElements.find((e) => e.id === "late")
		expect(late && "eventDefinitions" in late ? late.eventDefinitions[0]?.id : undefined).toBe(
			"late_TimerEventDefinition",
		)
	})
})
