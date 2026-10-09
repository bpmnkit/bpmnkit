import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { answer, indexPacks, loadPack } from "@bpmnkit/docspack"
import { describe, expect, it } from "vitest"

/**
 * A fixed set of questions against the committed pack, each with the chunk that answers it.
 * A ranking change in @bpmnkit/docspack is measured here before it ships: the target must be in
 * the chunks an answer returns, not only in its "more matches".
 *
 * A target is a chunk id or an id prefix, so a question that any section of one page answers
 * names the page. The weekly rebuild can rename a section; then update the target here.
 */
const index = indexPacks([loadPack(join(dirname(fileURLToPath(import.meta.url)), ".."))])

interface Case {
	question: string
	targets: string[]
	/** Why the ranking misses this one today. The test then expects the miss, and fails once fixed. */
	knownMiss?: string
}

// The questions of the first comparison with the Camunda Docs MCP server.
const MCP_COMPARISON: Case[] = [
	{
		question: "how should I name an exclusive gateway",
		targets: ["components.best-practices.modeling.naming-bpmn-elements.naming-gateways"],
	},
	{
		question: "what permissions does creating a process instance need",
		targets: [
			"components.concepts.access-control.authorizations.common-authorization-use-cases",
			"apis-tools.orchestration-cluster-api-rest.specifications.create-process-instance.api",
		],
	},
	{
		question: "FEEL string concatenation",
		targets: ["components.modeler.feel.language-guide.feel-string-expressions"],
	},
	{
		question: "POST /jobs/activation",
		targets: ["apis-tools.orchestration-cluster-api-rest.specifications.activate-jobs.api"],
	},
	{
		question: "what happens when a job runs out of retries and how do I resolve the incident",
		targets: [
			"components.concepts.incidents",
			"components.concepts.job-workers.completing-or-failing-jobs",
			"components.best-practices.development.dealing-with-problems-and-exceptions.handling-exceptions-on-a-technical-level-using-incidents",
		],
	},
	{
		question: "consistency guarantee of search endpoints",
		targets: [
			"apis-tools.orchestration-cluster-api-rest.orchestration-cluster-api-rest-data-fetching",
		],
	},
	// These two had no answer in the pack until it took in Self-Managed and the client guides.
	{
		question: "how do I enable multi-tenancy in 8.7 self-managed",
		targets: [
			"self-managed.components.orchestration-cluster.core-settings.configuration.properties",
		],
	},
	{
		question: "Spring Zeebe client UNAUTHENTICATED error SaaS",
		targets: [
			"self-managed.components.orchestration-cluster.zeebe.security.client-authorization",
			"components.saas.clusters.manage-api-clients",
			"apis-tools.camunda-spring-boot-starter",
		],
		knownMiss:
			"ranks 5th since the Python SDK and the MCP client setup pages are in the pack: they share its words, and the page that answers it names no more of them",
	},
]

// Questions written after the ranking was tuned on the set above, to catch overfitting.
const HELD_OUT: Case[] = [
	{
		question: "should my worker be idempotent if the same job is delivered twice",
		targets: [
			"components.best-practices.development.writing-good-workers.write-idempotent-workers",
		],
	},
	{
		question: "how do I cut a process that runs for years into smaller parts",
		targets: [
			"components.best-practices.operations.versioning-process-definitions.dealing-with-long-running-processes",
		],
	},
	{
		question: "difference between authentication and authorization",
		targets: ["components.concepts.access-control.access-control-overview.authentication-vs"],
		knownMiss:
			"ranks 7th since Self-Managed is in the pack: its OIDC and Keycloak pages say both words far more often",
	},
	{
		question: "can one message be correlated to several waiting instances",
		targets: ["components.concepts.messages.message-cardinality"],
		knownMiss:
			"ranks 12th: general message pages, message assertions and the RabbitMQ connector say every query word in prose",
	},
	{
		question: "move a running instance to a newer version of the process",
		targets: ["components.concepts.process-instance-migration"],
	},
	{
		question: "how do variables propagate out of a subprocess",
		targets: ["components.concepts.variables.variable-scopes"],
	},
	{
		question: "which DMN hit policy adds up the scores of all matching rules",
		targets: ["components.best-practices.modeling.choosing-the-dmn-hit-policy"],
	},
	{
		question: "skip a stuck task in a running instance",
		targets: ["components.concepts.process-instance-modification"],
	},
	{
		question: "service task or a send task with a receive task, which one should I pick",
		targets: [
			"components.best-practices.development.service-integration-patterns.integrating-services-with-bpmn-tasks",
		],
	},
	{
		question: "push jobs to a worker instead of polling for them",
		targets: ["components.concepts.job-workers.job-streaming"],
	},
	{
		question: "model that a second person must approve a decision",
		targets: [
			"components.best-practices.modeling.modeling-with-situation-patterns.requiring-a-second-set-of-eyes",
		],
	},
	{
		question: "how much storage does Elasticsearch need",
		targets: ["components.best-practices.architecture.sizing"],
		knownMiss:
			"ranks 10th since Self-Managed is in the pack: its secondary-storage pages are about Elasticsearch, not its size",
	},
]

