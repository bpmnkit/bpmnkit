import { expand, parseProcessText } from "@bpmnkit/core"
import { applyConnectorLines } from "@bpmnkit/core/connectors"
import { describe, expect, it } from "vitest"
import "../src/testing/vitest.js"
import { createProcessTest } from "../src/testing/index.js"

/**
 * A process written in the line format with `with` lines, as generation writes
 * it, deploys and runs: the REST call's result expression feeds the gateway,
 * and the Slack task gets the message built from it.
 */
const TEXT = `# Triage new GitHub issues
start[start Triage requested] > list[service List open issues] > any[xor New issues?]
any >(Yes: count(issues) > 0) post[service Post summary to Slack] > done[end Summary posted]
any >(No: default) quiet[end Nothing new]
with list: http GET ="https://api.github.com/repos/" + owner + "/" + repo + "/issues" | authentication.type=bearer | authentication.token={{secrets.GITHUB_TOKEN}} | result=issues: response.body
with post: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#triage | data.text== "New issues: " + string(count(issues))`

async function run(body: unknown[]) {
	const parsed = parseProcessText(TEXT)
	const applied = applyConnectorLines(expand(parsed.diagram), parsed.connectors)
	expect([...parsed.problems, ...applied.problems]).toEqual([])
	expect(applied.questions).toEqual([])
	const t = await createProcessTest({ bpmn: applied.definitions })
	const http = t.mockConnector("io.camunda:http-json:1", { response: { status: 200, body } })
	const slack = t.mockConnector("io.camunda:slack:1", { response: { ok: true } })
	const instance = await t.start("Triage_new_GitHub_issues", { owner: "acme", repo: "shop" })
	return { t, instance, http, slack }
}

describe("a generated process with connectors", () => {
	it("calls the API, and posts to Slack when there are issues", async () => {
		const { t, instance, http, slack } = await run([{ id: 1 }, { id: 2 }])
		expect(instance).toHaveCompleted()
		expect(instance).toHaveVariables({ issues: [{ id: 1 }, { id: 2 }] })
		expect(http.calls[0]?.variables).toMatchObject({
			url: "https://api.github.com/repos/acme/shop/issues",
			method: "GET",
		})
		expect(slack.calls[0]?.variables).toMatchObject({
			method: "chat.postMessage",
			token: "{{secrets.SLACK_TOKEN}}",
			"data.channel": "#triage",
			"data.text": "New issues: 2",
		})
		t.dispose()
	})

	it("ends quietly when there are none", async () => {
		const { t, instance, slack } = await run([])
		expect(instance).toHaveCompleted()
		expect(slack.calls).toHaveLength(0)
		t.dispose()
	})
})
