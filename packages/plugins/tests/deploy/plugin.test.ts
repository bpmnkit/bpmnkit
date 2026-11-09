// @vitest-environment happy-dom
import { Bpmn } from "@bpmnkit/core"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createDeployPlugin, deployVerdict } from "../../src/deploy/index.js"

// A service task with no job type: Zeebe refuses the deployment.
const REFUSED = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f</bpmn:outgoing></bpmn:startEvent>
    <bpmn:sequenceFlow id="f" sourceRef="s" targetRef="charge"/>
    <bpmn:serviceTask id="charge"><bpmn:incoming>f</bpmn:incoming></bpmn:serviceTask>
  </bpmn:process>
</bpmn:definitions>`

const DEPLOYS = REFUSED.replace(
	'<bpmn:serviceTask id="charge">',
	'<bpmn:serviceTask id="charge"><bpmn:extensionElements><zeebe:taskDefinition xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" type="charge"/></bpmn:extensionElements>',
)

afterEach(() => {
	vi.unstubAllGlobals()
	document.body.innerHTML = ""
})

describe("deployVerdict", () => {
	it("refuses with the gate's message and one line per error", () => {
		const verdict = deployVerdict(REFUSED, Bpmn.parse(REFUSED))
		expect(verdict.ok).toBe(false)
		if (verdict.ok) return
		expect(verdict.message).toMatch(/^Not deployable on Camunda \d+\.\d+: 1 error\(s\)\n- charge: /)
		expect(verdict.lines).toEqual([
			"charge: Must have exactly one 'zeebe:taskDefinition' extension element (zeebe/service-task-definition)",
		])
	})

	it("lets a model the gate accepts deploy", () => {
		expect(deployVerdict(DEPLOYS, Bpmn.parse(DEPLOYS)).ok).toBe(true)
	})
})

describe("deploy pane", () => {
	it("shows the gate's lines and keeps the deploy button disabled", async () => {
		// A running proxy with no profiles: only the verdict decides.
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("[]", { status: 200 })),
		)
		const plugin = createDeployPlugin({
			getDefinitions: () => Bpmn.parse(REFUSED),
			getXml: () => REFUSED,
		})
		const container = document.createElement("div")
		document.body.appendChild(container)
		plugin.mount(container)
		await vi.waitFor(() => expect(container.textContent).toContain("Not deployable on Camunda"))
		expect(container.textContent).toContain("(zeebe/service-task-definition)")
		const button = [...container.querySelectorAll("button")].find((b) =>
			b.textContent?.includes("Deploy Process"),
		)
		expect(button?.disabled).toBe(true)
	})
})
