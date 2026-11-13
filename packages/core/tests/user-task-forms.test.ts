import { describe, expect, it } from "vitest"
import { Bpmn, attachUserTaskForms, lintDiagram, parseFormFields } from "../src/index.js"

const build = () =>
	Bpmn.createProcess("expense")
		.startEvent("start", { name: "Submitted" })
		.userTask("review", { name: "Review expense" })
		.userTask("approve", { name: "Approve", formId: "approve-form", zeebeUserTask: true })
		.endEvent("end", { name: "Done" })
		.build()

describe("attachUserTaskForms", () => {
	it("links a form to every form-less user task and generates the forms", () => {
		const defs = build()
		const { attached, forms } = attachUserTaskForms(defs, {
			fields: { review: "amount:number,approved:checkbox" },
		})
		expect(attached).toEqual(["review"])
		expect(forms.map((f) => f.id)).toEqual(["expense-review", "approve-form"])
		expect(forms[0]?.components.map((c) => c.type)).toEqual(["text", "number", "checkbox"])
		const review = defs.processes[0]?.flowElements.find((e) => e.id === "review")
		expect(review?.extensionElements.map((x) => x.name)).toEqual([
			"zeebe:userTask",
			"zeebe:formDefinition",
		])
		const report = lintDiagram(defs)
		expect(report.diagnostics.filter((d) => d.message.includes("form"))).toEqual([])
	})

	it("generates no form for an id that already exists", () => {
		const { forms } = attachUserTaskForms(build(), { existing: new Set(["approve-form"]) })
		expect(forms.map((f) => f.id)).toEqual(["expense-review"])
	})

	it("reads the field list", () => {
		expect(
			parseFormFields("first name,due:date,decision:select(approve|reject),note:textarea"),
		).toEqual([
			{ id: "Field_firstName", type: "textfield", label: "First name", key: "firstName" },
			{ id: "Field_due", type: "datetime", key: "due", subtype: "date", dateLabel: "Due" },
			{
				id: "Field_decision",
				type: "select",
				label: "Decision",
				key: "decision",
				values: [
					{ label: "Approve", value: "approve" },
					{ label: "Reject", value: "reject" },
				],
			},
			{ id: "Field_note", type: "textarea", label: "Note", key: "note" },
		])
	})
})
