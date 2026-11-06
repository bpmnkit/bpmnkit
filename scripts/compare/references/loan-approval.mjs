// Hand-authored reference for the "Loan Approval" comparison scenario.
// Written from the scenario prompt only. It is not derived from any model output and was not
// informed by any recording or scored run. Deterministic: fixed ids, no clocks or randomness.
import { pathToFileURL } from "node:url"
import { Bpmn } from "../../../packages/core/dist/index.js"

export default function buildReference() {
	const defs = Bpmn.createProcess("loan-approval")
		.name("Loan Approval")
		.executable(true)
		.startEvent("StartEvent_LoanRequested", { name: "Loan application received" })
		.serviceTask("Task_CheckCreditScore", {
			name: "Check credit score",
			taskType: "io.camunda:http-json:1",
			ioMapping: {
				inputs: [
					{ source: '="noAuth"', target: "authentication.type" },
					{ source: '="GET"', target: "method" },
					{
						source: '="https://api.example.com/credit-score?applicantId=" + applicantId',
						target: "url",
					},
				],
			},
			taskHeaders: { resultExpression: "={creditScore: response.body.score}" },
		})
		.withBoundary(
			"BoundaryEvent_CreditCheckFailed",
			{ name: "Credit check failed", errorCode: "CREDIT_CHECK_FAILED" },
			// A bureau outage must not auto-reject an applicant, so a human decides.
			(b) => b.connectTo("Gateway_ReviewJoin"),
		)
		.exclusiveGateway("Gateway_PreScreening", { name: "Credit score of at least 580?" })
		.branch("reject", (b) =>
			b
				.label("No")
				.flowId("Flow_ScoreTooLow")
				.condition("=creditScore < 580")
				.endEvent("EndEvent_LoanRejectedLowScore", { name: "Loan rejected" }),
		)
		.branch("continue", (b) =>
			b
				.label("Yes")
				.flowId("Flow_ScoreAcceptable")
				.defaultFlow()
				.businessRuleTask("Task_ScoreRisk", {
					name: "Score risk",
					decisionId: "loan-risk-scoring",
					resultVariable: "riskScore",
				})
				.exclusiveGateway("Gateway_ReviewJoin")
				.userTask("Task_UnderwriterReview", {
					name: "Review application",
					zeebeUserTask: true,
					candidateGroups: "underwriters",
				})
				.exclusiveGateway("Gateway_UnderwriterDecision", { name: "Approved by underwriter?" })
				.branch("approve", (a) =>
					a
						.label("Yes")
						.flowId("Flow_Approved")
						.condition("=approved = true")
						.endEvent("EndEvent_LoanApproved", { name: "Loan approved" }),
				)
				.branch("decline", (d) =>
					d
						.label("No")
						.flowId("Flow_Declined")
						.defaultFlow()
						.endEvent("EndEvent_LoanRejectedByUnderwriter", { name: "Loan rejected" }),
				),
		)
		.withAutoLayout()
		.build()
	return Bpmn.export(defs)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	process.stdout.write(`${buildReference()}\n`)
}
