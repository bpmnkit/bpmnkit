import { describe, expect, it } from "vitest"
import { completes, draftGaps, gapChange } from "../src/lib/check.js"

const kinds = (request: string, text: string) => draftGaps(request, text).map((g) => g.kind)

describe("draftGaps", () => {
	it("finds a DMN decision drafted as a plain gateway", () => {
		// glm-4.7-flash, golden prompt 12
		const request =
			"Run a DMN decision table to check a loan applicant's credit before approving or rejecting the application."
		const draft = [
			"# Credit check",
			"start[start Application received] > check[xor Approve?]",
			"check >(Yes: score > 720) approve[user Approve application] > ok[end Approved]",
			"check >(No: default) reject[service Reject applicant] > no[end Rejected]",
		].join("\n")
		expect(kinds(request, draft)).toEqual(["dmn"])
		expect(
			kinds(
				request,
				draft.replace("check[xor Approve?]", "dmn[rule Credit] > check[xor Approve?]"),
			),
		).toEqual([])
	})

	it("finds a time limit drafted as a decision, and names the duration", () => {
		// golden prompt 15
		const request =
			"Poll a slow external system for a report. If it doesn't respond within 5 minutes, give up and flag it for manual follow-up."
		const draft = [
			"# Poll",
			"start[start Poll report] > poll[service Poll report] > check[xor No response after 5 minutes?]",
			"check >(Yes: late = true) flag[user Flag for manual follow-up] > done[end Not retrieved]",
			"check >(No: default) got[end Report received]",
		].join("\n")
		const gaps = draftGaps(request, draft)
		expect(gaps.map((g) => g.kind)).toEqual(["deadline"])
		expect(gaps[0]?.change).toContain("after=5m")
	})

	it("asks once for an error boundary when the request names both a failure and a REST call", () => {
		const request = "Call the billing REST API. If the call fails, alert finance."
		const draft = "# B\ns[start Go] > call[service Call billing API] > e[end Done]"
		expect(kinds(request, draft)).toEqual(["failure"])
	})

	it("reads 'for each new ticket' as each instance, and 'every recipient in a list' as a list", () => {
		const draft = "# N\ns[start Go] > send[send Send email] > e[end Done]"
		expect(kinds("For each new support ticket, summarise it with OpenAI.", draft)).toEqual([])
		expect(
			kinds("Send an email notification to every recipient in a list of stakeholders.", draft),
		).toEqual(["each"])
	})

	it("finds nothing in a draft that has what its request names", () => {
		const request =
			"Fulfill an order by picking the items, packing the box, and printing the shipping label all at the same time, then dispatch the package."
		const draft = [
			"# Fulfil",
			"start[start Order] > split[and] > pick[user Pick items] > join[and] > ship[service Dispatch package] > e[end Done]",
			"split > pack[user Pack box] > join",
		].join("\n")
		expect(draftGaps(request, draft)).toEqual([])
		expect(gapChange([])).toBeUndefined()
	})
})

describe("completes", () => {
	const request = "Run a DMN decision table to check credit before approving the application."
	const draft =
		"# C\ns[start Go] > check[xor Approve?]\ncheck >(Yes: ok) a[user Approve] > e[end Done]\ncheck >(No: default) e"

	it("keeps a completion that fills the gap and every element", () => {
		const fixed = draft.replace("s[start Go] >", "s[start Go] > d[rule Check credit] >")
		expect(completes(request, draft, fixed)).toBe(true)
	})

	it("drops one that fills the gap but loses elements, or fills nothing", () => {
		expect(completes(request, draft, "# C\ns[start Go] > d[rule Check credit] > e[end Done]")).toBe(
			false,
		)
		expect(completes(request, draft, draft)).toBe(false)
	})
})
