import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve as resolvePath } from "node:path"
import { Bpmn, type CompactDiagram, isDeployable, validateDeployableXml } from "@bpmnkit/core"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import type { RunContext } from "../types.js"
import { generateFromCompact, generateGroup, resolveModifyOutputPath } from "./generate.js"

describe("resolveModifyOutputPath", () => {
	it("refuses to replace the input when no --output is given", () => {
		// Regression: `casen generate bpmn --input x.bpmn` used to write the lossy
		// compactify/expand round trip straight back over x.bpmn and report success,
		// destroying pools, lanes, message correlation keys and ioMapping detail.
		expect(() =>
			resolveModifyOutputPath({ inputFile: "order.bpmn", outputFlag: undefined, force: false }),
		).toThrow(/Refusing to overwrite order\.bpmn/)
	})

	it("refuses when --output names the input file", () => {
		expect(() =>
			resolveModifyOutputPath({ inputFile: "order.bpmn", outputFlag: "order.bpmn", force: false }),
		).toThrow(/Refusing to overwrite/)
	})

	it("refuses when --output reaches the input by a different path", () => {
		expect(() =>
			resolveModifyOutputPath({
				inputFile: "flows/order.bpmn",
				outputFlag: "flows/../flows/order.bpmn",
				force: false,
			}),
		).toThrow(/Refusing to overwrite/)
	})

	it("names both ways out in the error", () => {
		expect(() =>
			resolveModifyOutputPath({ inputFile: "order.bpmn", outputFlag: "", force: false }),
		).toThrow(/--output <file>.*--force/s)
	})

	it("says why replacing is still destructive, so the refusal is actionable", () => {
		expect(() =>
			resolveModifyOutputPath({ inputFile: "order.bpmn", outputFlag: undefined, force: false }),
		).toThrow(/the original is gone once it is replaced/)
	})

	it("allows in-place replacement with --force", () => {
		expect(
			resolveModifyOutputPath({ inputFile: "order.bpmn", outputFlag: undefined, force: true }),
		).toBe("order.bpmn")
	})

	it("allows --output naming the input with --force", () => {
		expect(
			resolveModifyOutputPath({ inputFile: "order.bpmn", outputFlag: "order.bpmn", force: true }),
		).toBe("order.bpmn")
	})

	it("writes to a distinct --output without --force", () => {
		expect(
			resolveModifyOutputPath({
				inputFile: "order.bpmn",
				outputFlag: "order.patched.bpmn",
				force: false,
			}),
		).toBe("order.patched.bpmn")
	})

	it("treats an empty --output as absent", () => {
		expect(resolveModifyOutputPath({ inputFile: "order.bpmn", outputFlag: "", force: true })).toBe(
			"order.bpmn",
		)
	})
})

