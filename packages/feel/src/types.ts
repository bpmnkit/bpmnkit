import { FeelNumber, isFeelNumber } from "./decimal.js"

export { FeelNumber, isFeelNumber }
export type { RoundingMode } from "./decimal.js"

/**
 * A FEEL value. Numbers are `FeelNumber` (DMN Decimal128), never a JS `number`: use `fromJs`
 * to bring JS data in and `toJs` to take a result out.
 */
export type FeelValue =
	| null
	| FeelNumber
	| string
	| boolean
	| FeelDate
	| FeelTime
	| FeelDateTime
	| FeelDayTimeDuration
	| FeelYearsMonthsDuration
	| FeelRange
	| FeelValue[]
	| FeelContext
	| FeelFunction

export interface FeelDate {
	type: "date"
	year: number
	month: number
	day: number
}

export interface FeelTime {
	type: "time"
	hour: number
	minute: number
	second: number
	offsetSeconds?: number
	timezone?: string
}

export interface FeelDateTime {
	type: "date-time"
	date: FeelDate
	time: FeelTime
}

export interface FeelDayTimeDuration {
	type: "days-time-duration"
	seconds: number
}

export interface FeelYearsMonthsDuration {
	type: "years-months-duration"
	months: number
}

export interface FeelRange {
	type: "range"
	start: FeelValue
	startIncluded: boolean
	end: FeelValue
	endIncluded: boolean
}

// Use interface to avoid circular type alias issue with Record<string, FeelValue>
export interface FeelContext {
	[key: string]: FeelValue
}

export interface FeelFunction {
	type: "function"
	paramNames?: string[]
	call: (args: FeelValue[]) => FeelValue
}

// Type guards

function objType(v: object): string | undefined {
	const t = (v as { type?: unknown }).type
	return typeof t === "string" ? t : undefined
}

export function isFeelDate(v: FeelValue): v is FeelDate {
	if (typeof v !== "object" || v === null || Array.isArray(v)) return false
	return objType(v) === "date"
}

export function isFeelTime(v: FeelValue): v is FeelTime {
	if (typeof v !== "object" || v === null || Array.isArray(v)) return false
	return objType(v) === "time"
}

export function isFeelDateTime(v: FeelValue): v is FeelDateTime {
	if (typeof v !== "object" || v === null || Array.isArray(v)) return false
	return objType(v) === "date-time"
}

export function isFeelDayTimeDuration(v: FeelValue): v is FeelDayTimeDuration {
	if (typeof v !== "object" || v === null || Array.isArray(v)) return false
	return objType(v) === "days-time-duration"
}

export function isFeelYearsMonthsDuration(v: FeelValue): v is FeelYearsMonthsDuration {
	if (typeof v !== "object" || v === null || Array.isArray(v)) return false
	return objType(v) === "years-months-duration"
}

export function isFeelRange(v: FeelValue): v is FeelRange {
	if (typeof v !== "object" || v === null || Array.isArray(v)) return false
	return objType(v) === "range"
}

export function isFeelFunction(v: FeelValue): v is FeelFunction {
	if (typeof v !== "object" || v === null || Array.isArray(v)) return false
	return objType(v) === "function"
}

export function isFeelDuration(v: FeelValue): v is FeelDayTimeDuration | FeelYearsMonthsDuration {
	return isFeelDayTimeDuration(v) || isFeelYearsMonthsDuration(v)
}

export function isFeelList(v: FeelValue): v is FeelValue[] {
	return Array.isArray(v)
}

export function isFeelContext(v: FeelValue): v is FeelContext {
	if (typeof v !== "object" || v === null || Array.isArray(v) || isFeelNumber(v)) return false
	const t = objType(v)
	return (
		t !== "date" &&
		t !== "time" &&
		t !== "date-time" &&
		t !== "days-time-duration" &&
		t !== "years-months-duration" &&
		t !== "range" &&
		t !== "function"
	)
}

