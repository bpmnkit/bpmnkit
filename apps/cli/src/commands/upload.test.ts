import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { CamundaClient } from "@bpmnkit/api"
import { describe, expect, it } from "vitest"
import { generatedCommandGroups } from "../generated/commands.js"
import type { RunContext } from "../types.js"

async function createDeployment(positional: string[]): Promise<FormData> {
	let sent: FormData | undefined
	const client = {
		resource: {
			createDeployment: async (form: FormData) => {
				sent = form
				return { deploymentKey: "1" }
			},
		},
	} as unknown as CamundaClient
	const ctx = {
		positional,
		flags: {},
		output: { printItem: () => {} },
		getClient: async () => client,
	} as unknown as RunContext
	const cmd = generatedCommandGroups
		.find((g) => g.name === "resource")
		?.commands.find((c) => c.name === "create-deployment")
	if (cmd === undefined) throw new Error("resource create-deployment is not registered")
	await cmd.run(ctx)
	if (sent === undefined) throw new Error("nothing was deployed")
	return sent
}

describe("casen resource create-deployment", () => {
	it("sends every file under the spec's `resources` field", async () => {
		const dir = mkdtempSync(join(tmpdir(), "casen-upload-"))
		writeFileSync(join(dir, "order.bpmn"), "<definitions/>")
		writeFileSync(join(dir, "rules.dmn"), "<dmn/>")

		const form = await createDeployment([join(dir, "order.bpmn"), join(dir, "rules.dmn")])

		const files = form.getAll("resources") as File[]
		expect(files.map((f) => f.name)).toEqual(["order.bpmn", "rules.dmn"])
		expect(await files[0]?.text()).toBe("<definitions/>")
	})

	it("needs at least one file", async () => {
		await expect(createDeployment([])).rejects.toThrow(/Missing required argument: <file>/)
	})
})
