import { describe, expect, it } from "vitest"
import { FeelNumber, isFeelNumber } from "../src/decimal.js"

const n = (v: number | string | bigint): FeelNumber => FeelNumber.from(v)

function div(a: FeelNumber, b: FeelNumber): FeelNumber {
	const q = a.div(b)
	if (q === null) throw new Error("unexpected division by zero")
	return q
}

describe("FeelNumber", () => {
	describe("from()", () => {
		it("takes the shortest round-trip form of a JS number", () => {
			expect(n(0.1).toString()).toBe("0.1")
			expect(n(1e21).toString()).toBe("1000000000000000000000")
			expect(n(1e-7).toString()).toBe("0.0000001")
			expect(n(123456789012345680000).toString()).toBe("123456789012345680000")
			expect(n(-2.5e-3).toString()).toBe("-0.0025")
			expect(n(-0).toString()).toBe("0")
			expect(n(5).toString()).toBe("5")
		})

		it("rejects non-finite numbers", () => {
			expect(() => n(Number.NaN)).toThrow(RangeError)
			expect(() => n(Number.POSITIVE_INFINITY)).toThrow(RangeError)
		})

		it("parses decimal literals exactly, keeping their scale", () => {
			expect(n("110.0").toString()).toBe("110.0")
			expect(n("1.5e3").toString()).toBe("1500")
			expect(n("1.5E-3").toString()).toBe("0.0015")
			expect(n("+.5").toString()).toBe("0.5")
			expect(n("-7.").toString()).toBe("-7")
			expect(n("0.30").scale()).toBe(2)
			const long = "1.23456789012345678901234567890123456789"
			expect(n(long).toString()).toBe(long)
			expect(n(long).precision()).toBe(39)
		})

		it("rejects malformed strings", () => {
			expect(() => n("abc")).toThrow(SyntaxError)
			expect(() => n("")).toThrow(SyntaxError)
			expect(() => n(".")).toThrow(SyntaxError)
			expect(() => n("1e")).toThrow(SyntaxError)
		})

		it("accepts bigints and FeelNumbers", () => {
			expect(n(12345678901234567890n).toString()).toBe("12345678901234567890")
			const x = n("1.5")
			expect(FeelNumber.from(x)).toBe(x)
		})

		it("exposes ZERO and ONE", () => {
			expect(FeelNumber.ZERO.isZero()).toBe(true)
			expect(FeelNumber.ONE.toString()).toBe("1")
		})
	})

	describe("arithmetic without float artefacts", () => {
		it("0.1 + 0.2 = 0.3", () => {
			const sum = n(0.1).add(n(0.2))
			expect(sum.eq(n(0.3))).toBe(true)
			expect(sum.le(n(0.3))).toBe(true)
			expect(sum.toString()).toBe("0.3")
		})

		it("0.7 + 0.1 >= 0.8", () => {
			expect(n(0.7).add(n(0.1)).ge(n(0.8))).toBe(true)
		})

		it("0.1 + 0.2 + 0.3 = 0.6", () => {
			expect(n(0.1).add(n(0.2)).add(n(0.3)).eq(n(0.6))).toBe(true)
		})

		it("100 * 1.1 = 110.0", () => {
			const p = n(100).mul(n("1.1"))
			expect(p.toString()).toBe("110.0")
			expect(p.le(n(110))).toBe(true)
			expect(p.eq(n(110))).toBe(true)
		})

		it("floor(0.29 * 100) = 29 and ceil(0.1 * 3 * 10) = 3", () => {
			expect(n(0.29).mul(n(100)).floor().toString()).toBe("29")
			expect(n(0.1).mul(n(3)).mul(n(10)).ceil().toString()).toBe("3")
		})

		it("adds beyond 2^53 exactly", () => {
			expect(n("9007199254740993").add(n(1)).toString()).toBe("9007199254740994")
			expect(n(9007199254740993n).add(FeelNumber.ONE).eq(n("9007199254740994"))).toBe(true)
		})

		it("subtracts and negates", () => {
			expect(n(0.3).sub(n(0.1)).toString()).toBe("0.2")
			expect(n("1.50").sub(n("2")).toString()).toBe("-0.50")
			expect(n(2).neg().toString()).toBe("-2")
			expect(n(-2.5).abs().toString()).toBe("2.5")
		})
	})

	describe("division", () => {
		it("rounds 1/3 to 34 significant digits", () => {
			expect(div(n(1), n(3)).toString()).toBe(`0.${"3".repeat(34)}`)
			expect(div(n(2), n(3)).toString()).toBe(`0.${"6".repeat(33)}7`)
		})

		it("10 / 3 * 3 != 10", () => {
			const r = div(n(10), n(3)).mul(n(3))
			expect(r.eq(n(10))).toBe(false)
			expect(r.toString()).toBe(`9.${"9".repeat(33)}`)
		})

		it("strips exact quotients to the preferred scale", () => {
			expect(div(n(10), n(4)).toString()).toBe("2.5")
			expect(div(n(6), n(3)).toString()).toBe("2")
			expect(div(n(1), n(8)).toString()).toBe("0.125")
			expect(div(n("1.00"), n(4)).toString()).toBe("0.25")
			expect(div(n("6.00"), n(3)).toString()).toBe("2.00")
			expect(div(n(1), n("0.1")).toString()).toBe("10")
			expect(div(n(-7), n(2)).toString()).toBe("-3.5")
		})

		it("keeps the preferred scale of a zero dividend", () => {
			expect(div(n("0.00"), n(3)).toString()).toBe("0.00")
		})

		it("returns null on division by zero", () => {
			expect(n(1).div(n(0))).toBeNull()
			expect(n(0).div(n("0.0"))).toBeNull()
		})
	})

	describe("pow()", () => {
		it("computes integer powers exactly", () => {
			expect(n(2).pow(n(100))?.toString()).toBe("1267650600228229401496703205376")
			expect(n("1.1").pow(n(2))?.toString()).toBe("1.21")
			expect(n(5).pow(n(0))?.toString()).toBe("1")
			expect(n(2).pow(n(-2))?.toString()).toBe("0.25")
		})

		it("rounds large integer powers to 34 digits", () => {
			const r = n(3).pow(n(100))
			expect(r?.precision()).toBe(34)
			expect(r?.toString()).toBe("515377520732011331036461129765621300000000000000")
		})

		it("uses float64 for fractional exponents", () => {
			expect(n(2).pow(n(0.5))?.toNumber()).toBe(Math.SQRT2)
		})

		it("returns null for non-finite results", () => {
			expect(n(0).pow(n(-1))).toBeNull()
			expect(n(-8).pow(n(1 / 3))).toBeNull()
			expect(n(10).pow(n("1e400").add(n("0.5")))).toBeNull()
		})
	})

	describe("mod()", () => {
		it("follows the sign of the divisor", () => {
			expect(n(5).mod(n(3))?.toString()).toBe("2")
			expect(n(-5).mod(n(3))?.toString()).toBe("1")
			expect(n(5).mod(n(-3))?.toString()).toBe("-1")
			expect(n(-5).mod(n(-3))?.toString()).toBe("-2")
			expect(n("5.5").mod(n(2))?.toString()).toBe("1.5")
			expect(n(6).mod(n(3))?.isZero()).toBe(true)
		})

		it("returns null for a zero divisor", () => {
			expect(n(5).mod(n(0))).toBeNull()
		})
	})

	describe("rounding", () => {
		const cases: Array<[string, Parameters<FeelNumber["round"]>[1], string]> = [
			["2.5", "half-even", "2"],
			["3.5", "half-even", "4"],
			["-2.5", "half-even", "-2"],
			["2.5", "half-up", "3"],
			["-2.5", "half-up", "-3"],
			["2.5", "half-down", "2"],
			["-2.5", "half-down", "-2"],
			["2.6", "half-down", "3"],
			["2.1", "up", "3"],
			["-2.1", "up", "-3"],
			["2.9", "down", "2"],
			["-2.9", "down", "-2"],
			["-2.1", "ceiling", "-2"],
			["2.1", "ceiling", "3"],
			["-2.1", "floor", "-3"],
			["2.9", "floor", "2"],
		]
		for (const [value, mode, expected] of cases) {
			it(`round(${value}, 0, ${mode}) = ${expected}`, () => {
				expect(n(value).round(0, mode).toString()).toBe(expected)
			})
		}

		it("pads or rounds to a scale, including negative scales", () => {
			expect(n(1).round(2, "half-even").toString()).toBe("1.00")
			expect(n("1.125").round(2, "half-even").toString()).toBe("1.12")
			expect(n("1.135").round(2, "half-even").toString()).toBe("1.14")
			expect(n("1.125").round(2, "half-up").toString()).toBe("1.13")
			expect(n(1250).round(-2, "half-even").toString()).toBe("1200")
			expect(n(1350).round(-2, "half-even").toString()).toBe("1400")
		})

		it("rounds HALF_EVEN at the 34th significant digit", () => {
			const half = n(`0.${"0".repeat(33)}5`)
			const even = n(`1.${"0".repeat(33)}`)
			const odd = n(`1.${"0".repeat(32)}1`)
			expect(even.add(half).toString()).toBe(`1.${"0".repeat(33)}`)
			expect(odd.add(half).toString()).toBe(`1.${"0".repeat(32)}2`)
			const aboveHalf = n(`0.${"0".repeat(33)}51`)
			expect(even.add(aboveHalf).toString()).toBe(`1.${"0".repeat(32)}1`)
		})

		it("carries into a new digit when rounding up nines", () => {
			const nines = n("9".repeat(34))
			expect(nines.add(n("0.5")).toString()).toBe(`1${"0".repeat(34)}`)
			expect(nines.add(n("0.5")).precision()).toBe(34)
		})

		it("floors, ceils and truncates to an integer", () => {
			expect(n(-1.5).floor().toString()).toBe("-2")
			expect(n(-1.5).ceil().toString()).toBe("-1")
			expect(n(-1.5).trunc().toString()).toBe("-1")
			expect(n(1.5).trunc().toString()).toBe("1")
		})
	})

	describe("comparison", () => {
		it("compares by value, not scale", () => {
			expect(n("0.30").eq(n("0.3"))).toBe(true)
			expect(n("0.3e0").eq(n("0.30"))).toBe(true)
			expect(n("1e3").cmp(n("1000.000"))).toBe(0)
			expect(n(1).cmp(n(2))).toBe(-1)
			expect(n(-1).cmp(n(-2))).toBe(1)
			expect(n("1e100").gt(n("9".repeat(99)))).toBe(true)
			expect(n(-3).lt(n(0))).toBe(true)
			expect(n(0).cmp(n("-0.0"))).toBe(0)
		})

		it("reports sign, integrality and zero", () => {
			expect(n(-3).sign()).toBe(-1)
			expect(n("0.000").sign()).toBe(0)
			expect(n(2).sign()).toBe(1)
			expect(n("3.00").isInteger()).toBe(true)
			expect(n("3.01").isInteger()).toBe(false)
			expect(n("1e5").isInteger()).toBe(true)
			expect(n("0.0").isZero()).toBe(true)
		})
	})

	describe("conversion", () => {
		it("converts to JS numbers and bigints", () => {
			expect(n(0.1).add(n(0.2)).toNumber()).toBe(0.3)
			expect(div(n(1), n(3)).toNumber()).toBe(1 / 3)
			expect(n("1e400").toNumber()).toBe(Number.POSITIVE_INFINITY)
			expect(n("-12.9").toBigInt()).toBe(-12n)
			expect(n("1e3").toBigInt()).toBe(1000n)
			expect(JSON.stringify({ x: n("1.50") })).toBe('{"x":1.5}')
		})

		it("reports precision and scale", () => {
			expect(n("123.45").precision()).toBe(5)
			expect(n("123.45").scale()).toBe(2)
			expect(n("1e3").scale()).toBe(-3)
			expect(n(0).precision()).toBe(1)
		})

		it("recognises instances", () => {
			expect(isFeelNumber(n(1))).toBe(true)
			expect(isFeelNumber(1)).toBe(false)
			expect(isFeelNumber("1")).toBe(false)
		})
	})
})
