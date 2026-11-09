import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { executeCompactDsl } from "./compact-executor.js"

describe("executeCompactDsl", () => {
	it("produces valid BPMN XML for a simple process", () => {
		const dsl = `process P "Simple"
start s "Start"
end e "End"
s -> e
`
		const xml = executeCompactDsl(dsl)
		expect(xml).toContain("<?xml")
		expect(xml).toContain('id="P"')
		expect(xml).toContain("bpmn:startEvent")
		expect(xml).toContain("bpmn:endEvent")
	})

	it("throws when the DSL is malformed", () => {
		expect(() => executeCompactDsl("not valid dsl")).toThrow()
	})

	it("produces valid BPMN XML for the loan-approval fixture", () => {
		const dsl = readFileSync(
			fileURLToPath(new URL("./fixtures/loan-approval.dsl", import.meta.url)),
			"utf-8",
		)
		const xml = executeCompactDsl(dsl)
		expect(xml).toContain("bpmn:process")
		expect(xml).toContain('id="LoanApproval"')
	})
})

describe("executeCompactDsl: deploy gate", () => {
	it("refuses a model Camunda 8 would not deploy with the gate's lines", () => {
		const dsl = `process P "Charge"
start s "Start"
service charge "Charge card"
catch wait "Reply received" event=message msg=reply
end e "End"
s -> charge
charge -> wait
wait -> e
`
		expect(() => executeCompactDsl(dsl)).toThrow(
			/^Not deployable on Camunda \d+\.\d+: \d+ error\(s\)\n(.|\n)*\(zeebe\/[a-z-]+\)/,
		)
	})

	it("writes names, keys, codes, timers and default flows, so the model deploys", () => {
		const dsl = `process P "Order"
start s "Order placed" event=message msg=order-placed
xgw gw "Paid?"
catch wait "Payment received" event=message msg=payment key="=orderId"
catch late "One day passed" event=timer duration=P1D
end ok "Done"
end bad "Failed" event=error error=PAYMENT_FAILED
s -> gw
gw -> wait "yes" if="=paid"
gw -> late default
wait -> ok
late -> bad
`
		const xml = executeCompactDsl(dsl)
		expect(xml).toContain('name="payment"')
		expect(xml).toContain('correlationKey="=orderId"')
		expect(xml).toContain("PAYMENT_FAILED")
		expect(xml).toContain("P1D")
		expect(xml).toMatch(/default="/)
	})
})
