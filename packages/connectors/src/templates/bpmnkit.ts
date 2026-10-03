import type { ElementTemplate } from "../template-types.js"

/**
 * Element templates written and maintained in this repo, not mirrored from the
 * Camunda marketplace.
 *
 * Kept apart from `generated.ts`, which `pnpm update-connectors` overwrites.
 * Each one runs on a connector the Camunda runtime already ships (the REST
 * connector, `io.camunda:http-json:1`), so a cluster needs no extra job worker
 * to use it.
 */
export const BPMNKIT_CONNECTOR_TEMPLATES: ElementTemplate[] = [
	{
		name: "Cloudflare Clef Decision",
		id: "io.bpmnkit.connectors.CloudflareClef.v1",
		version: 1,
		description:
			"Classify process data with a Cloudflare Clef decision model — yes/no, choice and score answers with calibrated probabilities, for routing a gateway",
		documentationRef: "https://bpmnkit.com/docs/guides/ai-decisions",
		category: { id: "ai-decisions", name: "AI decisions" },
		appliesTo: ["bpmn:Task"],
		elementType: { value: "bpmn:ServiceTask" },
		groups: [
			{ id: "authentication", label: "Authentication" },
			{ id: "model", label: "Model" },
			{ id: "decision", label: "Decision" },
			{ id: "timeout", label: "Connection timeout" },
			{ id: "output", label: "Output mapping" },
			{ id: "errors", label: "Error handling" },
			{ id: "retries", label: "Retries" },
		],
		properties: [
			{
				type: "Hidden",
				value: "io.camunda:http-json:1",
				binding: { type: "zeebe:taskDefinition", property: "type" },
			},
			{
				type: "Hidden",
				value: "POST",
				binding: { type: "zeebe:input", name: "method" },
			},
			{
				type: "Hidden",
				value: "bearer",
				binding: { type: "zeebe:input", name: "authentication.type" },
			},
			{
				id: "authentication.token",
				label: "API token",
				description: "A Cloudflare API token with Workers AI read permission",
				type: "String",
				group: "authentication",
				value: "{{secrets.CLOUDFLARE_API_TOKEN}}",
				feel: "optional",
				binding: { type: "zeebe:input", name: "authentication.token" },
				constraints: { notEmpty: true },
			},
			{
				id: "accountId",
				label: "Account ID",
				description: "The Cloudflare account that runs the model",
				type: "String",
				group: "authentication",
				value: "{{secrets.CLOUDFLARE_ACCOUNT_ID}}",
				feel: "optional",
				binding: { type: "zeebe:input", name: "cloudflareAccountId" },
				constraints: { notEmpty: true },
			},
			{
				id: "model",
				label: "Model",
				description:
					"Clef is the more accurate model and reads images; Clef-flash answers in a fraction of the time",
				type: "Dropdown",
				group: "model",
				value: "clef",
				choices: [
					{ name: "Clef", value: "clef" },
					{ name: "Clef-flash", value: "clef-flash" },
				],
				binding: { type: "zeebe:input", name: "body.model" },
			},
			// The model id appears in the path as well as the body. One URL per
			// choice keeps the two from drifting apart; the account id comes from
			// the input mapping above, which Zeebe applies first.
			{
				id: "url.clef",
				type: "Hidden",
				value:
					'="https://api.cloudflare.com/client/v4/accounts/" + cloudflareAccountId + "/ai/run/@cf/cloudflare/clef"',
				binding: { type: "zeebe:input", name: "url" },
				condition: { property: "model", equals: "clef" },
			},
			{
				id: "url.clefFlash",
				type: "Hidden",
				value:
					'="https://api.cloudflare.com/client/v4/accounts/" + cloudflareAccountId + "/ai/run/@cf/cloudflare/clef-flash"',
				binding: { type: "zeebe:input", name: "url" },
				condition: { property: "model", equals: "clef-flash" },
			},
			{
				id: "body.state",
				label: "State",
				description:
					"What the model evaluates: text, or a context or list such as a ticket, a record or a chat log. Long text is truncated to the 64k-token context.",
				type: "Text",
				group: "decision",
				feel: "required",
				binding: { type: "zeebe:input", name: "body.state" },
				constraints: { notEmpty: true },
			},
			{
				id: "body.questions",
				label: "Questions",
				description:
					'A context of 1 to 64 questions keyed by id. Each has a type — "noul" (yes/no), "choice" (one of the keys in criteria) or "score" (a list of levels, lowest first) — and instructions. Answers come back under the same ids.',
				type: "Text",
				group: "decision",
				feel: "required",
				binding: { type: "zeebe:input", name: "body.questions" },
				constraints: { notEmpty: true },
			},
			{
				id: "body.images",
				label: "Images",
				description:
					"Optional. Up to 4 base64 data URLs (PNG, JPEG or WebP), 4 MiB each and 8 MiB in total, placed before the state. Remote URLs are not accepted.",
				type: "Text",
				group: "decision",
				feel: "required",
				optional: true,
				binding: { type: "zeebe:input", name: "body.images" },
			},
			{
				label: "Connection timeout in seconds",
				type: "Number",
				group: "timeout",
				value: "=20",
				feel: "static",
				binding: { type: "zeebe:input", name: "connectionTimeoutInSeconds" },
			},
			{
				label: "Read timeout in seconds",
				type: "Number",
				group: "timeout",
				value: "=20",
				feel: "static",
				binding: { type: "zeebe:input", name: "readTimeoutInSeconds" },
			},
			{
				label: "Result variable",
				description: "Stores the whole response (status, headers and body) in this variable",
				type: "String",
				group: "output",
				binding: { type: "zeebe:taskHeader", key: "resultVariable" },
			},
			{
				id: "resultExpression",
				label: "Result expression",
				description:
					"Workers AI wraps the model's answer in result. The default keeps the answers, keyed by question id, in the variable clef.",
				type: "Text",
				group: "output",
				value: "={clef: response.body.result.answers}",
				feel: "required",
				binding: { type: "zeebe:taskHeader", key: "resultExpression" },
			},
			{
				label: "Error expression",
				description: "Raise a BPMN error or incident from the response",
				type: "Text",
				group: "errors",
				feel: "required",
				binding: { type: "zeebe:taskHeader", key: "errorExpression" },
			},
			{
				label: "Retries",
				type: "String",
				group: "retries",
				value: "3",
				binding: { type: "zeebe:taskDefinition", property: "retries" },
			},
			{
				label: "Retry backoff",
				description: "ISO-8601 duration to wait between retries",
				type: "String",
				group: "retries",
				value: "PT0S",
				binding: { type: "zeebe:taskHeader", key: "retryBackoff" },
			},
		],
	},
]
