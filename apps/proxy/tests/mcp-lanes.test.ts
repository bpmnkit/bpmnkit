/**
 * Saving a diagram with pools and lanes used to replace every diagram with a
 * per-process layout bound to the process, so the lanes and pools lost their
 * shapes. These drive the real MCP server over stdio, and the QuickJS bridge
 * in-process.
 */
import { spawn } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Bpmn, type BpmnDefinitions, allLanes, compactify } from "@bpmnkit/core"
import { afterAll, describe, expect, it } from "vitest"

const SERVER = fileURLToPath(new URL("../src/mcp-server.ts", import.meta.url))
const LANED = fileURLToPath(
	new URL(
		"../../../packages/core/tests/fixtures/roundtrip/08-flowable-lanes-pools.bpmn",
		import.meta.url,
	),
)
const dir = mkdtempSync(join(tmpdir(), "bpmnkit-mcp-lanes-"))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

/** Calls one tool on a fresh server started on `input`; resolves with the tool result's text. */
function callTool(
	name: string,
	args: Record<string, unknown>,
	input: string,
	output: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const proc = spawn(
			process.execPath,
			["--import", "tsx", SERVER, "--input", input, "--output", output],
			{ stdio: ["pipe", "pipe", "ignore"] },
		)
		let out = ""
		proc.stdout.on("data", (chunk: Buffer) => {
			out += chunk.toString()
			const line = out.split("\n").find((l) => l.includes('"id":1'))
			if (!line) return
			const res = JSON.parse(line) as { result: { content: Array<{ text: string }> } }
			proc.kill()
			resolve(res.result.content[0]?.text ?? "")
		})
		proc.on("error", reject)
		proc.stdin.write(
			`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } })}\n`,
		)
	})
}

/** Fails unless every lane and pool has a shape on a plane bound to the collaboration. */
function expectPoolAndLaneDi(defs: BpmnDefinitions): void {
	const plane = defs.diagrams[0]?.plane
	const collaboration = defs.collaborations[0]
	expect(defs.diagrams).toHaveLength(1)
	expect(plane?.bpmnElement).toBe(collaboration?.id)
	const shaped = new Set(plane?.shapes.map((shape) => shape.bpmnElement))
	for (const process of defs.processes) {
		for (const lane of allLanes(process.laneSet)) expect(shaped, lane.id).toContain(lane.id)
	}
	for (const participant of collaboration?.participants ?? []) {
		expect(shaped, participant.id).toContain(participant.id)
	}
}

describe("saving a diagram with pools and lanes", () => {
	it("keeps lane and pool DI when the MCP server writes the file", async () => {
		const output = join(dir, "saved.bpmn")
		const compact = compactify(Bpmn.parse(readFileSync(LANED, "utf8")))
		const text = await callTool("replace_diagram", { diagram: compact }, LANED, output)

		expect(text).toBe("Diagram updated.")
		const saved = Bpmn.parse(readFileSync(output, "utf8"))
		expectPoolAndLaneDi(saved)
		expect(saved.processes.find((p) => p.id === "customer")?.isExecutable).toBe(false)
	}, 30000)

	it("keeps lane and pool DI when the bridge exports XML", async () => {
		await import("../src/bridge.js")
		const bridge = (
			globalThis as unknown as Record<string, Record<string, (arg?: string) => string>>
		).Bridge
		bridge?.mcpInit?.(readFileSync(LANED, "utf8"))
		expectPoolAndLaneDi(Bpmn.parse(bridge?.mcpExportXml?.() ?? ""))
	})
})
