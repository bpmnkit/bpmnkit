import { describe, expect, it, vi } from "vitest"
import { Bpmn, ValidationError } from "../src/index.js"

const build = (id: string) =>
	Bpmn.createProcess("p1").startEvent("start").userTask(id).endEvent("end")

describe("build-time XSD checks", () => {
	it("rejects an id that is not an NCName, naming the allowed form", () => {
		expect(() => build("Approve order").build()).toThrow(ValidationError)
		expect(() => build("1stTask").build()).toThrow(/xsd:ID/)
		expect(() => build("Task_Approve-1").build()).not.toThrow()
	})

	it("rejects non-numeric retries but allows FEEL", () => {
		const svc = (retries: string) =>
			Bpmn.createProcess("p2")
				.startEvent("s")
				.serviceTask("t", { taskType: "x", retries })
				.endEvent("e")
		expect(() => svc("three").build()).toThrow(/retries/)
		expect(() => svc("3").build()).not.toThrow()
		expect(() => svc("=r").build()).not.toThrow()
	})

	it("rejects a non-boolean cancelActivity", () => {
		const b = Bpmn.createProcess("p3")
			.startEvent("s")
			.serviceTask("t", { taskType: "x" })
			.boundaryEvent("b", {
				attachedTo: "t",
				cancelActivity: "no" as unknown as boolean,
				timerDuration: "PT1H",
			})
			.endEvent("e")
		expect(() => b.build()).toThrow(/cancelActivity/)
	})
})

describe("Bpmn.export validate", () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:modeler="http://camunda.org/schema/modeler/1.0" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.8.0" id="d" targetNamespace="http://bpmn.io/schema/bpmn">
<bpmn:process id="p" isExecutable="true"><bpmn:startEvent id="s"/><bpmn:serviceTask id="t"/><bpmn:endEvent id="e"/>
<bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="t"/><bpmn:sequenceFlow id="f2" sourceRef="t" targetRef="e"/></bpmn:process></bpmn:definitions>`

	it("is off by default", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
		Bpmn.export(Bpmn.parse(xml))
		expect(warn).not.toHaveBeenCalled()
		warn.mockRestore()
	})

	it("warns or throws on deploy errors", () => {
		const defs = Bpmn.parse(xml)
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
		expect(Bpmn.export(defs, { validate: "warn" })).toContain("serviceTask")
		expect(warn).toHaveBeenCalledTimes(1)
		warn.mockRestore()
		expect(() => Bpmn.export(defs, { validate: "error" })).toThrow(ValidationError)
	})
})
