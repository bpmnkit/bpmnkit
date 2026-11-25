/**
 * Arbitrary-precision decimal for FEEL numbers, matching the Java `BigDecimal` arithmetic that
 * Camunda's feel-scala uses with `MathContext.DECIMAL128` (34 significant digits, HALF_EVEN).
 *
 * A value is `coefficient * 10^exponent`; the scale is `-exponent`, as in Java. Literals and
 * converted JS numbers are kept exact, even beyond 34 digits: like Scala's `BigDecimal(String)`,
 * rounding only happens on arithmetic results.
 */

export type RoundingMode =
	| "half-even"
	| "half-up"
	| "half-down"
	| "up"
	| "down"
	| "ceiling"
	| "floor"

const PRECISION = 34
/** Java's `BigDecimal.pow(int)` limit; larger integer exponents take the float64 path. */
const MAX_POW = 999_999_999

const POW10_CACHE: bigint[] = []
function pow10(n: number): bigint {
	if (n < 64) {
		let p = POW10_CACHE[n]
		if (p === undefined) {
			p = 10n ** BigInt(n)
			POW10_CACHE[n] = p
		}
		return p
	}
	return 10n ** BigInt(n)
}

function digitCount(c: bigint): number {
	return (c < 0n ? -c : c).toString().length
}

/** Divides `n` by a positive `d`, rounding the integer quotient with `mode`. */
function divRound(n: bigint, d: bigint, mode: RoundingMode): bigint {
	const q = n / d
	const r = n % d
	if (r === 0n) return q
	const negative = n < 0n
	const away = negative ? q - 1n : q + 1n
	switch (mode) {
		case "down":
			return q
		case "up":
			return away
		case "ceiling":
			return negative ? q : away
		case "floor":
			return negative ? away : q
		default: {
			const twice = (negative ? -r : r) * 2n
			if (twice > d) return away
			if (twice < d) return q
			if (mode === "half-up") return away
			if (mode === "half-down") return q
			return q % 2n === 0n ? q : away
		}
	}
}

function floorDiv(a: bigint, b: bigint): bigint {
	const q = a / b
	return a % b !== 0n && a < 0n !== b < 0n ? q - 1n : q
}

const LITERAL = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/

export class FeelNumber {
	static readonly ZERO: FeelNumber = new FeelNumber(0n, 0)
	static readonly ONE: FeelNumber = new FeelNumber(1n, 0)

	private constructor(
		readonly coefficient: bigint,
		readonly exponent: number,
	) {}

	/**
	 * JS numbers go through their shortest round-trip string, so `0.1` becomes exactly 0.1.
	 * Throws `RangeError` for non-finite numbers and `SyntaxError` for malformed strings.
	 */
	static from(v: number | string | bigint | FeelNumber): FeelNumber {
		if (v instanceof FeelNumber) return v
		if (typeof v === "bigint") return new FeelNumber(v, 0)
		if (typeof v === "number") {
			if (!Number.isFinite(v)) throw new RangeError(`Not a finite number: ${v}`)
			return FeelNumber.parse(String(v))
		}
		return FeelNumber.parse(v)
	}

	private static parse(s: string): FeelNumber {
		const m = LITERAL.exec(s.trim())
		const int = m?.[2] ?? ""
		const frac = m?.[3] ?? ""
		if (!m || int.length + frac.length === 0) throw new SyntaxError(`Not a decimal number: "${s}"`)
		const digits = BigInt(int + frac)
		return new FeelNumber(m[1] === "-" ? -digits : digits, Number(m[4] ?? 0) - frac.length)
	}

	/** Rounds to `precision` significant digits (HALF_EVEN), like Java's `doRound(mc)`. */
	private static rounded(coef: bigint, exp: number, precision = PRECISION): FeelNumber {
		const drop = digitCount(coef) - precision
		if (drop <= 0) return new FeelNumber(coef, exp)
		let c = divRound(coef, pow10(drop), "half-even")
		let e = exp + drop
		// Rounding 99…9 up yields 10^precision: one digit too many, dropped exactly.
		if (digitCount(c) > precision) {
			c /= 10n
			e += 1
		}
		return new FeelNumber(c, e)
	}

	/** Coefficient rescaled to `exp`, which must not exceed this exponent. */
	private coefAt(exp: number): bigint {
		return this.coefficient * pow10(this.exponent - exp)
	}

