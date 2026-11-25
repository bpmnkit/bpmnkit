import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

// Needs packages/feel built, as the oracle itself does.
const oracle = fileURLToPath(new URL("./oracle.mjs", import.meta.url))

function ask(requests) {
	const input = requests.map((r) => JSON.stringify(r)).join("\n")
	const r = spawnSync(process.execPath, [oracle], { input, encoding: "utf8" })
	assert.equal(r.status, 0, r.stderr)
	return r.stdout
		.trim()
		.split("\n")
		.map((l) => JSON.parse(l))
}

const num = (v) => ({ t: "number", v })

// Regression: after Decimal128 numbers, the oracle encoded every number as a context
// ({coefficient, exponent}), so the nightly fuzzer reported each numeric result as a mismatch.
test("feel numbers round-trip as exact decimal strings", () => {
	const l = { t: "list", v: [num("0.1")] }
	const [filter, zero, pow, ctx, big] = ask([
		{ target: "feel", expr: "l[item > 0.0]", context: { l } },
		{ target: "feel", expr: "if 0 then 0 else 0", context: {} },
		{ target: "feel", expr: "0 ** 0", context: {} },
		{ target: "feel", expr: "{a: 0, b: 1.50}", context: {} },
		{ target: "feel", expr: "x + 1", context: { x: num("12345678901234567890.1") } },
	])
	assert.deepEqual(filter, { value: l })
	assert.deepEqual(zero, { value: num("0") })
	assert.deepEqual(pow, { value: num("1") })
	assert.deepEqual(ctx, { value: { t: "context", v: { a: num("0"), b: num("1.5") } } })
	assert.deepEqual(big, { value: num("12345678901234567891.1") })
})
