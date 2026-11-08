import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import type { RunContext } from "../types.js"
import { deployGroup, gateDeployment } from "./deploy.js"

// A service task with no job type: Zeebe refuses the deployment.
const UNDEPLOYABLE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f</bpmn:outgoing></bpmn:startEvent>
    <bpmn:sequenceFlow id="f" sourceRef="s" targetRef="charge"/>
    <bpmn:serviceTask id="charge"><bpmn:incoming>f</bpmn:incoming></bpmn:serviceTask>
  </bpmn:process>
</bpmn:definitions>`

describe("casen deploy: deploy gate", () => {
	let dir: string
	let file: string
	const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }))

	function run(flags: Record<string, string | boolean>): Promise<void> {
		const cmd = deployGroup.commands[0]
		if (!cmd) throw new Error("deploy command not registered")
		return cmd.run({
			positional: [file],
			flags,
			output: { print() {}, ok() {}, info() {} },
		} as unknown as RunContext)
	}

	beforeAll(() => {
		dir = mkdtempSync(join(tmpdir(), "casen-deploy-"))
		file = join(dir, "order.bpmn")
		writeFileSync(file, UNDEPLOYABLE)
		vi.stubGlobal("fetch", fetchMock)
	})
	afterEach(() => fetchMock.mockClear())
	afterAll(() => {
		vi.unstubAllGlobals()
		rmSync(dir, { recursive: true, force: true })
	})

	it("refuses with the gate's lines and sends nothing", async () => {
		const err = (await run({ target: "local" }).catch((e: Error) => e)) as Error
		expect(err.message).toMatch(/^Not deployable on Camunda \d+\.\d+: 1 error\(s\)\n- charge: /)
		expect(err.message).toContain("(zeebe/service-task-definition)")
		expect(err.message).toContain("--no-validate")
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it("--no-validate sends the file as it is", async () => {
		await run({ target: "local", validate: false })
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it("only gates BPMN", () => {
		expect(() => gateDeployment("form.form", "{}")).not.toThrow()
		expect(() => gateDeployment("x.BPMN", UNDEPLOYABLE)).toThrow(/Not deployable/)
	})
})
