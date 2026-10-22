// Hand-authored reference model for the Quote-to-Cash scenario, written from the scenario prompt
// only. It is not derived from any model output and is not informed by any recording or scored
// run. Deterministic: no clocks, randomness or environment input.
import { fileURLToPath } from "node:url"
import { Bpmn } from "../../../packages/core/dist/index.js"

const SIGNATURE_URL = "https://api.esign.example.com/v1/envelopes"
const PAYMENT_URL = "https://api.payments.example.com/v1/charges"

function buildDunning(sub) {
	sub
		.startEvent("StartEvent_DunningStarted", { name: "Payment overdue" })
		.serviceTask("ServiceTask_FirstReminder", {
			name: "Send friendly reminder",
			taskType: "send-firstreminder",
		})
		.receiveTask("ReceiveTask_AwaitPaymentAfterFirstReminder", {
			name: "Await payment (reminder 1)",
			messageName: "PaymentReceived",
			correlationKey: "=orderId",
		})
		.boundaryEvent("BoundaryEvent_FirstReminderTimer", {
			attachedTo: "ReceiveTask_AwaitPaymentAfterFirstReminder",
			timerDuration: "P7D",
		})
		.serviceTask("ServiceTask_SecondReminder", {
			name: "Send second reminder",
			taskType: "send-secondreminder",
		})
		.receiveTask("ReceiveTask_AwaitPaymentAfterSecondReminder", {
			name: "Await payment (reminder 2)",
			messageName: "PaymentReceived",
			correlationKey: "=orderId",
		})
		.boundaryEvent("BoundaryEvent_SecondReminderTimer", {
			attachedTo: "ReceiveTask_AwaitPaymentAfterSecondReminder",
			timerDuration: "P7D",
		})
		.serviceTask("ServiceTask_FinalNotice", {
			name: "Send final notice",
			taskType: "send-finalnotice",
		})
		.receiveTask("ReceiveTask_AwaitPaymentAfterFinalNotice", {
			name: "Await payment (final notice)",
			messageName: "PaymentReceived",
			correlationKey: "=orderId",
		})
		.boundaryEvent("BoundaryEvent_FinalNoticeTimer", {
			attachedTo: "ReceiveTask_AwaitPaymentAfterFinalNotice",
			timerDuration: "P14D",
		})
		.serviceTask("ServiceTask_HandOverToCollectionsAgency", {
			name: "Hand over to collections agency",
			taskType: "collections-agency-handover",
		})
		.receiveTask("ReceiveTask_AwaitCollectionsOutcome", {
			name: "Await collections outcome",
			messageName: "CollectionsOutcome",
			correlationKey: "=orderId",
		})
		.endEvent("EndEvent_DunningClosed", { name: "Dunning closed" })
}