describe("generate bpmn --input", () => {
	const sample = resolvePath(import.meta.dirname, "../../../../bpmn-samples/order-process.bpmn")
	let dir: string
	let input: string
	let wasTty: boolean | undefined

	function ctx(flags: Record<string, string | boolean>): RunContext {
		return { positional: [], flags, output: { ok() {}, info() {} } } as unknown as RunContext
	}

	function run(flags: Record<string, string | boolean>): Promise<void> {
		const bpmn = generateGroup.commands.find((command) => command.name === "bpmn")
		if (!bpmn) throw new Error("generate bpmn command not registered")
		return bpmn.run(ctx(flags))
	}

	beforeAll(() => {
		// The command reads a patch from stdin whenever stdin is not a TTY, which
		// would block here. Present as a terminal so the write path is reachable.
		wasTty = process.stdin.isTTY
		process.stdin.isTTY = true
		dir = mkdtempSync(join(tmpdir(), "casen-generate-"))
		input = join(dir, "order.bpmn")
	})

	afterAll(() => {
		process.stdin.isTTY = wasTty as boolean
		rmSync(dir, { force: true, recursive: true })
	})

	it("refuses in place and leaves the input byte-identical", async () => {
		copyFileSync(sample, input)
		const before = readFileSync(input, "utf-8")
		await expect(run({ input })).rejects.toThrow(/Refusing to overwrite/)
		expect(readFileSync(input, "utf-8")).toBe(before)
	})

	it("writes to --output without touching the input", async () => {
		copyFileSync(sample, input)
		const before = readFileSync(input, "utf-8")
		const output = join(dir, "order.patched.bpmn")
		await run({ input, output })
		expect(readFileSync(input, "utf-8")).toBe(before)
		expect(readFileSync(output, "utf-8")).toContain("<bpmn:definitions")
	})

	it("replaces the input when --force is given", async () => {
		copyFileSync(sample, input)
		await run({ input, force: true })
		expect(readFileSync(input, "utf-8")).toContain("<bpmn:definitions")
	})

	/**
	 * A patch used to re-run the auto-layout over the whole file, so adding one
	 * branch moved every shape someone had placed. It now draws only what is new.
	 */
	it("keeps the existing layout when a patch adds a branch", async () => {
		copyFileSync(sample, input)
		const output = join(dir, "order.branch.bpmn")
		await run({
			input,
			output,
			patch: JSON.stringify({
				elements: [
					{ id: "escalate", type: "serviceTask", name: "Escalate", jobType: "escalate" },
					{ id: "end-escalated", type: "endEvent", name: "Escalated" },
				],
				flows: [
					{ id: "flow-esc", from: "gw-check", to: "escalate", condition: "= urgent" },
					{ id: "flow-esc2", from: "escalate", to: "end-escalated" },
				],
			}),
		})
		const shapes = (xml: string) =>
			new Map(
				Bpmn.parse(xml).diagrams.flatMap((d) =>
					d.plane.shapes.map((shape) => [shape.bpmnElement, shape.bounds]),
				),
			)
		const before = shapes(readFileSync(input, "utf-8"))
		const after = shapes(readFileSync(output, "utf-8"))
		for (const [id, bounds] of before) expect(after.get(id), id).toEqual(bounds)
		expect(after.has("escalate")).toBe(true)
		expect(after.has("end-escalated")).toBe(true)
	})

	/**
	 * The patch used to be applied to a compact projection and expanded back, so
	 * adding one task to a file with pools removed the pools. It now goes through
	 * the full model.
	 */
	it("keeps pools and message correlation keys across a patch", async () => {
		const rich = join(dir, "rich.bpmn")
		writeFileSync(
			rich,
			`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="D" targetNamespace="x">
  <bpmn:message id="Msg" name="Ping"><bpmn:extensionElements><zeebe:subscription correlationKey="=id" /></bpmn:extensionElements></bpmn:message>
  <bpmn:collaboration id="C"><bpmn:participant id="Pa" name="Pool" processRef="P" /></bpmn:collaboration>
  <bpmn:process id="P" isExecutable="true">
    <bpmn:startEvent id="S"><bpmn:outgoing>F</bpmn:outgoing></bpmn:startEvent>
    <bpmn:endEvent id="E"><bpmn:incoming>F</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="F" sourceRef="S" targetRef="E" />
  </bpmn:process>
</bpmn:definitions>`,
			"utf-8",
		)
		const output = join(dir, "rich.patched.bpmn")

		await run({
			input: rich,
			output,
			patch: JSON.stringify({
				elements: [{ id: "T", type: "serviceTask", name: "Work", jobType: "do-work" }],
				flows: [{ id: "F2", from: "T", to: "E" }],
			}),
		})

		const written = readFileSync(output, "utf-8")
		expect(written).toContain('<zeebe:subscription correlationKey="=id"')
		expect(written).toContain('<bpmn:participant id="Pa"')
		expect(written).toContain('id="T"')
	})

	it("refuses a patch that names an element which does not exist", async () => {
		copyFileSync(sample, input)
		await expect(
			run({
				input,
				output: join(dir, "bad.bpmn"),
				patch: JSON.stringify({ flows: [{ id: "X", from: "nope", to: "alsonope" }] }),
			}),
		).rejects.toThrow(/no element with id "nope"/)
	})
})

