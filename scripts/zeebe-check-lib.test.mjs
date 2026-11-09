import assert from "node:assert/strict"
import { test } from "node:test"
import {
	diffExpectations,
	diffVerdicts,
	expectationOf,
	shrinkViolations,
} from "./zeebe-check-lib.mjs"

const ok = { ok: true, errors: [] }
const bad = (m) => ({ ok: false, errors: [m] })

test("expectationOf defaults to deployable and requires a reason when false", () => {
	assert.deepEqual(expectationOf(undefined, "x"), { deployable: true })
	assert.deepEqual(expectationOf({ script: [] }, "x"), { deployable: true })
	assert.throws(() => expectationOf({ deployable: false }, "x"), /deployableReason/)
	assert.throws(
		() => expectationOf({ deployable: false, deployableReason: " " }, "x"),
		/deployableReason/,
	)
	assert.deepEqual(expectationOf({ deployable: false, deployableReason: "why" }, "x"), {
		deployable: false,
		reason: "why",
	})
})

test("diffExpectations reports each failure class", () => {
	const cases = [
		{ key: "a", deployable: true },
		{ key: "b", deployable: true },
		{ key: "c", deployable: true },
		{ key: "d", deployable: false },
		{ key: "e", deployable: false },
		{ key: "f", deployable: true },
	]
	const results = new Map([
		["a", ok],
		["b", bad("boom")],
		["c", bad("known")],
		["d", ok],
		["e", bad("fine")],
		["f", ok],
	])
	const allow = { c: "known", f: "stale", e: "wrong", gone: "x" }
	const { failures, warnings } = diffExpectations({ cases, results, allow })
	assert.equal(failures.length, 4)
	assert.match(failures.join("\n"), /b: rejected by Zeebe and not in the allowlist: boom/)
	assert.match(failures.join("\n"), /f: now accepted/)
	assert.match(failures.join("\n"), /e: allowlisted but the case is marked deployable:false/)
	assert.match(failures.join("\n"), /gone: allowlisted but no such case/)
	assert.deepEqual(warnings, ["d: marked deployable:false but Zeebe accepts it"])
})

test("a clean run has no failures", () => {
	const { failures } = diffExpectations({
		cases: [{ key: "a", deployable: true }],
		results: new Map([["a", ok]]),
		allow: {},
	})
	assert.deepEqual(failures, [])
})

test("shrinkViolations flags only additions", () => {
	assert.deepEqual(shrinkViolations({ a: "1" }, { a: "1", b: "2" }), [])
	assert.equal(shrinkViolations({ a: "1", z: "9" }, { a: "1" }).length, 1)
})

test("diffVerdicts ignores error order but not content", () => {
	const e = { "x.bpmn": { ok: false, errors: ["b", "a"] } }
	assert.deepEqual(diffVerdicts(e, { "x.bpmn": { ok: false, errors: ["a", "b"] } }), [])
	assert.equal(diffVerdicts(e, { "x.bpmn": { ok: true, errors: [] } }).length, 1)
	assert.equal(diffVerdicts(e, {}).length, 1)
	assert.equal(diffVerdicts({}, e).length, 1)
})
