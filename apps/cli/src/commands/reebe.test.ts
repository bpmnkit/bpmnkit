import { describe, expect, it } from "vitest"
import { serverArgs } from "./reebe.js"

describe("casen reebe start", () => {
	it("passes the REST port and config, and the gRPC port only when given", () => {
		expect(serverArgs(8080, "config.toml")).toEqual(["--port", "8080", "--config", "config.toml"])
		expect(serverArgs(26500, "c.toml", 26501)).toEqual([
			"--port",
			"26500",
			"--config",
			"c.toml",
			"--grpc-port",
			"26501",
		])
	})
})
