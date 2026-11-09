import { readFile } from "node:fs/promises"
import { basename, resolve } from "node:path"
import { DeployabilityError, assertDeployableXml } from "@bpmnkit/core"
import { clusterApiUrl, getActiveProfile, getAuthHeader } from "@bpmnkit/profiles"
import type { Command, CommandGroup } from "../types.js"

const ZEEBE_ADDRESS = (process.env.ZEEBE_ADDRESS ?? "http://localhost:26500").replace(/\/$/, "")

/**
 * Refuses a `.bpmn` file Zeebe would reject before anything is sent, with the gate's
 * lines: the engine's own error names one problem at a time, after a round trip.
 */
export function gateDeployment(fileName: string, content: string): void {
	if (!fileName.toLowerCase().endsWith(".bpmn")) return
	try {
		assertDeployableXml(content)
	} catch (err) {
		if (!(err instanceof DeployabilityError)) throw err
		throw new Error(
			`${err.message}\nNot deployed. Fix the model (casen check ${fileName} --deploy), or pass --no-validate to send it anyway.`,
		)
	}
}

const deployCmd: Command = {
	name: "deploy",
	description: "Deploy a BPMN (or DMN/form) file to local Reebe or the active Camunda 8 profile",
	args: [{ name: "file", description: "Path to the resource file", required: true }],
	flags: [
		{
			name: "target",
			description:
				'Deployment target: "local" (Reebe, via ZEEBE_ADDRESS) or "camunda8" (active profile)',
			type: "string",
			default: "local",
			enum: ["local", "camunda8"],
		},
		{
			name: "validate",
			description:
				"Refuse a BPMN file Camunda 8 would reject before sending it (default); --no-validate sends it as it is",
			type: "boolean",
			default: true,
		},
	],
	examples: [
		{ description: "Deploy to local Reebe", command: "casen deploy deploy order-process.bpmn" },
		{
			description: "Deploy to Camunda 8",
			command: "casen deploy deploy order-process.bpmn --target camunda8",
		},
	],
	async run(ctx) {
		const filePath = ctx.positional[0]
		if (!filePath) throw new Error("Missing required argument: <file>")

		const absPath = resolve(filePath)
		const content = await readFile(absPath, "utf-8").catch(() => {
			throw new Error(`Cannot read file: ${absPath}`)
		})
		if (ctx.flags.validate !== false) gateDeployment(basename(absPath), content)

		const formData = new FormData()
		formData.append(
			"resources[]",
			new Blob([content], { type: "application/octet-stream" }),
			basename(absPath),
		)

		const target = typeof ctx.flags.target === "string" ? ctx.flags.target : "local"

		if (target === "camunda8") {
			const profile = getActiveProfile()
			if (!profile?.config.baseUrl) {
				throw new Error("No active Camunda 8 profile. Run: casen profile create")
			}
			const authHeader = await getAuthHeader(profile.config)
			const baseUrl = profile.config.baseUrl.replace(/\/$/, "")
			const res = await fetch(clusterApiUrl(baseUrl, "/deployments"), {
				method: "POST",
				headers: { authorization: authHeader },
				body: formData,
			})
			if (!res.ok) throw new Error(`Camunda 8 deploy failed: ${res.status} ${await res.text()}`)
			ctx.output.print({ success: true, target: "camunda8", result: await res.json() })
			return
		}

		let res: Response
		try {
			res = await fetch(`${ZEEBE_ADDRESS}/v2/deployments`, { method: "POST", body: formData })
		} catch (err) {
			throw new Error(
				`Cannot reach Reebe at ${ZEEBE_ADDRESS}. Start it with: casen reebe start\n${String(err)}`,
			)
		}
		if (!res.ok) throw new Error(`Local deploy failed: ${res.status} ${await res.text()}`)
		ctx.output.print({ success: true, target: "local", result: await res.json() })
	},
}

export const deployGroup: CommandGroup = {
	name: "deploy",
	description: "Deploy BPMN/DMN/form resources to local Reebe or Camunda 8",
	commands: [deployCmd],
}
