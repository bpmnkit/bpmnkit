import { PROCESS_TEXT_GUIDE, parseProcessText } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import {
	AI_LOCAL_EXAMPLE,
	AI_LOCAL_GUIDE,
	AI_LOCAL_SYSTEM_PROMPT,
	guideLine,
} from "../../src/ai-local/prompt.js"

describe("ai-local prompt", () => {
	it("the example answer parses with only the expected join", () => {
		const r = parseProcessText(AI_LOCAL_EXAMPLE.answer)
		expect(r.problems).toEqual([])
		// as in core's own guide test: `pay` has two incoming branches, so a join is the only fix
		expect(r.fixes).toEqual(['joined 2 flows into "pay" with xor gateway "pay_join"'])
	})
	it("the guide contains the example answer", () => {
		expect(AI_LOCAL_GUIDE).toContain(AI_LOCAL_EXAMPLE.answer)
	})
	it("the system prompt ends with the guide", () => {
		expect(AI_LOCAL_SYSTEM_PROMPT.endsWith(AI_LOCAL_GUIDE)).toBe(true)
	})
	it("leaves out the features Nano doesn't need", () => {
		for (const s of [
			"adhoc",
			"inside=",
			"doc <",
			"note <",
			"form=",
			"in.<",
			"out.<",
			"each=",
			"camunda=",
			"lane ",
			"pool ",
			"msg ",
		]) {
			expect(AI_LOCAL_GUIDE).not.toContain(s)
		}
	})
	it("teaches the named attributes the deploy gate needs, in core's own words", () => {
		const names = guideLine("Names after |:")
		expect(PROCESS_TEXT_GUIDE).toContain(names)
		expect(AI_LOCAL_GUIDE).toContain(names)
		for (const attr of [
			"msg=",
			"key=",
			"signal=",
			"error=",
			"escalation=",
			"at=",
			"every=",
			"called=",
		]) {
			expect(AI_LOCAL_GUIDE).toContain(attr)
		}
		expect(AI_LOCAL_GUIDE).toContain(guideLine("Events take a trigger:"))
	})
	it("guideLine names a missing line", () => {
		expect(() => guideLine("No such line")).toThrow(/no line starting "No such line"/)
	})
	it("stays short", () => {
		expect(AI_LOCAL_SYSTEM_PROMPT.length).toBeLessThan(2800) // ~700 tokens
	})
})
