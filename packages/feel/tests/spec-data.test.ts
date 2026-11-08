import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { builtinNames, getBuiltin, orderNamedArgs } from "../src/builtins.js"

// spec/feel-builtins.json is the single source for built-in signatures (pnpm spec:gen).
const specFile = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../spec/feel-builtins.json",
)
const spec = JSON.parse(fs.readFileSync(specFile, "utf8")) as {
	builtins: { name: string; signatures: string[][]; variadic?: boolean }[]
}

describe("spec/feel-builtins.json", () => {
	it("lists exactly the built-ins the evaluator implements", () => {
		expect(spec.builtins.map((b) => b.name).sort()).toEqual(builtinNames().sort())
	})

	it("drives named-argument binding", () => {
		expect(orderNamedArgs("substring", ["start position", "string"])).toEqual([1, 0])
		expect(orderNamedArgs("fromAi", ["type", "value"])).toEqual([1, 0])
		expect(orderNamedArgs("substring", ["string", "length"])).toBeNull()
	})

	it("drives arity checks, except for variadic built-ins", () => {
		expect(getBuiltin("substring")?.call([{ type: "string", value: "x" } as never])).toBeNull()
		for (const b of spec.builtins.filter((b) => b.variadic)) {
			expect(b.signatures.length).toBeGreaterThan(0)
		}
	})
})
