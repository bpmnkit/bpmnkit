import { describe, expect, it } from "vitest"
import type { RunContext } from "../types.js"
import { connectorGroup } from "./connector.js"

const api = connectorGroup.commands.find((c) => c.name === "api")

async function run(
	positional: string[],
	flags: Record<string, string | boolean> = {},
	format: "table" | "json" = "table",
): Promise<{ info: string[]; printed: unknown[] }> {
	const captured = { info: [] as string[], printed: [] as unknown[] }
	const ctx = {
		positional,
		flags,
		output: {
			format,
			print: (data: unknown) => captured.printed.push(data),
			info: (msg: string) => captured.info.push(msg),
			ok: () => {},
			printList: () => {},
		},
	} as unknown as RunContext
	if (!api) throw new Error("connector api is not registered")
	await api.run(ctx)
	return captured
}

describe("casen connector api", () => {
	it("prints the service the query names, with its best endpoint first", async () => {
		const { info } = await run(["create a stripe customer"], { limit: "1" })
		expect(info[1]).toBe(
			"api stripe — Stripe API https://api.stripe.com auth=bearer secret=STRIPE_TOKEN\nPOST /v1/customers — Create a customer | form body: name email description address balance business_name\n",
		)
	})

	it("searches the service --service names, as data with -o json", async () => {
		const { printed } = await run(["create page"], { service: "notion", limit: "1" }, "json")
		const [list] = printed as Array<
			Array<{ service: { id: string; operations?: unknown }; operations: { path: string }[] }>
		>
		expect(list?.[0]?.service.id).toBe("notion")
		expect(list?.[0]?.service.operations).toBeUndefined()
		expect(list?.[0]?.operations.map((o) => o.path)).toEqual(["/v1/pages"])
	})

	it("says which services are indexed when the query names none", async () => {
		const { info } = await run(["send a fax"])
		expect(info[0]).toMatch(/names no indexed API.*Indexed: .*stripe/)
		await expect(run(["x"], { service: "acme" })).rejects.toThrow(/No API "acme"/)
	})
})
