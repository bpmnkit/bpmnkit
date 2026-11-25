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

// Regression: the engine's DMN API returns plain JS values (`toJs`), and the oracle encoded those
// JS numbers as empty contexts, so every numeric dmn-eval result was a nightly mismatch.
test("dmn-eval numbers encode as decimals", () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="defs" name="d" namespace="n">
  <decision id="d0" name="d0"><literalExpression><text>[1, 2.50]</text></literalExpression></decision>
  <decision id="d1" name="d1"><literalExpression><text>10.5</text></literalExpression></decision>
</definitions>`
	const [list, one] = ask([
		{ target: "dmn-eval", xml, decision: "d0", context: {} },
		{ target: "dmn-eval", xml, decision: "d1", context: {} },
	])
	assert.deepEqual(list.result, { t: "list", v: [num("1"), num("2.5")] })
	assert.deepEqual(one.result, num("10.5"))
})
