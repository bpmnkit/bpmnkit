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
