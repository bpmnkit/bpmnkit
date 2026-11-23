import { describe, expect, it } from "vitest"
import {
	createProcessTextStream,
	expand,
	parseProcessText,
	writeProcessText,
} from "../src/index.js"

// The example on the "BPMN Kit Text" guide page (guides/process-text.md).
const GUIDE_PAGE_EXAMPLE = `# Expense approval
start[start Expense submitted] > check[xor Amount over 1000?]
check >(Yes: amount > 1000) review[user Review expense | form=expense_review] > pay[service Pay expense | job=pay-expense] > done[end Expense paid]
check >(No: default) auto[service Approve automatically] > pay
failed[boundary:error Payment failed | on=pay | error=PAYMENT_FAILED] > notify[send Notify submitter] > notice[end Payment failed]
note review: Over 1000 needs a person`

describe("BPMN Kit Text guide page example", () => {
	it("parses with no problems, reports its two fixes, and expands", () => {
		const { diagram, problems, fixes } = parseProcessText(GUIDE_PAGE_EXAMPLE)
		expect(problems).toEqual([])
		expect(fixes).toEqual(['joined 2 flows into "pay" with xor gateway "pay_join"'])
		expect(() => expand(diagram)).not.toThrow()
	})
	it("streams to the same result", () => {
		const stream = createProcessTextStream()
		let frames = 0
		for (const line of GUIDE_PAGE_EXAMPLE.split("\n")) if (stream.push(`${line}\n`)) frames++
		expect(frames).toBeGreaterThan(0)
		expect(stream.end().diagram).toEqual(parseProcessText(GUIDE_PAGE_EXAMPLE).diagram)
	})
	it("writes back as text that parses", () => {
		const { diagram } = parseProcessText(GUIDE_PAGE_EXAMPLE)
		const { text } = writeProcessText(expand(diagram))
		expect(parseProcessText(text).problems).toEqual([])
	})
})
