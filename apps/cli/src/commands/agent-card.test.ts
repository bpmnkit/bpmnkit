import { spawnSync } from "node:child_process"
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Bpmn, Dmn, Form, PROCESS_TEXT_GUIDE } from "@bpmnkit/core"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import type { RunContext } from "../types.js"
import {
	AGENT_CARD_KINDS,
	type AgentCardKind,
	agentCardGroup,
	readAgentCard,
} from "./agent-card.js"
import { buildGroup } from "./build.js"
import { commandGroups } from "./index.js"

const CARDS = fileURLToPath(new URL("../../agent-cards/", import.meta.url))
const ROOT = fileURLToPath(new URL("../../../../", import.meta.url))
const BPMN_TEMPLATES = ["bpmn-process.txt", "bpmn-pools.txt", "bpmn-edit.mjs"]

async function print(kind: AgentCardKind, flags: Record<string, boolean> = {}): Promise<string> {
	const cmd = agentCardGroup.commands.find((c) => c.name === kind)
	if (!cmd) throw new Error(`no ${kind} card command`)
	let out = ""
	const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
		out += String(chunk)
		return true
	})
	try {
		await cmd.run({ positional: [], flags } as unknown as RunContext)
	} finally {
		spy.mockRestore()
	}
	return out
}

describe("casen agent-card", () => {
	it("is routed as a pinned group with one command per file type", () => {
		const group = commandGroups.find((g) => g.name === "agent-card")
		expect(group?.commands.map((c) => c.name)).toEqual(["bpmn", "dmn", "form"])
	})

	it.each(AGENT_CARD_KINDS)("prints the %s card without the docs-pack directive", async (kind) => {
		const out = await print(kind)
		expect(out).not.toContain("<!-- docspack:")
		expect(out).toBe(readAgentCard(kind).replace(/^<!-- docspack:.*-->\n\n/m, ""))
	})

	it("appends the process text guide with --text", async () => {
		const out = await print("bpmn", { text: true })
		expect(out.startsWith(await print("bpmn"))).toBe(true)
		expect(out).toContain(PROCESS_TEXT_GUIDE)
	})

	it.each(AGENT_CARD_KINDS)("keeps the %s card near 2k tokens", (kind) => {
		// The same 4-characters-a-token estimate docspack uses; the cards exist to be cheap.
		expect(readAgentCard(kind).length / 4).toBeLessThan(2000)
	})

	it.each(["dmn", "form"] as const)("shows the %s script exactly as the tested file", (kind) => {
		const fence = readAgentCard(kind).match(/```ts\n([\s\S]*?)```/)?.[1]
		expect(fence).toBe(readFileSync(join(CARDS, "scripts", `${kind}.ts`), "utf8"))
	})

	it("shows the bpmn templates exactly as the tested files", () => {
		const fences = [...readAgentCard("bpmn").matchAll(/```(?:text|js)\n([\s\S]*?)```/g)].map(
			(m) => m[1],
		)
		expect(fences).toEqual(
			BPMN_TEMPLATES.map((name) => readFileSync(join(CARDS, "scripts", name), "utf8")),
		)
	})

	it("keeps the bpmn card under 150 lines", () => {
		expect(readAgentCard("bpmn").split("\n").length).toBeLessThan(150)
	})

	it("points each card at the concrete casen check gate", () => {
		// The BPMN card's one command lints (and deploys) what it builds.
		for (const kind of AGENT_CARD_KINDS)
			expect(readAgentCard(kind)).toContain(kind === "bpmn" ? "casen build " : "casen check ")
	})

	it("shows the multi-decision DRD script exactly as the tested file", () => {
		const fences = [...readAgentCard("dmn").matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1])
		expect(fences[1]).toBe(readFileSync(join(CARDS, "scripts", "dmn-drd.ts"), "utf8"))
	})

	it("has its docs page and plugin skill copies in sync", () => {
		const result = spawnSync(
			process.execPath,
			[join(ROOT, "scripts/sync-agent-cards.mjs"), "--check"],
			{
				encoding: "utf8",
			},
		)
		expect(result.stderr).toBe("")
		expect(result.status).toBe(0)
	})
})

function stripFlags(): string[] {
	const features = process.features as { typescript?: unknown }
	return features.typescript ? [] : ["--experimental-strip-types"]
}