/** Gets a named property from a FeelValue for path expressions. Returns null if not found. */
export function getProperty(v: FeelValue, key: string): FeelValue {
	if (typeof v !== "object" || v === null || Array.isArray(v) || isFeelNumber(v)) return null
	if (isFeelDate(v)) {
		if (key === "year") return num(v.year)
		if (key === "month") return num(v.month)
		if (key === "day") return num(v.day)
		if (key === "weekday") return num(weekdayOf(v))
		return null
	}
	if (isFeelTime(v)) {
		if (key === "hour") return num(v.hour)
		if (key === "minute") return num(v.minute)
		if (key === "second") return num(v.second)
		if (key === "time offset") return offsetDuration(v.offsetSeconds)
		if (key === "timezone") return v.timezone ?? null
		return null
	}
	if (isFeelDateTime(v)) {
		if (key === "year") return num(v.date.year)
		if (key === "month") return num(v.date.month)
		if (key === "day") return num(v.date.day)
		if (key === "hour") return num(v.time.hour)
		if (key === "minute") return num(v.time.minute)
		if (key === "second") return num(v.time.second)
		if (key === "time offset") return offsetDuration(v.time.offsetSeconds)
		if (key === "timezone") return v.time.timezone ?? null
		if (key === "time") return v.time
		if (key === "weekday") return num(weekdayOf(v.date))
		return null
	}
	if (isFeelDayTimeDuration(v)) {
		const total = v.seconds
		if (key === "days") return num(Math.trunc(total / 86400))
		if (key === "hours") return num(Math.trunc((total % 86400) / 3600))
		if (key === "minutes") return num(Math.trunc((total % 3600) / 60))
		if (key === "seconds") {
			// Split off exactly, truncating like Rust's Decimal `%`: float `% 60` drifts on large totals.
			const secs = FeelNumber.from(Math.abs(total)).mod(FeelNumber.from(60))
			return total < 0 ? (secs?.neg() ?? null) : secs
		}
		return null
	}
	if (isFeelYearsMonthsDuration(v)) {
		if (key === "years") return num(Math.trunc(v.months / 12))
		if (key === "months") return num(v.months % 12)
		return null
	}
	if (isFeelRange(v)) {
		if (key === "start") return v.start
		if (key === "end") return v.end
		if (key === "start included") return v.startIncluded
		if (key === "end included") return v.endIncluded
		return null
	}
	// FeelContext
	const val = (v as FeelContext)[key]
	return val !== undefined ? val : null
}

/** A time offset is a duration, not a number of hours. */
function offsetDuration(offsetSeconds: number | undefined): FeelValue {
	if (offsetSeconds === undefined) return null
	return { type: "days-time-duration", seconds: offsetSeconds }
}

/** Day of the week as FEEL numbers them: Monday is 1, Sunday is 7. */
function weekdayOf(d: FeelDate): number {
	const y = d.year - 1
	let days = 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)
	const monthLengths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
	const leap = (d.year % 4 === 0 && d.year % 100 !== 0) || d.year % 400 === 0
	for (let m = 1; m < d.month; m++) days += (m === 2 && leap ? 29 : monthLengths[m]) ?? 30
	days += d.day
	// 0001-01-01 was a Monday in the proleptic Gregorian calendar.
	return ((days - 1) % 7) + 1
}

/** A JS number as a FEEL number; a non-finite one has no FEEL number and is null. */
export function num(n: number): FeelNumber | null {
	return Number.isFinite(n) ? FeelNumber.from(n) : null
}

const TEMPORAL_TAGS = new Set([
	"date",
	"time",
	"date-time",
	"days-time-duration",
	"years-months-duration",
])

function isPlainObject(v: object): boolean {
	const proto = Object.getPrototypeOf(v)
	return proto === Object.prototype || proto === null
}

/**
 * Brings JS data into FEEL: numbers and bigints become `FeelNumber` (a non-finite number is
 * null), `undefined` is null, and lists and plain objects are converted deeply. FEEL values pass
 * through, and a value that needs no change is returned as the same object.
 */
