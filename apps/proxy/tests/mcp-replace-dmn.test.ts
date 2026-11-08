/** `replace_diagram` on a DMN file: a dangling `requires` is a clean tool error, not a crash. */
import { spawn } from "node:child_process"
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Dmn } from "@bpmnkit/core"
import { afterAll, describe, expect, it } from "vitest"

const SERVER = fileURLToPath(new URL("../src/mcp-server.ts", import.meta.url))
const dir = mkdtempSync(join(tmpdir(), "bpmnkit-mcp-dmn-"))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

function replaceDiagram(
	diagram: unknown,
): Promise<{ text: string; isError: boolean; wrote: boolean }> {
	const input = join(dir, "in.dmn")
	const output = join(dir, "out.dmn")
	rmSync(output, { force: true })
	writeFileSync(
		input,
		Dmn.export(Dmn.createDecisionTable("risk").input({ label: "A", expression: "a" }).build()),
	)
	return new Promise((resolve, reject) => {
		const proc = spawn(
			process.execPath,
			["--import", "tsx", SERVER, "--input", input, "--output", output],
			{ stdio: ["pipe", "pipe", "ignore"] },
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
			resolve({
				text: res.result.content[0]?.text ?? "",
				isError: res.result.isError,
				wrote: existsSync(output),
			})
		})
		proc.on("error", reject)
		proc.stdin.write(
			`${JSON.stringify({
				jsonrpc: "2.0",
				id: 1,
				method: "tools/call",
				params: { name: "replace_diagram", arguments: { diagram } },
			})}\n`,
		)
	})
}

describe("replace_diagram on a DMN", () => {
	it("returns a clean error for a decision that requires an unknown id", async () => {
		const r = await replaceDiagram({
			inputData: [{ id: "amount", name: "Amount" }],
			decisions: [{ id: "risk", name: "Risk", requires: ["nope"] }],
		})
		expect(r.isError).toBe(true)
		expect(r.text).toContain('requires unknown id "nope"')
		expect(r.text).toContain("Valid ids")
		expect(r.text).not.toMatch(/\n\s+at /)
		expect(r.wrote).toBe(false)
	}, 30000)
})