	add(o: FeelNumber): FeelNumber {
		return FeelNumber.addPrec(this, o, PRECISION)
	}

	private static addPrec(a: FeelNumber, b: FeelNumber, precision: number): FeelNumber {
		const e = Math.min(a.exponent, b.exponent)
		return FeelNumber.rounded(a.coefAt(e) + b.coefAt(e), e, precision)
	}

	sub(o: FeelNumber): FeelNumber {
		return this.add(o.neg())
	}

	mul(o: FeelNumber): FeelNumber {
		return this.mulPrec(o, PRECISION)
	}

	private mulPrec(o: FeelNumber, precision: number): FeelNumber {
		return FeelNumber.rounded(
			this.coefficient * o.coefficient,
			this.exponent + o.exponent,
			precision,
		)
	}

	/** `null` on division by zero. */
	div(o: FeelNumber): FeelNumber | null {
		return this.divPrec(o, PRECISION)
	}

	/**
	 * Java's `divide(divisor, mc)`: a `precision`-digit quotient; when exact, trailing zeros are
	 * stripped down to the preferred scale `this.scale - o.scale`.
	 */
	private divPrec(o: FeelNumber, precision: number): FeelNumber | null {
		if (o.coefficient === 0n) return null
		const preferredExp = this.exponent - o.exponent
		if (this.coefficient === 0n) return new FeelNumber(0n, preferredExp)
		const negative = this.coefficient < 0n !== o.coefficient < 0n
		const a = this.coefficient < 0n ? -this.coefficient : this.coefficient
		const b = o.coefficient < 0n ? -o.coefficient : o.coefficient
		// Shift so the integer quotient has exactly `precision` digits; rounding then needs only
		// the remainder, which avoids double rounding.
		let k = precision + digitCount(b) - digitCount(a)
		const scaled = (shift: number): [bigint, bigint] =>
			shift >= 0 ? [a * pow10(shift), b] : [a, b * pow10(-shift)]
		let [num, den] = scaled(k)
		if (digitCount(num / den) > precision) {
			k -= 1
			;[num, den] = scaled(k)
		}
		const exact = num % den === 0n
		let q = divRound(negative ? -num : num, den, "half-even")
		let exp = preferredExp - k
		if (digitCount(q) > precision) {
			q /= 10n
			exp += 1
		}
		if (exact) {
			while (exp < preferredExp && q % 10n === 0n) {
				q /= 10n
				exp += 1
			}
		}
		return new FeelNumber(q, exp)
	}

	neg(): FeelNumber {
		return new FeelNumber(-this.coefficient, this.exponent)
	}

	abs(): FeelNumber {
		return this.coefficient < 0n ? this.neg() : this
	}

	sign(): -1 | 0 | 1 {
		return this.coefficient < 0n ? -1 : this.coefficient > 0n ? 1 : 0
	}

	isZero(): boolean {
		return this.coefficient === 0n
	}

	isInteger(): boolean {
		return this.exponent >= 0 || this.coefficient % pow10(-this.exponent) === 0n
	}

	/** Compares by value, ignoring scale: `0.30` equals `0.3`. */
	cmp(o: FeelNumber): -1 | 0 | 1 {
		const sa = this.sign()
		const sb = o.sign()
		if (sa !== sb) return sa < sb ? -1 : 1
		if (sa === 0) return 0
		// Magnitudes far apart are decided without building huge aligned coefficients.
		const adjA = digitCount(this.coefficient) + this.exponent
		const adjB = digitCount(o.coefficient) + o.exponent
		if (adjA !== adjB) return adjA > adjB === sa > 0 ? 1 : -1
		const e = Math.min(this.exponent, o.exponent)
		const ca = this.coefAt(e)
		const cb = o.coefAt(e)
		return ca < cb ? -1 : ca > cb ? 1 : 0
	}

	eq(o: FeelNumber): boolean {
		return this.cmp(o) === 0
	}

	lt(o: FeelNumber): boolean {
		return this.cmp(o) < 0
	}

	le(o: FeelNumber): boolean {
		return this.cmp(o) <= 0
	}

	gt(o: FeelNumber): boolean {
		return this.cmp(o) > 0
	}

	ge(o: FeelNumber): boolean {
		return this.cmp(o) >= 0
	}

