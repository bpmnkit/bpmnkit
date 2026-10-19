import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { parseArgs } from "../args.js"
import { run as runCli } from "../run.js"
import type { RunContext } from "../types.js"
import { resolveScenariosPath, testGroup } from "./test.js"

const here = dirname(fileURLToPath(import.meta.url))
const BAKEOFF_BPMN = resolve(here, "../../../../packages/core/tests/fixtures/bakeoff/expected.bpmn")
const BAKEOFF_CPT = resolve(
	here,
	"../../../../packages/engine/tests/cpt/fixtures/bakeoff.test.json",
)

const SIMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="simple" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:endEvent id="end"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="end" />
  </bpmn:process>
</bpmn:definitions>`

let dir: string

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "casen-test-cmd-"))
})

/** Runs `casen test` the way the CLI does: argv through the real flag parser. */
async function run(argv: string[]): Promise<{ lines: string[]; error?: Error }> {
	const lines: string[] = []
	const { positional, flags, repeated } = parseArgs(argv)
	const ctx = {
		positional,
		repeated,
		flags,
		output: {
			format: "table",
			print: () => {},
			info: (msg: string) => lines.push(msg),
			ok: (msg: string) => lines.push(msg),
			printList: () => {},
		},
	} as unknown as RunContext
	const cmd = testGroup.commands[0]
	if (!cmd) throw new Error("test command is not registered")
	try {
		await cmd.run(ctx)
		return { lines }
	} catch (e) {
		return { lines, error: e as Error }
	}
}

function bakeoff(cpt: string = readFileSync(BAKEOFF_CPT, "utf8")): string {
	const bpmn = join(dir, "p.bpmn")
	copyFileSync(BAKEOFF_BPMN, bpmn)
	writeFileSync(join(dir, "p.test.json"), cpt)
	return bpmn
}

describe("resolveScenariosPath", () => {
	it("finds <name>.test.json next to the BPMN", async () => {
		const bpmn = join(dir, "p.bpmn")
		writeFileSync(join(dir, "p.test.json"), "{}")
		expect(await resolveScenariosPath(bpmn)).toBe(join(dir, "p.test.json"))
	})

	it("prefers <file>.bpmn.tests.json when both exist", async () => {
		const bpmn = join(dir, "p.bpmn")
		writeFileSync(join(dir, "p.test.json"), "{}")
		writeFileSync(`${bpmn}.tests.json`, "[]")
		expect(await resolveScenariosPath(bpmn)).toBe(`${bpmn}.tests.json`)
	})

	it("returns the .bpmn.tests.json path when neither exists", async () => {
		const bpmn = join(dir, "p.bpmn")
		expect(await resolveScenariosPath(bpmn)).toBe(`${bpmn}.tests.json`)
	})

	it("always lets the flag win", async () => {
		const bpmn = join(dir, "p.bpmn")
		writeFileSync(`${bpmn}.tests.json`, "[]")
		expect(await resolveScenariosPath(bpmn, "/x/other.json")).toBe("/x/other.json")
	})
})

describe("casen test with a CPT file", () => {
	it("runs a CPT file and passes", async () => {
		const { lines, error } = await run([bakeoff()])
		expect(error).toBeUndefined()
		expect(lines.filter((l) => l.startsWith("PASS"))).toHaveLength(6)
		expect(lines.join("\n")).toContain("6/6 passed")
	})

	it("fails with the instruction", async () => {
		const broken = readFileSync(BAKEOFF_BPMN, "utf8").replace(
			/(<bpmn:sequenceFlow id="Flow_No"[^>]*>\s*<bpmn:conditionExpression[^>]*>)[^<]*/,
			"$1=false",
		)
		const bpmn = bakeoff()
		writeFileSync(bpmn, broken)
		const { lines, error } = await run([bpmn])
		expect(error?.message).toBe("1 test case(s) failed")
		const out = lines.join("\n")
		expect(out).toContain("FAIL")
		expect(out).toMatch(/instruction \d+ \(COMPLETE_JOB_AD_HOC_SUB_PROCESS\)/)
	})

	it("--case selects", async () => {
		const first = (
			JSON.parse(readFileSync(BAKEOFF_CPT, "utf8")) as { testCases: { name: string }[] }
		).testCases[0]?.name
		const { lines, error } = await run([bakeoff(), "--case", first ?? ""])
		expect(error).toBeUndefined()
		expect(lines.join("\n")).toContain("1/1 passed")
	})

	it("reports a --case that does not exist without an instruction prefix", async () => {
		const { lines, error } = await run([bakeoff(), "--case", "no such case"])
		expect(error?.message).toBe("1 test case(s) failed")
		expect(lines.join("\n")).not.toContain("instruction -1")
	})

	it("names a CPT file without testCases instead of saying no scenarios", async () => {
		const file = bakeoff(
			JSON.stringify({ $schema: "https://x/cpt-test-cases/schema.json", testCases: [] }),
		)
		const { lines, error } = await run([file])
		const out = lines.join("\n")
		expect(out).toContain("testCases must be a non-empty array")
		expect(out).not.toContain("No scenarios found.")
		expect(error).toBeDefined()
	})
})

describe("casen test with an old scenario file", () => {
	it("still runs array-format scenarios", async () => {
		const bpmn = join(dir, "s.bpmn")
		writeFileSync(bpmn, SIMPLE)
		writeFileSync(
			`${bpmn}.tests.json`,
			JSON.stringify([{ id: "s1", name: "straight through", expect: { path: ["start", "end"] } }]),
		)
		const { lines, error } = await run([bpmn])
		expect(error).toBeUndefined()
		expect(lines.join("\n")).toContain("1/1 passed")
	})
})

describe("casen test flags and routing", () => {
	it("-s selects the scenarios file even when a sidecar exists", async () => {
		const bpmn = bakeoff()
		writeFileSync(`${bpmn}.tests.json`, "[]") // the sidecar a silent -s would run: a false pass
		const cases = join(dir, "cases.json")
		writeFileSync(cases, readFileSync(BAKEOFF_CPT, "utf8"))
		const { lines, error } = await run([bpmn, "-s", cases])
		expect(error).toBeUndefined()
		expect(lines.some((l) => l.startsWith("PASS  "))).toBe(true)
		expect(lines).not.toContain("No scenarios found.")
	})

	it("--case with a legacy scenario file prints a notice", async () => {
		const bpmn = join(dir, "p.bpmn")
		writeFileSync(bpmn, SIMPLE)
		writeFileSync(`${bpmn}.tests.json`, "[]")
		const { lines } = await run([bpmn, "--case", "x"])
		expect(
			lines.filter((l) => l.includes("--case applies only to Camunda test files")),
		).toHaveLength(1)
	})

	describe("router", () => {
		const capture = async (argv: string[]) => {
			const out: string[] = []
			const spy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
				out.push(String(c))
				return true
			})
			const code = process.exitCode
			try {
				await runCli(argv)
			} finally {
				spy.mockRestore()
			}
			const failed = process.exitCode
			process.exitCode = code
			return { out: out.join(""), failed }
		}

		it.each([["test"], []])("runs the command for `casen test %s<file>`", async (...pre) => {
			const bpmn = bakeoff()
			const { out, failed } = await capture(["test", ...pre.flat(), bpmn])
			expect(out).toContain("PASS  ")
			expect(failed).toBeUndefined()
		})

		it("`casen test --help` still shows help", async () => {
			const { out } = await capture(["test", "--help"])
			expect(out).toContain("test")
			expect(out).not.toContain("PASS  ")
		})
	})
})
