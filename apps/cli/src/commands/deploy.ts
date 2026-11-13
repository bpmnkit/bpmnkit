import { readFile } from "node:fs/promises"
import { basename, resolve } from "node:path"
import type { CamundaClientInput } from "@bpmnkit/api"
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

export type DeployTarget = "auto" | "local" | "camunda8"

/**
 * A Camunda 8 cluster named by the environment, the way c8ctl and the Camunda SDKs
 * read it: `ZEEBE_REST_ADDRESS` (or `CAMUNDA_REST_ADDRESS`), OAuth with
 * `CAMUNDA_CLIENT_ID`/`_SECRET`/`CAMUNDA_OAUTH_URL`, basic auth with
 * `CAMUNDA_BASIC_AUTH_USERNAME`/`_PASSWORD`, otherwise none.
 */
export function clusterFromEnv(
	env: NodeJS.ProcessEnv = process.env,
): CamundaClientInput | undefined {
	const address = env.ZEEBE_REST_ADDRESS ?? env.CAMUNDA_REST_ADDRESS
	if (!address) return undefined
	const clientId = env.CAMUNDA_CLIENT_ID ?? env.ZEEBE_CLIENT_ID
	const clientSecret = env.CAMUNDA_CLIENT_SECRET ?? env.ZEEBE_CLIENT_SECRET
	const tokenUrl = env.CAMUNDA_OAUTH_URL ?? env.ZEEBE_AUTHORIZATION_SERVER_URL
	if (clientId && clientSecret && tokenUrl) {
		const audience = env.CAMUNDA_TOKEN_AUDIENCE ?? env.ZEEBE_TOKEN_AUDIENCE ?? "zeebe.camunda.io"
		return {
			baseUrl: address,
			auth: { type: "oauth2", clientId, clientSecret, tokenUrl, audience },
		}
	}
	const username = env.CAMUNDA_BASIC_AUTH_USERNAME
	if (username) {
		const password = env.CAMUNDA_BASIC_AUTH_PASSWORD ?? ""
		return { baseUrl: address, auth: { type: "basic", username, password } }
	}
	return { baseUrl: address, auth: { type: "none" } }
}

/**
 * Deploys resources in one request, so a process and the forms and decisions it
 * links arrive together. `auto` picks the environment's cluster, then the active
 * profile, then local Reebe.
 */
export async function deployResources(
	resources: readonly { name: string; content: string }[],
	target: string,
): Promise<{ target: "local" | "camunda8"; result: unknown }> {
	const formData = new FormData()
	for (const r of resources) {
		formData.append(
			"resources[]",
			new Blob([r.content], { type: "application/octet-stream" }),
			r.name,
		)
	}

	const env = target === "local" ? undefined : clusterFromEnv()
	const config = env ?? (target === "local" ? undefined : getActiveProfile()?.config)
	if (target === "camunda8" && !config?.baseUrl) {
		throw new Error(
			"No Camunda 8 cluster: set ZEEBE_REST_ADDRESS (+ CAMUNDA_CLIENT_ID/SECRET/OAUTH_URL) or run: casen profile create",
		)
	}
	if (config?.baseUrl) {
		const authHeader = await getAuthHeader(config)
		const res = await fetch(clusterApiUrl(config.baseUrl, "/deployments"), {
			method: "POST",
			headers: authHeader ? { authorization: authHeader } : {},
			body: formData,
		})
		if (!res.ok) throw new Error(`Camunda 8 deploy failed: ${res.status} ${await res.text()}`)
		return { target: "camunda8", result: await res.json() }
	}

	let res: Response
	try {
		res = await fetch(`${ZEEBE_ADDRESS}/v2/deployments`, { method: "POST", body: formData })
	} catch (err) {
		throw new Error(
			`Cannot reach Reebe at ${ZEEBE_ADDRESS}. Start it with: casen reebe start, or set ZEEBE_REST_ADDRESS for a cluster\n${String(err)}`,
		)
	}
	if (!res.ok) throw new Error(`Local deploy failed: ${res.status} ${await res.text()}`)
	return { target: "local", result: await res.json() }
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

		const target = typeof ctx.flags.target === "string" ? ctx.flags.target : "local"
		const deployed = await deployResources([{ name: basename(absPath), content }], target)
		ctx.output.print({ success: true, ...deployed })
	},
}

export const deployGroup: CommandGroup = {
	name: "deploy",
	description: "Deploy BPMN/DMN/form resources to local Reebe or Camunda 8",
	commands: [deployCmd],
}
