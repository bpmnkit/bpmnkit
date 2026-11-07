import { describe, expect, it } from "vitest"
import { expand } from "../src/bpmn/compact.js"
import type { CompactDiagram } from "../src/bpmn/compact.js"
import { Bpmn } from "../src/bpmn/index.js"
import { writeProcessText } from "../src/bpmn/process-text-writer.js"
import { createProcessTextStream, parseProcessText } from "../src/bpmn/process-text.js"

const elements = (diagram: CompactDiagram) => diagram.processes[0]?.elements ?? []
const find = (diagram: CompactDiagram, id: string) => elements(diagram).find((el) => el.id === id)

describe("process text: event attributes", () => {
	it("writes a timer boundary's after= so it reads back", () => {
		const text =
			"s[start] > t[task Work] > e[end]\nb[boundary:timer Late | on=t after=PT1H] > x[end]"
		const written = writeProcessText(expand(parseProcessText(text).diagram)).text
		expect(written).toContain("b[boundary:timer Late | on=t after=PT1H]")
		expect(find(parseProcessText(written).diagram, "b")?.timerDuration).toBe("PT1H")
	})

	it("writes a timer catch event's after=", () => {
		const text = "s[start] > w[catch:timer Wait | after=PT5M] > e[end]"
		const written = writeProcessText(expand(parseProcessText(text).diagram)).text
		expect(written).toContain("w[catch:timer Wait | after=PT5M]")
	})

	it("reads feel= on a conditional event as its condition", () => {
		const text =
			"s[start] > t[task Work] > e[end]\nb[boundary:conditional Cond | on=t feel=a > 1] > x[end]"
		const result = parseProcessText(text)
		expect(find(result.diagram, "b")?.condition).toBe("= a > 1")
		expect(result.problems.map((p) => p.message).join("\n")).not.toContain("feel=")
	})

	it("reads a conditional event's feel= that is not FEEL as a problem", () => {
		const text = "s[start] > w[catch:conditional Ready | feel=if then] > e[end]"
		const result = parseProcessText(text)
		expect(find(result.diagram, "w")?.condition).toBe("= if then")
		expect(result.problems.map((p) => p.message)).toContain(
			'feel= on "w" is not FEEL; kept for the reader to correct',
		)
	})
})

describe("process text: kind words are own keys", () => {
	it.each(["constructor", "__proto__", "toString", "valueOf", "hasOwnProperty"])(
		"reads %s as an unknown kind, not a kind",
		(word) => {
			const result = parseProcessText(`s[start] > a[${word} X] > e[end]`)
			expect(find(result.diagram, "a")?.type).toBe("task")
			expect(result.problems.map((p) => p.message)).toContain(
				`unknown kind "${word.toLowerCase()}" for "a"; used task`,
			)
		},
	)

	it("reads a prototype member after an arrow as an id, not a bracketless kind", () => {
		const result = parseProcessText("s[start] > constructor Do it > e[end]")
		expect(elements(result.diagram).every((el) => typeof el.type === "string")).toBe(true)
		expect(() => expand(result.diagram)).not.toThrow()
	})
})

describe("compact: result mapping", () => {
	it.each(["constructor", "toString"])("maps a job worker's response to result=%s", (result) => {
		const diagram: CompactDiagram = {
			id: "D",
			processes: [
				{
					id: "P",
					elements: [
						{ id: "t", type: "serviceTask", jobType: "work", resultVariable: result, outputs: {} },
					],
					flows: [],
				},
			],
		}
		const xml = Bpmn.export(expand(diagram))
		expect(xml).toContain(`<zeebe:output source="= response" target="${result}"`)
	})
})

describe("process text stream: boundary drawn from its host", () => {
	const text =
		"s[start] > t[task Work] > e[end]\nt > w[boundary:timer Late | after=5m] > h[task Handle] > x[end]\n"

	it("keeps the boundary and its path in end() after a frame", () => {
		const stream = createProcessTextStream()
		stream.push(text)
		expect(stream.end()).toEqual(parseProcessText(text))
	})

	it("keeps them across frames line by line", () => {
		const stream = createProcessTextStream()
		for (const line of text.split("\n")) stream.push(`${line}\n`)
		expect(stream.end()).toEqual(parseProcessText(text))
	})
})