	/**
	 * Integer exponents follow Java's `BigDecimal.pow(n, mc)` (binary exponentiation at
	 * 34 + digits(n) + 1 working digits, then rounded to 34); fractional ones go through float64.
	 * `null` when the result is not finite (or `0 ** -n`).
	 */
	pow(n: FeelNumber): FeelNumber | null {
		if (n.isInteger() && n.abs().le(FeelNumber.from(MAX_POW))) {
			const e = Number(n.toBigInt())
			if (e === 0) return FeelNumber.ONE
			let mag = Math.abs(e)
			const work = PRECISION + String(mag).length + 1
			let acc = FeelNumber.ONE
			let seenBit = false
			for (let i = 1; i <= 31; i++) {
				mag *= 2
				if (mag >= 2 ** 31) {
					mag -= 2 ** 31
					seenBit = true
					acc = acc.mulPrec(this, work)
				}
				if (i === 31) break
				if (seenBit) acc = acc.mulPrec(acc, work)
			}
			if (e < 0) {
				const inv = FeelNumber.ONE.divPrec(acc, work)
				if (inv === null) return null
				acc = inv
			}
			return FeelNumber.rounded(acc.coefficient, acc.exponent)
		}
		const r = this.toNumber() ** n.toNumber()
		return Number.isFinite(r) ? FeelNumber.from(r) : null
	}

	/** FEEL modulo, `a - b * floor(a / b)` (sign follows the divisor), exact; `null` for `b = 0`. */
	mod(o: FeelNumber): FeelNumber | null {
		if (o.coefficient === 0n) return null
		const e = Math.min(this.exponent, o.exponent)
		const a = this.coefAt(e)
		const b = o.coefAt(e)
		return new FeelNumber(a - b * floorDiv(a, b), e)
	}

	floor(): FeelNumber {
		return this.round(0, "floor")
	}

	ceil(): FeelNumber {
		return this.round(0, "ceiling")
	}

	trunc(): FeelNumber {
		return this.round(0, "down")
	}

	/** Java's `setScale(scale, mode)`; a negative scale rounds to tens, hundreds, … */
	round(scale: number, mode: RoundingMode): FeelNumber {
		const exp = -scale
		if (exp <= this.exponent) return new FeelNumber(this.coefAt(exp), exp)
		return new FeelNumber(divRound(this.coefficient, pow10(exp - this.exponent), mode), exp)
	}

	/** Correctly rounded to the nearest float64 (±Infinity when out of range). */
	toNumber(): number {
		return Number(`${this.coefficient}e${this.exponent}`)
	}

	/** Truncated toward zero. */
	toBigInt(): bigint {
		return this.exponent >= 0
			? this.coefficient * pow10(this.exponent)
			: this.coefficient / pow10(-this.exponent)
	}

	toJSON(): number {
		return this.toNumber()
	}

	/** The same value at its smallest scale (Java's `stripTrailingZeros`): `1.50` is `1.5`, `0.0` is `0`. */
	stripTrailingZeros(): FeelNumber {
		if (this.coefficient === 0n) return FeelNumber.ZERO
		let c = this.coefficient
		let e = this.exponent
		while (c % 10n === 0n) {
			c /= 10n
			e += 1
		}
		return c === this.coefficient ? this : new FeelNumber(c, e)
	}

	/** Number of significant digits in the coefficient (1 for zero). */
	precision(): number {
		return digitCount(this.coefficient)
	}

	scale(): number {
		return -this.exponent
	}

	/** Plain notation (Java's `toPlainString`), keeping the scale: `100 * 1.1` is `"110.0"`. */
	toString(): string {
		if (this.coefficient === 0n) {
			return this.exponent >= 0 ? "0" : `0.${"0".repeat(-this.exponent)}`
		}
		const sign = this.coefficient < 0n ? "-" : ""
		const digits = (this.coefficient < 0n ? -this.coefficient : this.coefficient).toString()
		if (this.exponent >= 0) return sign + digits + "0".repeat(this.exponent)
		const scale = -this.exponent
		const padded = digits.padStart(scale + 1, "0")
		const point = padded.length - scale
		return `${sign}${padded.slice(0, point)}.${padded.slice(point)}`
	}
}

export function isFeelNumber(v: unknown): v is FeelNumber {
	return v instanceof FeelNumber
}