// Questions for the areas added after the sets above, which the pack did not cover before: DMN,
// forms, element templates, the Camunda 7 migration guides, the glossary, c8ctl and the audit log.
const NEW_AREAS: Case[] = [
	{
		question: "which hit policy returns the outputs of all matching rules in a decision table",
		targets: ["components.modeler.dmn.decision-table-hit-policy"],
	},
	{
		question: "let users add several rows of the same fields in a Camunda form",
		targets: ["components.modeler.forms.form-element-library.forms-element-library-dynamiclist"],
		knownMiss:
			'ranks 41st: the page says "dynamically manage a list" where the question says "add several rows", and the forms configuration pages share more of its words',
	},
	{
		question: "calculate the value of a form field from other fields",
		targets: ["components.modeler.forms.form-element-library.forms-element-library-expression"],
		knownMiss:
			'ranks 14th: the page says "compute form state", so the forms configuration pages outrank it',
	},
	{
		question: "what is different between the Camunda 7 and Camunda 8 architecture",
		targets: ["guides.migrating-from-camunda-7.conceptual-differences"],
	},
	{
		question: "convert my JavaDelegate into a job worker",
		targets: [
			"guides.migrating-from-camunda-7.migration-tooling.code-conversion",
			"guides.migrating-from-camunda-7.migration-readiness.clean-delegates",
			"guides.migrating-from-camunda-7.migration-journey.refactor-code",
		],
	},
	{
		question: "deploy a BPMN file from the command line",
		targets: [
			"apis-tools.c8ctl.command-reference.commands-deploy",
			"apis-tools.c8ctl.development-workflows.deploy",
		],
	},
	{
		question: "who is allowed to read the audit log",
		targets: ["components.audit-log.overview.access-control"],
		knownMiss:
			"ranks 11th: the digests of the three audit-log endpoints outrank the page: they are short and repeat the query words",
	},
	{
		question: "write my own element template JSON for a task",
		targets: ["components.modeler.element-templates.defining-templates"],
		knownMiss:
			'ranks 33rd: "element template" is in 66 chunks, mostly connector pages, so the page that defines templates is one of many',
	},
	{
		question: "connect Camunda to SAP",
		targets: ["components.camunda-integrations.sap"],
	},
	{
		question: "put a FEEL expression in a decision instead of a table",
		targets: ["components.modeler.dmn.decision-literal-expression"],
	},
	{
		question: "first process hello world tutorial for Camunda 8",
		targets: ["guides.getting-started-hello-world", "guides.getting-started-example"],
	},
]

