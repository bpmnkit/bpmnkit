export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "company")
		.insertAfter("approveClaim")
		.serviceTask("checkBudget", { name: "Check budget", taskType: "check-budget" })
