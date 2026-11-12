// @vitest-environment node
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"

// The release's consumable check imports every export under plain Node.
it("the IIFE bundle imports under Node without a document", () => {
	const bundle = fileURLToPath(new URL("../dist/viewer-lite.min.js", import.meta.url))
	const out = execFileSync(
		process.execPath,
		[
			"--input-type=module",
			"-e",
			`await import(${JSON.stringify(bundle)}); console.log(typeof globalThis.BpmnLite.render)`,
		],
		{ encoding: "utf8" },
	)
	expect(out.trim()).toBe("function")
})