describe("agent card scripts run as printed", () => {
	let dir: string
	const runs = new Map<AgentCardKind, ReturnType<typeof spawnSync>>()

	beforeAll(() => {
		dir = mkdtempSync(join(tmpdir(), "agent-card-"))
		// Node 23.6+ strips types by default; 22.6+ needs the flag the cards tell agents to pass.
		const flags = stripFlags()
		for (const kind of AGENT_CARD_KINDS) {
			const script = join(CARDS, "scripts", `${kind}.ts`)
			runs.set(
				kind,
				spawnSync(process.execPath, [...flags, "--no-warnings", script], {
					cwd: dir,
					encoding: "utf8",
				}),
			)
		}
	}, 60_000)
	afterAll(() => rmSync(dir, { recursive: true, force: true }))

	it.each(AGENT_CARD_KINDS)("%s exits 0", (kind) => {
		const run = runs.get(kind)
		expect(run?.stderr).toBe("")
		expect(run?.status).toBe(0)
	})

	it("writes a process that lints clean and keeps its layout through the edit", () => {
		const xml = readFileSync(join(dir, "order.bpmn"), "utf8")
		const definitions = Bpmn.parse(xml)
		expect(definitions.unknownAttributes["modeler:executionPlatformVersion"]).toBe("8.10.0")
		expect(definitions.processes[0]?.flowElements.find((e) => e.id === "ship")?.name).toBe(
			"Ship parcel",
		)
		expect(definitions.diagrams[0]?.plane.shapes.length).toBeGreaterThan(5)
		expect(xml).toContain("<zeebe:userTask")
	})

	it("writes a DRD whose approval decision requires riskScore", () => {
		const run = spawnSync(
			process.execPath,
			[...stripFlags(), "--no-warnings", join(CARDS, "scripts", "dmn-drd.ts")],
			{
				cwd: dir,
				encoding: "utf8",
			},
		)
		expect(run.stderr).toBe("")
		const defs = Dmn.parse(readFileSync(join(dir, "approval.dmn"), "utf8"))
		expect(
			defs.decisions.find((d) => d.id === "approval")?.informationRequirements[0]?.requiredDecision,
		).toBe("riskScore")
	})

	it("links the three files by the ids the traps name", () => {
		const bpmn = readFileSync(join(dir, "order.bpmn"), "utf8")
		const decision = Dmn.parse(readFileSync(join(dir, "risk.dmn"), "utf8")).decisions[0]
		const form = Form.parse(readFileSync(join(dir, "review-order.form"), "utf8"))
		expect(bpmn).toContain(`decisionId="${decision?.id}"`)
		expect(bpmn).toContain(`formId="${form.id}"`)
		expect(decision?.name).toBe("Order risk level")
		expect(form.executionPlatformVersion).toBe("8.10.0")
		expect(form.components.at(-1)?.id).toBe("Field_note")
	})
})

describe("bpmn card templates build as printed", () => {
	it("builds templates 1 and 2 lint clean, then edits 1 with template 3", async () => {
		const dir = mkdtempSync(join(tmpdir(), "agent-card-build-"))
		const ok: string[] = []
		const run = (positional: string[], flags: RunContext["flags"] = {}) =>
			(buildGroup.commands[0] as { run(c: RunContext): Promise<void> }).run({
				positional,
				flags,
				output: { ok: (m: string) => ok.push(m), info: () => {} },
			} as unknown as RunContext)
		const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true)
		try {
			for (const name of BPMN_TEMPLATES) copyFileSync(join(CARDS, "scripts", name), join(dir, name))
			await run([join(dir, "bpmn-process.txt")])
			await run([join(dir, "bpmn-pools.txt")])
			await run([join(dir, "bpmn-edit.mjs")], { edit: join(dir, "bpmn-process.bpmn") })
		} finally {
			write.mockRestore()
		}
		expect(ok).toEqual([
			"bpmn-process.bpmn + 2 forms · lint clean",
			"bpmn-pools.bpmn + 1 form · lint clean",
			"bpmn-process.bpmn + 1 form · lint clean",
		])
		const edited = Bpmn.parse(readFileSync(join(dir, "bpmn-process.bpmn"), "utf8"))
		expect(edited.processes[0]?.flowElements.some((e) => e.id === "validate")).toBe(true)
		expect(readdirSync(dir).filter((f) => f.endsWith(".form"))).toHaveLength(4)
		rmSync(dir, { recursive: true, force: true })
	})
})
