export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "checkin")
		.insertAfter("assignRoom")
		.serviceTask("chargeDeposit", { name: "Charge deposit", taskType: "charge-deposit" })
		.withBoundary("depositFailed", { name: "Deposit failed", errorCode: "DEPOSIT_FAILED" }, (b) =>
			b.userTask("askOtherCard", { name: "Ask for other card" }).connectTo("chargeDeposit"),
		)
