import { afterEach, describe, expect, it, vi } from "vitest"
import { createOutputWriter } from "./output.js"

afterEach(() => {
	vi.restoreAllMocks()
})

function captureStdout(): string[] {
	const written: string[] = []
	vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
		written.push(String(chunk))
		return true
	})
	return written
}

describe("printItem", () => {
	it("prints a string result as is, so XML can be redirected to a file", () => {
		const written = captureStdout()
		createOutputWriter("table", true).printItem("<definitions/>")
		expect(written.join("")).toBe("<definitions/>\n")
	})

	it("still prints a string as JSON with --output json", () => {
		const written = captureStdout()
		createOutputWriter("json", true).printItem("<definitions/>")
		expect(written.join("")).toBe('"<definitions/>"\n')
	})
})