export function fromJs(v: unknown): FeelValue {
	if (v === undefined || v === null) return null
	switch (typeof v) {
		case "number":
			return num(v)
		case "bigint":
			return FeelNumber.from(v)
		case "string":
		case "boolean":
			return v
		case "object":
			break
		default:
			return null
	}
	const o = v as object
	if (isFeelNumber(o)) return o
	if (Array.isArray(o)) {
		let out: FeelValue[] | undefined
		for (let i = 0; i < o.length; i++) {
			const item: unknown = o[i]
			const converted = fromJs(item)
			if (converted !== item && out === undefined) out = o.slice(0, i) as FeelValue[]
			if (out !== undefined) out.push(converted)
		}
		return out ?? (o as FeelValue[])
	}
	const tag = (o as { type?: unknown }).type
	if (typeof tag === "string" && TEMPORAL_TAGS.has(tag)) return o as FeelValue
	if (tag === "function" && typeof (o as { call?: unknown }).call === "function") {
		return o as FeelFunction
	}
	if (tag === "range") {
		const r = o as FeelRange
		const start = fromJs(r.start)
		const end = fromJs(r.end)
		return start === r.start && end === r.end ? r : { ...r, start, end }
	}
	if (!isPlainObject(o)) return o as FeelValue
	let out: FeelContext | undefined
	const entries = Object.entries(o)
	for (let i = 0; i < entries.length; i++) {
		const [key, item] = entries[i] as [string, unknown]
		const converted = fromJs(item)
		if (converted !== item && out === undefined) {
			out = {}
			for (let k = 0; k < i; k++) {
				const [prevKey, prev] = entries[k] as [string, FeelValue]
				defineEntry(out, prevKey, prev)
			}
		}
		if (out !== undefined) defineEntry(out, key, converted)
	}
	return out ?? (o as FeelContext)
}

/** defineProperty, so that a "__proto__" key stays an entry rather than a prototype. */
function defineEntry(ctx: FeelContext, key: string, value: FeelValue): void {
	Object.defineProperty(ctx, key, { value, enumerable: true, writable: true, configurable: true })
}

/**
 * Takes a FEEL value out to plain JS: every `FeelNumber` becomes the nearest JS number, deeply
 * through lists, contexts and range bounds. Dates, times, durations and functions are unchanged.
 */
/**
 * Writes a value the way the playgrounds show it: lists, contexts and ranges as indented JSON, with
 * every number (nested too) printed exactly, as `FeelNumber#toString` keeps digits and scale that a
 * JS number would lose.
 */
export function formatFeelValue(v: FeelValue): string {
	if (v === null) return "null"
	if (typeof v === "string") return `"${v}"`
	if (typeof v === "boolean" || isFeelNumber(v)) return String(v)
	return formatJson(v, "")
}

function formatJson(v: FeelValue, pad: string): string {
	if (isFeelNumber(v)) return v.toString()
	const inner = `${pad}  `
	const block = (open: string, close: string, items: string[]) =>
		items.length === 0
			? open + close
			: `${open}\n${items.map((i) => inner + i).join(",\n")}\n${pad}${close}`
	if (Array.isArray(v))
		return block(
			"[",
			"]",
			v.map((x) => formatJson(x, inner)),
		)
	if (isFeelRange(v) || isFeelContext(v)) {
		const entries = Object.entries(v) as [string, FeelValue][]
		return block(
			"{",
			"}",
			entries.map(([k, x]) => `${JSON.stringify(k)}: ${formatJson(x, inner)}`),
		)
	}
	// Strings, booleans, temporals and functions have no exact digits to keep.
	return (JSON.stringify(toJs(v), null, 2) ?? "null").replaceAll("\n", `\n${pad}`)
}

export function toJs(v: FeelValue): unknown {
	if (v === null || typeof v !== "object") return v
	if (isFeelNumber(v)) return v.toNumber()
	if (Array.isArray(v)) return v.map(toJs)
	if (isFeelRange(v)) return { ...v, start: toJs(v.start), end: toJs(v.end) }
	if (!isFeelContext(v)) return v
	const out: Record<string, unknown> = {}
	for (const [key, item] of Object.entries(v)) {
		Object.defineProperty(out, key, {
			value: toJs(item),
			enumerable: true,
			writable: true,
			configurable: true,
		})
	}
	return out
}