export default function buildReference() {
	const model = Bpmn.createProcess("quote-to-cash")
		.name("Quote to Cash")
		.executable(true)
		.executionPlatformVersion("8.8.0")
		.startEvent("StartEvent_QuoteRequested", { name: "Quote requested" })
		.serviceTask("ServiceTask_GenerateQuote", {
			name: "Generate quote from product catalog",
			taskType: "generate-quote",
			documentation:
				"Looks up the requested products in the catalog and applies tiered pricing by quantity.",
		})
		.exclusiveGateway("Gateway_DiscountRequired", { name: "Discount above standard?" })
		.branch("noDiscount", (b) =>
			b.label("No").flowId("Flow_NoDiscount").defaultFlow().connectTo("Gateway_DiscountResolved"),
		)
		.branch("managerLevel", (b) =>
			b
				.label("5-20%")
				.flowId("Flow_ManagerLevel")
				.condition("=discountPercent > 5 and discountPercent <= 20")
				.userTask("UserTask_ManagerDiscountApproval", {
					name: "Manager approves discount",
					zeebeUserTask: true,
				})
				.connectTo("Gateway_DiscountResolved"),
		)
		.branch("vpLevel", (b) =>
			b
				.label("Above 20%")
				.flowId("Flow_VpLevel")
				.condition("=discountPercent > 20")
				.userTask("UserTask_ManagerReview", {
					name: "Manager reviews and escalates",
					zeebeUserTask: true,
				})
				.userTask("UserTask_VpDiscountApproval", {
					name: "VP approves discount",
					zeebeUserTask: true,
				})
				.connectTo("Gateway_DiscountResolved"),
		)
		.exclusiveGateway("Gateway_DiscountResolved")
		.serviceTask("ServiceTask_GenerateContract", {
			name: "Generate contract",
			taskType: "generate-contract",
		})
		.exclusiveGateway("Gateway_SignatureRequested")
		.restConnector("ServiceTask_RequestESignature", {
			name: "Send contract for e-signature",
			method: "POST",
			url: SIGNATURE_URL,
			authentication: { type: "bearer", token: "{{secrets.ESIGN_TOKEN}}" },
			body: "={documentId: contractId, signer: customerEmail}",
			resultVariable: "signature",
		})
		.withBoundary("BoundaryEvent_SignatureServiceFailed", { errorCode: "HTTP_ERROR" }, (b) =>
			b
				.userTask("UserTask_FollowUpSignatureFailure", {
					name: "Follow up on signature failure",
					zeebeUserTask: true,
				})
				.connectTo("Gateway_SignatureRequested"),
		)
		.receiveTask("ReceiveTask_AwaitSignature", {
			name: "Await signature outcome",
			messageName: "ContractSignatureCompleted",
			correlationKey: "=orderId",
		})
		.exclusiveGateway("Gateway_ContractSigned", { name: "Contract signed?" })
		.branch("rejected", (b) =>
			b
				.label("No")
				.flowId("Flow_ContractDeclined")
				.condition("=contractSigned = false")
				.endEvent("EndEvent_ContractRejected", { name: "Contract rejected" }),
		)
		.branch("signed", (b) =>
			b
				.label("Yes")
				.flowId("Flow_ContractSigned")
				.defaultFlow()
				.exclusiveGateway("Gateway_OrderComplexity", { name: "Order type?" })
				.branch("standard", (s) =>
					s
						.label("Standard")
						.flowId("Flow_StandardOrder")
						.defaultFlow()
						.serviceTask("ServiceTask_ProvisionOrder", {
							name: "Provision order",
							taskType: "provision-order",
						})
						.connectTo("Gateway_ProvisioningDone"),
				)
				.branch("bundled", (s) =>
					s
						.label("Complex bundle")
						.flowId("Flow_BundledOrder")
						.condition('=orderType = "bundle"')
						.subProcess(
							"SubProcess_MultiLineProvisioning",
							(sub) =>
								sub
									.startEvent("StartEvent_LineItemReceived", { name: "Line item received" })
									.serviceTask("ServiceTask_ProvisionLineItem", {
										name: "Provision line item",
										taskType: "provision-line-item",
									})
									.endEvent("EndEvent_LineItemProvisioned", { name: "Line item provisioned" }),
							{
								name: "Provision each line item",
								multiInstance: {
									isSequential: false,
									collection: "=lineItems",
									elementVariable: "lineItem",
								},
							},
						)
						.connectTo("Gateway_ProvisioningDone"),
				),
		)
		.exclusiveGateway("Gateway_ProvisioningDone")
		.serviceTask("ServiceTask_GenerateInvoice", {
			name: "Generate invoice",
			taskType: "generate-invoice",
		})
		.restConnector("ServiceTask_ProcessPayment", {
			name: "Charge customer via payment gateway",
			method: "POST",
			url: PAYMENT_URL,
			authentication: { type: "bearer", token: "{{secrets.PAYMENT_TOKEN}}" },
			body: "={invoiceId: invoiceId, amount: invoiceTotal, currency: currency}",
			resultVariable: "payment",
		})
		.withBoundary("BoundaryEvent_PaymentServiceFailed", { errorCode: "HTTP_ERROR" }, (b) =>
			b.connectTo("Gateway_DunningEntry"),
		)
		.eventBasedGateway("Gateway_PaymentOutcome", { name: "Payment outcome" })
		.branch("paid", (b) =>
			b
				.label("Paid")
				.flowId("Flow_Paid")
				.intermediateCatchEvent("IntermediateCatchEvent_PaymentConfirmed", {
					name: "Payment confirmed",
					messageName: "PaymentConfirmed",
					correlationKey: "=orderId",
				})
				.endEvent("EndEvent_PaymentReceived", { name: "Payment received" }),
		)
		.branch("overdue", (b) =>
			b
				.label("Overdue")
				.flowId("Flow_Overdue")
				.intermediateCatchEvent("IntermediateCatchEvent_PaymentWindowElapsed", {
					name: "Payment term elapsed",
					timerDuration: "P30D",
				})
				.exclusiveGateway("Gateway_DunningEntry")
				.subProcess("SubProcess_Dunning", buildDunning, { name: "Dunning and cash collection" })
				.exclusiveGateway("Gateway_Collected", { name: "Debt collected?" })
				.branch("collected", (c) =>
					c
						.label("Yes")
						.flowId("Flow_Collected")
						.condition("=collected = true")
						.endEvent("EndEvent_PaymentReceivedAfterDunning", { name: "Payment received" }),
				)
				.branch("writtenOff", (c) =>
					c
						.label("No")
						.flowId("Flow_NotCollected")
						.defaultFlow()
						.endEvent("EndEvent_WrittenOff", { name: "Written off after collections failure" }),
				),
		)
		.withAutoLayout()
		.build()
	return Bpmn.export(model)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(buildReference())
