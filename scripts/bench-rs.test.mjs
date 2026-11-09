import assert from "node:assert/strict"
import { test } from "node:test"
import { compare, parseRows } from "./bench-rs.mjs"

test("parseRows reads every bench's row format and converts to µs", () => {
	const out = [
		"51 files, 1522670 bytes, 300 passes",
		"parse                14888.5 µs per pass",
		"build layout           9.050 ms per pass",
		"fuzz/19 eval           32273.43 µs per expr",
		"matches() new pattern     55.59 µs per call",
		"running 0 tests",
	].join("\n")
	assert.deepEqual(parseRows(out), {
		parse: 14888.5,
		"build layout": 9050,
		"fuzz/19 eval": 32273.43,
		"matches() new pattern": 55.59,
	})
})

test("compare flags rows beyond the threshold both ways, and missing or new rows", () => {
	const r = compare({ a: 100, b: 100, c: 100, gone: 1 }, { a: 121, b: 119, c: 80, fresh: 2 }, 0.2)
	assert.deepEqual(
		r.regressions.map((x) => x.key),
		["a"],
	)
	assert.deepEqual(
		r.improvements.map((x) => x.key),
		["c"],
	)
	assert.deepEqual(r.missing, ["gone"])
	assert.deepEqual(r.added, ["fresh"])
})
