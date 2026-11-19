export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "parcelIntake")
		.insertAfter("scanLabel")
		.exclusiveGateway("tooBig", { name: "Too big?" })
		.branch("Yes", (b) =>
			b
				.userTask("labelOversize", { name: "Label oversize" })
				.userTask("moveToYard", { name: "Move to yard" }),
		)
