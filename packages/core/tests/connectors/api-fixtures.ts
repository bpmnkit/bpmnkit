/** Parts of real services of `@bpmnkit/connector-gen/api-index`, as tests need them. */
import type { ApiService } from "../../src/connectors/index.js"

export const GITHUB: ApiService = {
	id: "github",
	name: "GitHub REST API",
	baseUrl: "https://api.github.com",
	auth: { type: "bearer" },
	license: "MIT",
	operations: [
		{
			method: "GET",
			path: "/repos/{owner}/{repo}/actions/runs",
			summary: "List workflow runs for a repository",
			query: ["status", "actor", "branch", "event", "per_page", "page"],
		},
		{
			method: "POST",
			path: "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
			summary: "Create a workflow dispatch event",
			body: ["ref*", "inputs", "return_run_details"],
		},
		{
			method: "GET",
			path: "/repos/{owner}/{repo}/issues",
			summary: "List repository issues",
			query: ["milestone", "state", "assignee", "type", "creator", "mentioned"],
		},
		{
			method: "POST",
			path: "/repos/{owner}/{repo}/issues",
			summary: "Create an issue",
			body: ["title*", "body", "assignee", "milestone", "labels", "assignees"],
		},
		{
			method: "GET",
			path: "/repos/{owner}/{repo}/pulls",
			summary: "List pull requests",
			query: ["state", "head", "base", "sort", "direction", "per_page"],
		},
	],
}

export const STRIPE: ApiService = {
	id: "stripe",
	name: "Stripe API",
	baseUrl: "https://api.stripe.com",
	auth: { type: "bearer" },
	operations: [
		{
			method: "GET",
			path: "/v1/customers",
			summary: "List all customers",
			query: ["email", "created", "ending_before", "expand", "limit", "starting_after"],
		},
		{
			method: "POST",
			path: "/v1/customers",
			summary: "Create a customer",
			body: ["name", "email", "description", "address", "balance", "business_name"],
			form: true,
		},
		{
			method: "GET",
			path: "/v1/invoices",
			summary: "List all invoices",
			query: ["status", "collection_method", "created", "customer", "customer_account", "due_date"],
		},
		{
			method: "POST",
			path: "/v1/invoices",
			summary: "Create an invoice",
			body: [
				"description",
				"currency",
				"account_tax_ids",
				"application_fee_amount",
				"auto_advance",
				"automatic_tax",
			],
			form: true,
		},
		{
			method: "POST",
			path: "/v1/payment_intents",
			summary: "Create a PaymentIntent",
			body: [
				"amount*",
				"currency*",
				"description",
				"allowed_payment_method_types",
				"amount_details",
				"application_fee_amount",
			],
			form: true,
		},
		{
			method: "POST",
			path: "/v1/refunds",
			summary: "Create a refund",
			body: ["amount", "currency", "charge", "customer", "expand", "instructions_email"],
			form: true,
		},
	],
}

export const NOTION: ApiService = {
	id: "notion",
	name: "Notion API",
	baseUrl: "https://api.notion.com",
	auth: { type: "bearer" },
	operations: [
		{
			method: "GET",
			path: "/v1/users",
			summary: "List all users",
			query: ["start_cursor", "page_size"],
			headers: ["Notion-Version: 2026-03-11"],
		},
		{
			method: "POST",
			path: "/v1/pages",
			summary: "Create a page",
			query: ["filter_properties"],
			headers: ["Notion-Version: 2026-03-11"],
			body: ["content", "parent", "properties", "icon", "cover", "children"],
		},
		{
			method: "PATCH",
			path: "/v1/pages/{page_id}",
			summary: "Update page",
			query: ["filter_properties"],
			headers: ["Notion-Version: 2026-03-11"],
			body: ["properties", "icon", "cover", "is_locked", "template", "erase_content"],
		},
	],
}

export const JIRA: ApiService = {
	id: "jira",
	name: "Atlassian Jira API",
	auth: { type: "basic" },
	license: "Apache 2.0",
	operations: [
		{
			method: "POST",
			path: "/rest/api/3/issue",
			summary: "Create issue",
			query: ["updateHistory"],
			body: ["fields", "historyMetadata", "properties", "transition", "update"],
		},
	],
}

export const SENDGRID: ApiService = {
	id: "sendgrid",
	name: "SendGrid Mail API",
	baseUrl: "https://api.sendgrid.com",
	auth: { type: "bearer" },
	license: "MIT",
	operations: [
		{
			method: "POST",
			path: "/v3/mail/send",
			summary: "Send Email with Twilio SendGrid",
			body: ["personalizations*", "from*", "content", "reply_to", "reply_to_list", "subject"],
		},
	],
}
