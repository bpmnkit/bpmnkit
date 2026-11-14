import { expect, it, vi } from "vitest"

it("drops Node's process warnings unless NODE_NO_WARNINGS=0", async () => {
	vi.stubEnv("NODE_NO_WARNINGS", "")
	process.on("warning", () => {})
	await import("./quiet.js")
	expect(process.listenerCount("warning")).toBe(0)
	vi.unstubAllEnvs()
})
