import { readFileSync, writeFileSync } from "node:fs"
import { Form, exportFormPreserving } from "@bpmnkit/core"

// 1. Create. "review-order" is the form id a userTask or startEvent references as formId.
const form = Form.create("review-order")
	.text("## Review order")
	.textfield("Customer", "customer", { validate: { required: true } })
	.select("Decision", "decision", {
		values: [
			{ label: "Approve", value: "approve" },
			{ label: "Reject", value: "reject" },
		],
		validate: { required: true },
	})
	.textarea("Comment", "comment")
	.checkbox("Notify customer", "notify")
	.build()

// 2. Export.
writeFileSync("review-order.form", Form.export(form))

// 3. Edit an existing file: parse, change, write with exportFormPreserving to keep key order and ids.
const original = readFileSync("review-order.form", "utf8")
const edited = Form.parse(original)
edited.components.push({
	id: "Field_note",
	type: "text",
	text: "Reviewed orders ship the same day.",
})
writeFileSync("review-order.form", exportFormPreserving(original, edited))

// 4. Validate: it parses back with the id the process references.
const check = Form.parse(readFileSync("review-order.form", "utf8"))
if (check.id !== "review-order") {
	console.error(`form id is ${check.id}, expected review-order`)
	process.exit(1)
}