describe("generate bpmn: deploy gate", () => {
	const SKETCH = {
		id: "Defs",
		processes: [
			{
				id: "order",
				elements: [
					{ id: "start", type: "startEvent" },
					{ id: "charge", type: "serviceTask", name: "Charge" },
					{ id: "end", type: "endEvent" },
				],
				flows: [
					{ id: "f1", from: "start", to: "charge" },
					{ id: "f2", from: "charge", to: "end" },
				],
			},
		],
	}
	let dir: string
	let wasTty: boolean | undefined

	function run(flags: Record<string, string | boolean>): Promise<void> {
		const bpmn = generateGroup.commands.find((command) => command.name === "bpmn")
		if (!bpmn) throw new Error("generate bpmn command not registered")
		return bpmn.run({
			positional: [],
			flags,
			output: { ok() {}, info() {} },
		} as unknown as RunContext)
	}

	beforeAll(() => {
		wasTty = process.stdin.isTTY
		process.stdin.isTTY = true
		dir = mkdtempSync(join(tmpdir(), "casen-generate-gate-"))
	})

	afterAll(() => {
		process.stdin.isTTY = wasTty as boolean
		rmSync(dir, { recursive: true, force: true })
	})

	it("refuses an incomplete definition with the gate's lines and writes nothing", async () => {
		const output = join(dir, "refused.bpmn")
		const failure = run({ definition: JSON.stringify(SKETCH), output }).catch((e: Error) => e)
		const err = (await failure) as Error
		expect(err.message).toMatch(/^Not deployable on Camunda \d+\.\d+: 1 error\(s\)\n- charge: /)
		expect(err.message).toContain("(zeebe/service-task-definition)")
		expect(err.message).toContain("--placeholders")
		expect(err.message).toContain("--no-validate")
		expect(existsSync(output)).toBe(false)
	})

	it("--placeholders writes a deployable model and lists each fill", async () => {
		const output = join(dir, "filled.bpmn")
		const stderr: string[] = []
		const write = process.stderr.write.bind(process.stderr)
		process.stderr.write = ((chunk: string) => {
			stderr.push(String(chunk))
			return true
		}) as typeof process.stderr.write
		try {
			await run({ definition: JSON.stringify(SKETCH), output, placeholders: true })
		} finally {
			process.stderr.write = write
		}
		const xml = readFileSync(output, "utf-8")
		expect(xml).toContain('type="placeholder-charge"')
		expect(isDeployable(validateDeployableXml(xml))).toBe(true)
		expect(stderr.join("")).toContain(
			"placeholder charge.jobType = placeholder-charge (zeebe/service-task-definition)",
		)
	})

	it("--no-validate writes the model as it is", async () => {
		const output = join(dir, "sketch.bpmn")
		await run({ definition: JSON.stringify(SKETCH), output, validate: false })
		expect(isDeployable(validateDeployableXml(readFileSync(output, "utf-8")))).toBe(false)
	})

	it("every built-in template deploys", async () => {
		const templates = generateGroup.commands
			.find((command) => command.name === "bpmn")
			?.flags?.find((flag) => flag.name === "template")?.enum as string[]
		expect(templates.length).toBeGreaterThan(0)
		for (const name of templates) {
			const output = join(dir, `${name}.bpmn`)
			await run({ template: name, output, "process-id": name })
			expect(isDeployable(validateDeployableXml(readFileSync(output, "utf-8"))), name).toBe(true)
		}
	})

	it("generateFromCompact returns the fills it wrote", () => {
		const { placeholders } = generateFromCompact(SKETCH as CompactDiagram, {
			validate: true,
			placeholders: true,
		})
		expect(placeholders.map((p) => `${p.elementId}.${p.field}`)).toEqual(["charge.jobType"])
	})
})