// Questions put to the Camunda Docs MCP server on 2026-10-09. A target is one of the first two
// docs.camunda.io pages it returned, so this set is labelled by a system other than this one.
const MCP_LABELLED: Case[] = [
	{
		question:
			"How do I configure the job worker timeout and the maximum number of jobs to activate in the Java client?",
		targets: [
			"apis-tools.java-client.job-worker",
			"components.best-practices.development.writing-good-workers",
		],
	},
	{
		question: "How do I install Camunda 8 Self-Managed on Kubernetes with Helm?",
		targets: ["self-managed.deployment.helm.install", "self-managed.deployment.helm"],
	},
	{
		question: "What is the difference between a message start event and a signal start event?",
		targets: ["components.modeler.bpmn.message-events", "components.modeler.bpmn.signal-events"],
	},
	{
		question: "How can I call a REST API from a BPMN process without writing code?",
		targets: ["components.connectors.protocol.rest"],
		knownMiss:
			"is not in the top 60: pages that share more of the question's words outrank the page the MCP returns first",
	},
	{
		question: "How do I escalate a user task after two days with a boundary timer event?",
		targets: [
			"components.concepts.workflow-patterns",
			"components.concepts.process-instance-migration",
		],
	},
	{
		question: "How do I assign a user task to a candidate group?",
		targets: ["components.modeler.bpmn.user-tasks"],
	},
	{
		question: "How do I migrate Camunda 7 external task workers to Camunda 8 job workers?",
		targets: [
			"guides.migrating-from-camunda-7.migration-tooling.code-conversion",
			"guides.migrating-from-camunda-7.migration-journey",
		],
	},
	{
		question: "How do I call a DMN decision from a BPMN process with a business rule task?",
		targets: [
			"components.hub.workspace.modeler.modeling.advanced-modeling.business-rule-task-linking",
			"components.modeler.bpmn.business-rule-tasks",
		],
	},
	{
		question: "How do I search for process instances by a variable value with the REST API?",
		targets: [
			"apis-tools.orchestration-cluster-api-rest.specifications.search-process-instances",
			"apis-tools.orchestration-cluster-api-rest.orchestration-cluster-api-rest-data-fetching",
		],
		knownMiss:
			"ranks 7th: pages that share more of the question's words outrank the page the MCP returns first",
	},
	{
		question: "How do I back up and restore Camunda 8 Self-Managed data?",
		targets: ["self-managed.operational-guides.backup-restore.backup-and-restore"],
		knownMiss:
			"ranks 11th: pages that share more of the question's words outrank the page the MCP returns first",
	},
	{
		question: "Which Java versions and environments does Camunda 8 support?",
		targets: ["reference.supported-environments"],
	},
	{
		question:
			"How do I connect the Orchestration Cluster to an external OIDC identity provider such as Microsoft Entra ID?",
		targets: [
			"components.saas.clusters.connect-external-identity-provider",
			"self-managed.deployment.helm.configure.authentication-and-authorization.microsoft-entra",
		],
		knownMiss:
			"ranks 5th: pages that share more of the question's words outrank the page the MCP returns first",
	},
	{
		question: "How do I start a process instance with the Camunda Python SDK?",
		targets: ["apis-tools.python-sdk.creating-a-process-instance"],
		knownMiss:
			"ranks 4th: pages that share more of the question's words outrank the page the MCP returns first",
	},
	{
		question: "How do I set a retry back off when failing a job?",
		targets: ["components.concepts.job-workers", "apis-tools.python-sdk.job-workers"],
	},
	{
		question:
			"How do I configure the connection from Camunda to a secured Elasticsearch with a username and password?",
		targets: [
			"self-managed.components.optimize.configuration.system-configuration",
			"self-managed.components.orchestration-cluster.core-settings.configuration.properties",
		],
	},
	{
		question: "How do I write automated tests for a BPMN process with Camunda Process Test?",
		targets: [
			"apis-tools.testing.getting-started",
			"components.best-practices.development.testing-process-definitions",
		],
	},
	{
		question: "How do I filter a list of objects by a property in FEEL?",
		targets: [
			"components.modeler.feel.language-guide.feel-context-expressions",
			"components.modeler.feel.language-guide.feel-list-expressions",
		],
		knownMiss:
			"ranks 4th: pages that share more of the question's words outrank the page the MCP returns first",
	},
	{
		question: "How do I handle a BPMN error thrown by a job worker with an error boundary event?",
		targets: ["apis-tools.python-sdk.job-workers", "components.modeler.bpmn.error-events"],
	},
	{
		question: "How do I give an AI agent tools in an ad-hoc sub-process?",
		targets: [
			"components.agentic-orchestration.add-tool-to-ai-agent",
			"components.connectors.out-of-the-box-connectors.agentic-ai-aiagent-task-example",
		],
	},
	{
		question: "What is the maximum size of process variables in Camunda 8?",
		targets: [
			"components.concepts.variables",
			"components.best-practices.architecture.sizing-your-environment",
		],
		knownMiss:
			"ranks 5th: pages that share more of the question's words outrank the page the MCP returns first",
	},
	{
		question: "How do I upgrade the Camunda Helm chart from 8.8 to 8.9?",
		targets: ["self-managed.upgrade"],
	},
	{
		question: "What is the difference between a call activity and an embedded sub-process?",
		targets: ["components.modeler.bpmn.call-activities", "components.concepts.variables"],
		knownMiss:
			"ranks 17th: pages that share more of the question's words outrank the page the MCP returns first",
	},
	{
		question: "How do I trigger a process with the inbound webhook connector?",
		targets: [
			"components.connectors.protocol.http-webhook",
			"components.connectors.out-of-the-box-connectors.databricks.databricks-ai-fraud-detection",
		],
	},
	{
		question: "How do I run a multi-instance task in parallel over a collection?",
		targets: ["components.modeler.bpmn.multi-instance", "components.concepts.workflow-patterns"],
	},
]

function matches(chunkId: string, target: string): boolean {
	return chunkId === target || chunkId.startsWith(`${target}.`) || chunkId.startsWith(`${target}-`)
}

function answers({ question, targets }: Case): boolean {
	return answer(index, question).hits.some((hit) =>
		targets.some((target) => matches(hit.chunk.id, target)),
	)
}

describe.each([
	["questions of the MCP comparison", MCP_COMPARISON],
	["held-out questions", HELD_OUT],
	["questions for the added areas", NEW_AREAS],
	["questions labelled by the MCP's pages", MCP_LABELLED],
])("retrieval: %s", (_, cases) => {
	// Separate from the ranking tests, so a renamed section fails here and cannot pass as a
	// known miss.
	it.each(cases)("has a chunk for every target of: $question", ({ targets }) => {
		for (const target of targets) {
			expect(
				index.chunks.some((c) => matches(c.chunk.id, target)),
				target,
			).toBe(true)
		}
	})

	it.each(cases.filter((c) => !c.knownMiss))("answers: $question", (c) => {
		expect(answers(c)).toBe(true)
	})

	const misses = cases.filter((c) => c.knownMiss)
	if (misses.length > 0) {
		it.fails.each(misses)("misses: $question ($knownMiss)", (c) => {
			expect(answers(c)).toBe(true)
		})
	}
})
