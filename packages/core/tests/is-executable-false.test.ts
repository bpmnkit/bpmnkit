import { describe, expect, it } from "vitest"
import { Bpmn } from "../src/index.js"

const wrap = (processAttrs: string, body = "") => `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="x">
  <bpmn:process id="p"${processAttrs}>${body}</bpmn:process>
</bpmn:definitions>`

describe("process isExecutable keeps absent, true and false apart", () => {
	it.each([
		["", undefined],
		[' isExecutable="true"', true],
		[' isExecutable="false"', false],
	])("%j", (attrs, expected) => {
		const defs = Bpmn.parse(wrap(attrs))
		expect(defs.processes[0]?.isExecutable).toBe(expected)
		const out = Bpmn.export(defs)
		const wrote = /<bpmn:process [^>]*isExecutable="([^"]*)"/.exec(out)?.[1]
		expect(wrote).toBe(expected === undefined ? undefined : String(expected))
		expect(Bpmn.parse(out).processes[0]?.isExecutable).toBe(expected)
	})
})

describe("isForCompensation on sub-process kinds", () => {
	it.each(["subProcess", "adHocSubProcess", "transaction", "eventSubProcess"])(
		"%s keeps it through a round trip",
		(tag) => {
			const xml = wrap("", `<bpmn:${tag} id="s" isForCompensation="true"/>`)
			const el = Bpmn.parse(xml).processes[0]?.flowElements[0]
			expect(el?.isForCompensation).toBe(true)
			expect(Bpmn.export(Bpmn.parse(xml))).toContain('isForCompensation="true"')
		},
	)
})
