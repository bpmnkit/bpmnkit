// Insert a step after "reviewExpense" with an error path that loops back to it.
export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "expense")
		.insertAfter("reviewExpense")
		.serviceTask("validate", { name: "Validate receipt", taskType: "validate-receipt" })
		.withBoundary("invalid", { name: "Receipt invalid", errorCode: "INVALID" }, (b) =>
			b.userTask("fix", { name: "Fix receipt" }).connectTo("validate"),
		)
