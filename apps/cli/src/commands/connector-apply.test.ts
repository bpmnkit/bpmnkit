import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Bpmn } from "@bpmnkit/core"
import { beforeEach, describe, expect, it } from "vitest"
import { parseArgs } from "../args.js"
import type { RunContext } from "../types.js"
import { connectorGroup } from "./connector.js"

const HTTP = "io.camunda.connectors.HttpJson.v2"

const PROCESS = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="Defs" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="P" isExecutable="true">
    <bpmn:startEvent id="Start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="Call" name="Call"><bpmn:incoming>f1</bpmn:incoming></bpmn:serviceTask>
    <bpmn:sequenceFlow id="f1" sourceRef="Start" targetRef="Call" />
  </bpmn:process>
</bpmn:definitions>
`

let dir: string

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "casen-connector-apply-"))
})

/** Runs a command the way `casen` does: argv through the real flag parser. */
async function run(
	name: "apply" | "show",
	argv: string[],
): Promise<{ info: string[]; ok: string[] }> {
	const captured = { info: [] as string[], ok: [] as string[] }
	const { positional, flags } = parseArgs(argv)
	const ctx = {
		positional,
		flags: { workspace: "/nonexistent-casen-workspace", ...flags },
		output: {
			format: "table",
			print: () => {},
			info: (msg: string) => captured.info.push(msg),
			ok: (msg: string) => captured.ok.push(msg),
			printList: () => {},
		},
	} as unknown as RunContext
	const cmd = connectorGroup.commands.find((c) => c.name === name)
	if (!cmd) throw new Error(`connector ${name} is not registered`)
	await cmd.run(ctx)
	return captured
}

function writeProcess(): string {
	const file = join(dir, "p.bpmn")
	writeFileSync(file, PROCESS, "utf-8")
	return file
}

describe("casen connector apply", () => {
	it("writes a multi-line value from --values with real newlines", async () => {
		const file = writeProcess()
		const values = join(dir, "v.json")
		writeFileSync(
			values,
			JSON.stringify({ method: "POST", url: "https://x.test", body: "line one\n\nline two" }),
			"utf-8",
		)
		await run("apply", [file, "Call", "http", "--values", values])
		const xml = readFileSync(file, "utf-8")
		// An attribute carries a newline as a character reference; a literal "\\n" would show as backslash-n.
		expect(xml).toContain("line one&#10;&#10;line two")
		expect(xml).toContain("io.camunda.connectors.HttpJson.v2")
		expect(Bpmn.parse(xml)).toBeDefined()
	})

	it("lets repeated --set override --values", async () => {
		const file = writeProcess()
		const values = join(dir, "v.json")
		writeFileSync(values, JSON.stringify({ method: "POST", url: "https://a.test" }), "utf-8")
		await run("apply", [
			file,
			"Call",
			HTTP,
			"--values",
			values,
			"--set",
			"url=https://b.test",
			"--set",
			"retryCount=5",
		])
		const xml = readFileSync(file, "utf-8")
		expect(xml).toContain("https://b.test")
		expect(xml).not.toContain("https://a.test")
		expect(xml).toMatch(/retries="5"/)
	})

	it("passes a value starting with = through as FEEL", async () => {
		const file = writeProcess()
		await run("apply", [
			file,
			"Call",
			"http",
			"--set",
			'url==baseUrl + "/x"',
			"--set",
			"method=GET",
		])
		expect(readFileSync(file, "utf-8")).toContain("baseUrl + &quot;/x&quot;")
	})

	it("rejects a wrong key with a suggestion, exits non-zero and leaves the file alone", async () => {
		const file = writeProcess()
		await expect(run("apply", [file, "Call", "http", "--set", "retries=3"])).rejects.toThrow(
			/did you mean "retryCount"\?/,
		)
		expect(readFileSync(file, "utf-8")).toBe(PROCESS)
	})

	it("does not write with --dry-run", async () => {
		const file = writeProcess()
		await run("apply", [
			file,
			"Call",
			"http",
			"--set",
			"method=GET",
			"--set",
			"url=https://x.test",
			"--dry-run",
		])
		expect(readFileSync(file, "utf-8")).toBe(PROCESS)
	})

	it("rejects a --set without an equals sign", async () => {
		const file = writeProcess()
		await expect(run("apply", [file, "Call", "http", "--set", "oops"])).rejects.toThrow(/key=value/)
	})
})

describe("casen connector show --filter / --condensed", () => {
	it("prints one line per matching property", async () => {
		const { info } = await run("show", [HTTP, "--filter", "timeout", "--condensed"])
		expect(info.map((l) => l.split(/\s{2,}/)[0])).toEqual([
			"connectionTimeoutInSeconds",
			"readTimeoutInSeconds",
			"jobTimeout",
		])
		expect(info[0]).toBe("connectionTimeoutInSeconds  Number  20  required")
	})

	it("renders a property's condition", async () => {
		const { info } = await run("show", [HTTP, "--filter", "ignoreNullValues", "--condensed"])
		expect(info).toHaveLength(1)
		expect(info[0]).toMatch(
			/^ignoreNullValues {2}Boolean {2}.* {2}when method in POST\|PUT\|PATCH$/,
		)
	})

	it("filters the default listing by label too, leaving other output alone", async () => {
		const { info } = await run("show", [HTTP, "--filter", "RETRIES"])
		expect(info.some((l) => l.includes("retryCount — Retries"))).toBe(true)
		expect(info.some((l) => l.includes("connectionTimeoutInSeconds"))).toBe(false)
	})

	it("says so when nothing matches", async () => {
		const { info } = await run("show", [HTTP, "--filter", "zzzz", "--condensed"])
		expect(info).toEqual(['No properties of io.camunda.connectors.HttpJson.v2 match "zzzz"'])
	})
})
