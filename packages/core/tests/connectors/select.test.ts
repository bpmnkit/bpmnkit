import { describe, expect, it } from "vitest"
import {
	type ConnectorTask,
	formatConnectorSelection,
	selectConnectors,
} from "../../src/connectors/index.js"

function picked(text: string, tasks: ConnectorTask[]): Record<string, string[]> {
	return Object.fromEntries(
		selectConnectors({ text, tasks }).map((t) => [
			t.id,
			t.cards.map((c) => `${c.alias}${c.operation ? ` ${c.operation}` : ""}`),
		]),
	)
}

describe("selectConnectors", () => {
	it("picks the system a task's name or the request names, best operation first", () => {
		const result = picked("Every hour, list open GitHub issues and post a summary to Slack", [
			{ id: "list", name: "List open issues", type: "serviceTask" },
			{ id: "post", name: "Post summary to Slack", type: "serviceTask" },
		])
		expect(result.list?.[0]).toMatch(/^github /)
		expect(result.post?.[0]).toBe("slack chat.postMessage")
	})

	it("ranks the request's system first on a task that names one the request does not", () => {
		// glm-4.7-flash, golden prompt 21: the draft said Slack, the request Teams
		const result = picked(
			"Append every new lead to our Google Sheet, then notify the sales team in Microsoft Teams.",
			[
				{ id: "sheet", name: "Append lead to Google Sheet", type: "serviceTask" },
				{ id: "notify", name: "Post summary to Slack", type: "sendTask" },
			],
		)
		expect(result.sheet?.[0]).toBe("google-sheets addValues")
		expect(result.notify?.[0]).toMatch(/^teams sendMessageTo/)
	})

	it("keeps a system for the task that names it, rather than every task the request covers", () => {
		const result = picked("When an order fails, tell ops in Slack", [
			{ id: "log", name: "Record failure", type: "serviceTask" },
			{ id: "notify", name: "Notify ops in Slack", type: "serviceTask" },
		])
		expect(result.log).toBeUndefined()
		expect(result.notify?.[0]).toBe("slack chat.postMessage")
	})

	it("ranks a message-sending operation first for a task that notifies", () => {
		const result = picked("When an order fails, notify the ops team in Slack", [
			{ id: "notify", name: "Notify ops team", type: "serviceTask" },
		])
		expect(result.notify?.[0]).toBe("slack chat.postMessage")
	})

	it("matches a connector by a word of its name", () => {
		expect(
			picked("Publish an order-created event", [
				{ id: "pub", name: "Publish order created event", type: "serviceTask" },
			]).pub,
		).toContain("kafka")
		expect(
			picked("Send the customer a confirmation", [
				{ id: "confirm", name: "Send confirmation email", type: "sendTask" },
			]).confirm?.[0],
		).toMatch(/^email /)
	})

	it("offers the REST connector for a task that asks for an HTTP call and fits nothing else", () => {
		expect(
			picked("Look up the address", [
				{ id: "lookup", name: "Fetch shipping address", type: "serviceTask" },
			]),
		).toEqual({ lookup: ["http"] })
	})

	it("gives an event only connectors its own name asks for, of its own kind", () => {
		const result = picked("Start on a webhook, then post to Slack", [
			{ id: "start", name: "Order webhook received", type: "startEvent" },
			{ id: "tick", name: "Every hour", type: "startEvent" },
		])
		expect(result.start?.[0]).toBe("webhook-start")
		expect(result.tick).toBeUndefined()
	})

	it("picks nothing for a process that calls no outside system", () => {
		expect(
			selectConnectors({
				text: "Expense approval: a manager approves expenses over 1000",
				tasks: [
					{ id: "review", name: "Review expense", type: "userTask" },
					{ id: "pay", name: "Pay expense", type: "serviceTask" },
				],
			}),
		).toEqual([])
	})

	it("keeps every task's best card before any task gets a second", () => {
		const tasks: ConnectorTask[] = ["a", "b", "c", "d", "e"].map((id) => ({
			id,
			name: "Post to Slack",
			type: "serviceTask",
		}))
		const selection = selectConnectors({ tasks }, { perTask: 3, total: 7 })
		expect(selection.map((t) => t.cards.length)).toEqual([2, 2, 1, 1, 1])
	})

	it("formats the selection as a prompt block, one task per paragraph", () => {
		const block = formatConnectorSelection(
			selectConnectors(
				{ tasks: [{ id: "post", name: "Post to Slack", type: "serviceTask" }] },
				{ perTask: 1 },
			),
		)
		expect(block.split("\n")[0]).toBe("post (Post to Slack):")
		expect(block.split("\n")[1]).toMatch(/^slack chat\.postMessage — /)
	})
})
