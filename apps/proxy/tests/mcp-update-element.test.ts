/** `update_element` forwards a patch to the core edit API; these drive the real server over stdio. */
import { spawn } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterAll, describe, expect, it } from "vitest"

const SERVER = fileURLToPath(new URL("../src/mcp-server.ts", import.meta.url))
const dir = mkdtempSync(join(tmpdir(), "bpmnkit-mcp-update-"))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

const FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="D" targetNamespace="x">
  <bpmn:message id="M" name="payment-received">
    <bpmn:extensionElements><zeebe:subscription correlationKey="=orderId" /></bpmn:extensionElements>
  </bpmn:message>
  <bpmn:process id="P" isExecutable="true">
    <bpmn:userTask id="U" name="Review">
      <bpmn:extensionElements><zeebe:assignmentDefinition assignee="=initiator" /></bpmn:extensionElements>
    </bpmn:userTask>
    <bpmn:serviceTask id="T"><bpmn:extensionElements><zeebe:taskDefinition type="work" /></bpmn:extensionElements></bpmn:serviceTask>
    <bpmn:intermediateCatchEvent id="C"><bpmn:messageEventDefinition id="MD" messageRef="M" /></bpmn:intermediateCatchEvent>
  </bpmn:process>
</bpmn:definitions>`

function updateElement(
	elementId: string,
	changes: Record<string, unknown>,
	name: string,
): Promise<{ text: string; isError: boolean; xml: string }> {
	const input = join(dir, `${name}.bpmn`)
	const output = join(dir, `${name}.out.bpmn`)
	writeFileSync(input, FIXTURE)
	return new Promise((resolve, reject) => {
		const proc = spawn(
			process.execPath,
			["--import", "tsx", SERVER, "--input", input, "--output", output],
			{
				stdio: ["pipe", "pipe", "ignore"],
			},
		)
		let out = ""
		proc.stdout.on("data", (c: Buffer) => {
			out += c.toString()
			const line = out.split("\n").find((l) => l.includes('"id":1'))
			if (!line) return
			const res = JSON.parse(line) as {
				result: { content: Array<{ text: string }>; isError: boolean }
			}
			proc.kill()
			let xml = ""
			try {
				xml = readFileSync(output, "utf8")
			} catch {
				/* a failed edit writes nothing */
			}
			resolve({ text: res.result.content[0]?.text ?? "", isError: res.result.isError, xml })
		})
		proc.on("error", reject)
		proc.stdin.write(
			`${JSON.stringify({
				jsonrpc: "2.0",
				id: 1,
				method: "tools/call",
				params: { name: "update_element", arguments: { processId: "P", elementId, changes } },
			})}\n`,
		)
	})
}

describe("update_element patches", () => {
	it("changes the assignee of a user task", async () => {
		const r = await updateElement("U", { assignee: "anna" }, "assignee")
		expect(r.isError).toBe(false)
		expect(r.xml).toContain('assignee="anna"')
		expect(r.xml).not.toContain("=initiator")
	}, 30000)

	it("changes the correlation key held on the message", async () => {
		const r = await updateElement("C", { correlationKey: "=order.id" }, "key")
		expect(r.isError).toBe(false)
		expect(r.xml).toContain('correlationKey="=order.id"')
	}, 30000)

	it("clears the assignee with an empty string", async () => {
		const r = await updateElement("U", { assignee: "" }, "clear")
		expect(r.isError).toBe(false)
		expect(r.xml).not.toContain("assignmentDefinition")
	}, 30000)

	it("names the extension when a field is misplaced", async () => {
		const r = await updateElement("T", { assignee: "anna" }, "misplaced")
		expect(r.isError).toBe(true)
		expect(r.text).toContain("zeebe:assignmentDefinition")
	}, 30000)

	it("rejects an unknown key", async () => {
		const r = await updateElement("U", { assgnee: "anna" }, "unknown")
		expect(r.isError).toBe(true)
		expect(r.text).toContain("assgnee")
	}, 30000)
})
