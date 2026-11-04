/**
 * Reference BPMN for the KYC onboarding scenario.
 *
 * Hand-authored from the scenario prompt only. It is not derived from any model
 * output and was not informed by any recording or scored run.
 */
import { fileURLToPath } from "node:url"
import { applyTemplates } from "../../../packages/core/dist/connectors/index.js"
import { Bpmn } from "../../../packages/core/dist/index.js"

const HTTP = "io.camunda.connectors.HttpJson.v2@18"

export default function buildReference() {
	const model = Bpmn.createProcess("kyc-onboarding")
		.name("KYC Customer Onboarding")
		.executable(true)
		.startEvent("StartEvent_OnboardingRequested", { name: "Onboarding requested" })
		.exclusiveGateway("Gateway_UploadMerge")
		.userTask("UserTask_UploadIdDocument", {
			name: "Upload identity document",
			zeebeUserTask: true,
			// Counts attempts so the retry gateway can cap re-uploads at 2.
			ioMapping: {
				outputs: [
					{
						source: "=if is defined(uploadAttempts) then uploadAttempts + 1 else 1",
						target: "uploadAttempts",
					},
				],
			},
		})
		.serviceTask("ServiceTask_VerifyDocumentOcr", {
			name: "Verify document via OCR service",
			taskType: "io.camunda:http-json:1",
		})
		// An unreachable OCR service counts as a failed verification and uses the retry budget.
		.withBoundary("Boundary_OcrFailed", { name: "OCR failed", errorCode: "OCR_ERROR" }, (b) =>
			b.connectTo("Gateway_RetriesLeft"),
		)
		.exclusiveGateway("Gateway_DocumentQuality", { name: "Document quality OK?" })
		.branch("quality-ok", (b) =>
			b
				.label("Yes")
				.flowId("Flow_QualityOk")
				.condition("=ocrResult.documentValid = true")
				.serviceTask("ServiceTask_ScreenSanctionsPep", {
					name: "Screen sanctions and PEP lists",
					taskType: "io.camunda:http-json:1",
				})
				// A failed screening cannot be decided automatically, so a human takes over.
				.withBoundary(
					"Boundary_ScreeningFailed",
					{ name: "Screening failed", errorCode: "SCREENING_ERROR" },
					(e) => e.connectTo("Gateway_EscalatedMerge"),
				)
				.exclusiveGateway("Gateway_ScreeningRisk", { name: "Screening result?" })
				.branch("risk-low", (r) =>
					r
						.label("No match / low risk")
						.flowId("Flow_LowRisk")
						.condition('=screeningResult.riskLevel = "low"')
						.serviceTask("ServiceTask_StandardDueDiligence", {
							name: "Perform standard due diligence",
							taskType: "kyc-standard-due-diligence",
						})
						.exclusiveGateway("Gateway_DueDiligenceMerge")
						.businessRuleTask("BusinessRuleTask_ClassifyRisk", {
							name: "Classify final risk",
							decisionId: "kyc-risk-classification",
							resultVariable: "riskClassification",
						})
						.exclusiveGateway("Gateway_Outcome", { name: "Classification?" })
						.branch("approved", (o) =>
							o
								.label("Approved")
								.flowId("Flow_Approved")
								.condition('=riskClassification = "approved"')
								.endEvent("EndEvent_Approved", { name: "Customer approved" }),
						)
						.branch("rejected", (o) =>
							o
								.label("Rejected")
								.flowId("Flow_ClassifiedRejected")
								.condition('=riskClassification = "rejected"')
								.exclusiveGateway("Gateway_RejectedMerge")
								.endEvent("EndEvent_Rejected", { name: "Customer rejected" }),
						)
						.branch("escalated", (o) =>
							o
								.label("Escalate")
								.flowId("Flow_Escalated")
								.defaultFlow()
								.exclusiveGateway("Gateway_EscalatedMerge")
								.endEvent("EndEvent_EscalatedToCompliance", {
									name: "Escalated to compliance",
								}),
						),
				)
				.branch("risk-high", (r) =>
					r
						.label("PEP / sanctions hit / high risk")
						.flowId("Flow_HighRisk")
						.defaultFlow()
						.userTask("UserTask_EnhancedDueDiligenceReview", {
							name: "Review enhanced due diligence",
							zeebeUserTask: true,
							assignee: "compliance-officer",
						})
						.connectTo("Gateway_DueDiligenceMerge"),
				),
		)
		.branch("quality-bad", (b) =>
			b
				.label("No")
				.flowId("Flow_QualityBad")
				.defaultFlow()
				.exclusiveGateway("Gateway_RetriesLeft", { name: "Retries left?" })
				.branch("retry", (r) =>
					r
						.label("Yes, re-upload")
						.flowId("Flow_Reupload")
						.condition("=uploadAttempts < 3")
						.connectTo("Gateway_UploadMerge"),
				)
				.branch("exhausted", (r) =>
					r
						.label("No, retries exhausted")
						.flowId("Flow_RetriesExhausted")
						.defaultFlow()
						.connectTo("Gateway_RejectedMerge"),
				),
		)
		.withAutoLayout()
		.build()

	const post = { "authentication.type": "noAuth", method: "POST" }
	const { definitions, problems } = applyTemplates(model, [
		{
			elementId: "ServiceTask_VerifyDocumentOcr",
			template: HTTP,
			values: {
				...post,
				url: "https://ocr.example.com/v1/verify",
				body: "={document: documentReference}",
				resultVariable: "ocrResult",
				resultExpression: "={documentValid: response.body.valid}",
			},
		},
		{
			elementId: "ServiceTask_ScreenSanctionsPep",
			template: HTTP,
			values: {
				...post,
				url: "https://screening.example.com/v1/sanctions-pep",
				body: "={fullName: customer.fullName, dateOfBirth: customer.dateOfBirth}",
				resultVariable: "screeningResult",
				resultExpression: "={riskLevel: response.body.riskLevel}",
			},
		},
	])
	if (problems.length > 0) throw new Error(JSON.stringify(problems))
	return Bpmn.export(definitions)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(buildReference())
