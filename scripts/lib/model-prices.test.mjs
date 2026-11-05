import assert from "node:assert/strict"
import { test } from "node:test"
import { PRICES, PRICES_AS_OF, costUsd } from "./model-prices.mjs"

test("cost is tokens × list price per million", () => {
	const p = PRICES["claude-opus-5-5"]
	assert.ok(p && p.input > 0 && p.output > 0)
	assert.equal(costUsd("claude-opus-5-5", 1_000_000, 1_000_000), p.input + p.output)
	assert.equal(costUsd("claude-opus-5-5", 500_000, 0), p.input / 2)
})

test("unknown model or missing token split gives null, never a guess", () => {
	assert.equal(costUsd("claude-nonexistent", 1, 1), null)
	assert.equal(costUsd(null, 1, 1), null)
	assert.equal(costUsd("claude-opus-5-5", null, 10), null)
	assert.equal(costUsd("claude-opus-5-5", 10, null), null)
})

test("the table is dated and every price is a positive number", () => {
	assert.match(PRICES_AS_OF, /^\d{4}-\d{2}-\d{2}$/)
	for (const [id, p] of Object.entries(PRICES)) {
		assert.ok(p.input > 0 && p.output > 0, id)
	}
})
