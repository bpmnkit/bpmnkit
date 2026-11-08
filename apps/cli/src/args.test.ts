import { describe, expect, it } from "vitest"
import { flagAll, parseArgs, redactFlagsForAudit } from "./args.js"

describe("parseArgs", () => {
	it("parses positional arguments", () => {
		const { positional, flags } = parseArgs(["process-instance", "list"])
		expect(positional).toEqual(["process-instance", "list"])
		expect(flags).toEqual({})
	})

	it("parses --flag value", () => {
		const { flags } = parseArgs(["--output", "json"])
		expect(flags.output).toBe("json")
	})

	it("parses --flag=value", () => {
		const { flags } = parseArgs(["--output=json"])
		expect(flags.output).toBe("json")
	})

	it("parses --boolean-flag as true", () => {
		const { flags } = parseArgs(["--debug"])
		expect(flags.debug).toBe(true)
	})

	it("parses --no-flag as false on the base key", () => {
		const { flags } = parseArgs(["--no-color"])
		expect(flags.color).toBe(false)
	})

	it("parses short flag -f value", () => {
		const { flags } = parseArgs(["-o", "yaml"])
		expect(flags.o).toBe("yaml")
	})

	it("parses short flag -fVALUE", () => {
		const { flags } = parseArgs(["-ojson"])
		expect(flags.o).toBe("json")
	})

	it("stops flag parsing after --", () => {
		const { positional, flags } = parseArgs(["--debug", "--", "--not-a-flag"])
		expect(flags.debug).toBe(true)
		expect(positional).toContain("--not-a-flag")
	})

	it("coerces numeric values", () => {
		const { flags } = parseArgs(["--limit", "20"])
		expect(flags.limit).toBe(20)
	})

	it("coerces boolean string values", () => {
		const { flags } = parseArgs(["--verbose", "true"])
		expect(flags.verbose).toBe(true)
	})

	it("mixes positionals and flags", () => {
		const { positional, flags } = parseArgs([
			"process-instance",
			"list",
			"--filter",
			'{"state":"ACTIVE"}',
			"--limit",
			"10",
		])
		expect(positional).toEqual(["process-instance", "list"])
		expect(flags.filter).toBe('{"state":"ACTIVE"}')
		expect(flags.limit).toBe(10)
	})

	it("keeps every occurrence of a repeated flag in `repeated`, not in `flags`", () => {
		const { flags, repeated } = parseArgs(["--set", "a=1", "--set=b=2", "--once", "x"])
		expect(flagAll(flags, repeated, "set")).toEqual(["a=1", "b=2"])
		expect(flags.set).toBe("b=2")
		expect(Object.keys(flags).sort()).toEqual(["once", "set"])
		expect(repeated).toEqual({ set: ["a=1", "b=2"] })
		expect(flagAll(flags, repeated, "once")).toEqual(["x"])
		expect(flagAll(flags, repeated, "absent")).toEqual([])
	})

	it("never lets --set values into the audit flags", () => {
		const { flags } = parseArgs([
			"--set",
			"authentication.token=abc",
			"--set",
			"url=https://x.test",
			"--api-secret",
			"zzz",
			"--limit",
			"5",
		])
		const audit = JSON.stringify(redactFlagsForAudit(flags))
		expect(audit).not.toContain("abc")
		expect(audit).not.toContain("zzz")
		expect(audit).not.toContain("x.test")
		expect(redactFlagsForAudit(flags).limit).toBe(5)
	})
})
