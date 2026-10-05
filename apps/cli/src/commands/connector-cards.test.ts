import { describe, expect, it } from "vitest"
import type { RunContext } from "../types.js"
import { connectorGroup } from "./connector.js"

const cards = connectorGroup.commands.find((c) => c.name === "cards")

async function run(
	positional: string[],
	flags: Record<string, string | boolean> = {},
	format: "table" | "json" = "table",
): Promise<{ info: string[]; printed: unknown[] }> {
	const captured = { info: [] as string[], printed: [] as unknown[] }
	const ctx = {
		positional,
		// An empty workspace, so only the bundled catalog is read
		flags: { workspace: "/nonexistent-casen-workspace", ...flags },
		output: {
			format,
			print: (data: unknown) => captured.printed.push(data),
			info: (msg: string) => captured.info.push(msg),
			ok: () => {},
			printList: () => {},
		},
	} as unknown as RunContext
	if (!cards) throw new Error("connector cards is not registered")
	await cards.run(ctx)
	return captured
}

describe("casen connector cards", () => {
	it("prints the best card first, with the values that select its operation", async () => {
		const { info } = await run(["post a message to slack"], { limit: "1" })
		expect(info[1]).toMatch(/^slack chat\.postMessage — .*token\*\(secret\)/)
		expect(info[2]).toContain('"method":"chat.postMessage"')
	})

	it("emits the cards as data with -o json", async () => {
		const { printed } = await run(["create a github issue"], { limit: "2" }, "json")
		const [list] = printed as Array<Array<{ alias: string; operation?: string }>>
		expect(list?.[0]).toMatchObject({ alias: "github", operation: "createIssue" })
		expect(list).toHaveLength(2)
	})

	it("rejects a limit that is not a positive number", async () => {
		await expect(run(["slack"], { limit: "0" })).rejects.toThrow(/--limit/)
	})
})
