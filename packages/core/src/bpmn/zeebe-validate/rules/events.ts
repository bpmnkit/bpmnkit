import type { XmlElement } from "../../../types/xml-element.js"
import type {
	BpmnAssociation,
	BpmnEventDefinition,
	BpmnFlowElement,
	BpmnTimerEventDefinition,
} from "../../bpmn-model.js"
import { isBpmnActivity } from "../../type-guards.js"
import {
	type NodeEntry,
	type ZeebeCheck,
	type ZeebeContext,
	feelError,
	feelFailure,
	isExpression,
	staticValueMessage,
} from "../context.js"

/**
 * Checks for zeebe-rules.md section D (events and timers): event definition
 * counts, event sub-process start events, timers (including the static values
 * Zeebe evaluates at deploy time), boundary and end event shape, execution
 * listener restrictions and conditional events.
 */

function eventDefinitions(node: BpmnFlowElement): BpmnEventDefinition[] {
	switch (node.type) {
		case "startEvent":
		case "endEvent":
		case "intermediateCatchEvent":
		case "intermediateThrowEvent":
		case "boundaryEvent":
			return node.eventDefinitions
		default:
			return []
	}
}

function isEventSubProcess(node: BpmnFlowElement): boolean {
	return (
		node.type === "eventSubProcess" ||
		(node.type === "subProcess" && node.triggeredByEvent === true)
	)
}

/** The flow elements of a container, empty for anything else. */
function children(node: BpmnFlowElement): BpmnFlowElement[] {
	return "flowElements" in node && Array.isArray(node.flowElements) ? node.flowElements : []
}

/** The flow elements Zeebe validates: those of executable processes, contents included. */
function nodes(ctx: ZeebeContext): NodeEntry[] {
	const executable = new Set(
		ctx.defs.processes.filter((p) => p.isExecutable === true).map((p) => p.id),
	)
	return ctx.nodes.filter((n) => executable.has(n.scope.processId))
}

/**
 * The `zeebe:executionListener` children of the single `zeebe:executionListeners`,
 * or `undefined` when there is none or more than one: Zeebe only applies the
 * per-element listener restrictions when exactly one is defined.
 */
function executionListeners(ctx: ZeebeContext, node: BpmnFlowElement): XmlElement[] | undefined {
	const lists = ctx.zeebe(node, "executionListeners")
	const [list] = lists
	if (lists.length !== 1 || list === undefined) return undefined
	return ctx.zeebeChildren(list, "executionListener")
}

function hasListener(listeners: XmlElement[], eventType: "start" | "end"): boolean {
	return listeners.some((l) => l.attributes.eventType === eventType)
}

/** Java's `Boolean.parseBoolean`. */
function javaBoolean(value: string): boolean {
	return value.toLowerCase() === "true"
}

/** Java's `String.trim()`: strips code points up to U+0020 only. */
function javaTrim(value: string): string {
	let start = 0
	let end = value.length
	while (start < end && value.charCodeAt(start) <= 32) start += 1
	while (end > start && value.charCodeAt(end - 1) <= 32) end -= 1
	return value.slice(start, end)
}

// ---------------------------------------------------------------------------
// java.time parsing, as Zeebe evaluates static timer values
// ---------------------------------------------------------------------------

/** A failed parse: the `DateTimeParseException` message, or its prefix when Java adds detail we don't reproduce. */
class TimeParseError extends Error {}

const INT_MAX = 2147483647
const INT_MIN = -2147483648

/** Java's `Integer.parseInt`, or `undefined` on `NumberFormatException`. */
function javaInt(text: string): number | undefined {
	if (!/^[+-]?[0-9]+$/.test(text)) return undefined
	const n = Number(text)
	return n >= INT_MIN && n <= INT_MAX ? n : undefined
}

const PERIOD =
	/^([-+]?)P(?:([-+]?[0-9]+)Y)?(?:([-+]?[0-9]+)M)?(?:([-+]?[0-9]+)W)?(?:([-+]?[0-9]+)D)?$/i

/** `java.time.Period.parse`. */
function parsePeriod(text: string): void {
	const m = PERIOD.exec(text)
	const fail = new TimeParseError("Text cannot be parsed to a Period")
	if (m === null) throw fail
	const groups = [m[2], m[3], m[4], m[5]]
	if (groups.every((g) => g === undefined)) throw fail
	const values = groups.map((g) => (g === undefined ? 0 : javaInt(g)))
	if (values.some((v) => v === undefined)) throw fail
	const days = (values[2] ?? 0) * 7 + (values[3] ?? 0)
	if (days < INT_MIN || days > INT_MAX) throw fail
}

const DURATION =
	/^([-+]?)P(?:([-+]?[0-9]+)D)?(T(?:([-+]?[0-9]+)H)?(?:([-+]?[0-9]+)M)?(?:([-+]?[0-9]+)(?:[.,]([0-9]{0,9}))?S)?)?$/i

/** `java.time.Duration.parse`; a number too large for a `long` overflows. */
function parseDuration(text: string): void {
	const m = DURATION.exec(text)
	if (m === null || m[3]?.toUpperCase() === "T")
		throw new TimeParseError("Text cannot be parsed to a Duration")
	if (m[2] === undefined && m[3] === undefined)
		throw new TimeParseError("Text cannot be parsed to a Duration")
	for (const g of [m[2], m[4], m[5], m[6]]) {
		if (g !== undefined && g.replace(/^[-+]/, "").replace(/^0+/, "").length > 18)
			throw new TimeParseError("Text cannot be parsed to a Duration")
	}
}

const ZONED =
	/^([-+]?[0-9]{4,10})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.[0-9]{0,9})?)?(Z|[-+][0-9]{2}(?::[0-9]{2}(?::[0-9]{2})?)?)(?:\[([^\]]+)\])?$/i

function leapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * `java.time.ZonedDateTime.parse` (ISO_ZONED_DATE_TIME, strict resolver). The
 * bracketed zone id is only checked for shape: which region ids exist depends on
 * the JVM's time-zone data.
 */
function parseZonedDateTime(text: string): void {
	const fail = new TimeParseError(`Text '${text}' could not be parsed`)
	const m = ZONED.exec(text)
	if (m === null) throw fail
	const yearText = m[1] ?? ""
	const digits = yearText.replace(/^[-+]/, "").length
	// SignStyle.EXCEEDS_PAD: more than four digits need a sign, and a plus only comes with them.
	if (digits > 4 && !/^[-+]/.test(yearText)) throw fail
	if (digits === 4 && yearText.startsWith("+")) throw fail
	const year = Number(yearText)
	const month = Number(m[2])
	const day = Number(m[3])
	if (Math.abs(year) > 999999999 || month < 1 || month > 12) throw fail
	const maxDay = month === 2 && leapYear(Math.abs(year)) ? 29 : (MONTH_DAYS[month - 1] ?? 31)
	if (day < 1 || day > maxDay) throw fail
	if (Number(m[4]) > 23 || Number(m[5]) > 59 || (m[6] !== undefined && Number(m[6]) > 59))
		throw fail
	const offset = m[7] ?? "Z"
	if (offset.toUpperCase() !== "Z") {
		const [h, min = "0", s = "0"] = offset.slice(1).split(":")
		const seconds = Number(h) * 3600 + Number(min) * 60 + Number(s)
		if (Number(min) > 59 || Number(s) > 59 || seconds > 18 * 3600) throw fail
	}
	const zone = m[8]
	if (zone !== undefined && !/^[A-Za-z0-9~/._+:-]+$/.test(zone)) throw fail
}

/** Zeebe's `Interval.parse`: `[<start>/]<period or duration>`. */
function parseInterval(text: string): void {
	const index = text.lastIndexOf("/")
	if (index > 0) parseZonedDateTime(text.slice(0, index))
	const exp = text.slice(index + 1)
	let sign = ""
	let startOffset = 0
	if (exp.startsWith("-")) {
		startOffset = 1
		sign = "-"
	} else if (exp.startsWith("+")) {
		startOffset = 1
	}
	// Case-sensitive 'T', unlike Period/Duration: a lower-case `pt5m` is read as a period.
	const durationOffset = exp.indexOf("T")
	if (durationOffset === -1) parsePeriod(exp)
	else if (durationOffset === startOffset + 1) parseDuration(exp)
	else {
		parsePeriod(exp.slice(0, durationOffset))
		parseDuration(`${sign}P${exp.slice(durationOffset)}`)
	}
}

/** Zeebe's `RepeatingInterval.parse`, for a text starting with `R`. */
function parseRepeatingInterval(text: string): void {
	const offset = text.indexOf("/")
	if (offset === -1) throw new TimeParseError("No interval given")
	if (offset === 1) {
		parseInterval(text.slice(2))
		return
	}
	if (javaInt(text.slice(1, offset)) === undefined)
		throw new TimeParseError("Cannot parse repetitions count")
	parseInterval(text.slice(offset + 1))
}

const CRON_NICKNAMES: readonly string[] = [
	"@yearly",
	"@annually",
	"@monthly",
	"@weekly",
	"@daily",
	"@midnight",
	"@hourly",
]
const CRON_RANGES: readonly (readonly [number, number])[] = [
	[0, 59],
	[0, 59],
	[0, 23],
	[1, 31],
	[1, 12],
	[0, 7],
]

/**
 * Zeebe's `CronTimer.parse` (cron-utils, Spring 5.3 definition). Only the
 * failures that are certain are reproduced: emptiness, nicknames, the field
 * count and plain numbers or numeric ranges out of the field's range; names,
 * `L`, `W`, `#` and steps are accepted as they are.
 */
function parseCron(text: string): void {
	const trimmed = javaTrim(text)
	if (trimmed === "") throw new TimeParseError("Empty expression!")
	// Nicknames match exactly (lower case, untrimmed); anything else starting with '@' is read as fields.
	if (CRON_NICKNAMES.includes(text)) return
	if (text === "@reboot") throw new TimeParseError("Nickname @reboot not supported!")
	const fields = trimmed.split(/\s+/)
	if (fields.length !== 6)
		throw new TimeParseError(
			`Cron expression contains ${fields.length} parts but we expect one of [6]`,
		)
	const fail = (detail: string) => new TimeParseError(`Failed to parse cron expression. ${detail}`)
	fields.forEach((field, i) => {
		const [lo, hi] = CRON_RANGES[i] ?? [0, 59]
		for (const part of field.split(",")) {
			// `?` is only for day-of-month and day-of-week.
			if (part === "?" && i !== 3 && i !== 5) throw fail("Invalid expression: ?")
			const m = /^(?:\*|([0-9]+)(?:-([0-9]+))?)(?:\/([0-9]+))?$/.exec(part)
			if (m === null) continue
			const values = [m[1], m[2]].filter((v) => v !== undefined).map(Number)
			for (const v of values) {
				if (v < lo || v > hi) throw fail(`Value ${v} not in range [${lo}, ${hi}]`)
			}
			const [from = 0, to = from] = values
			// Day-of-month, month and day-of-week ranges may wrap around; the time fields may not.
			if (i < 3 && from > to) throw fail(`Invalid range! [${from},${to}]`)
			const step = m[3] === undefined ? undefined : Number(m[3])
			if (step !== undefined && (step < 1 || step > hi))
				throw fail(`Period ${step} not in range [${lo}, ${hi}]`)
		}
	})
}

/** The result type of Zeebe's `StaticExpression` for a static text. */
function staticType(text: string): "NULL" | "BOOLEAN" | "NUMBER" | "STRING" {
	if (text === "null") return "NULL"
	if (text === "true" || text === "false") return "BOOLEAN"
	// java.math.BigDecimal's grammar.
	if (/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)([eE][+-]?[0-9]+)?$/.test(text)) return "NUMBER"
	return "STRING"
}

type TimerKind = "duration" | "cycle" | "date"

/**
 * The failure of evaluating a static timer value the way `TimerCatchEventExpressionValidator`
 * does, or `undefined` when it is valid. A message whose Java detail we can't
 * reproduce is cut to a prefix of Zeebe's.
 */
function staticTimerFailure(kind: TimerKind, text: string): string | undefined {
	const wrap = (detail: string) => `Invalid timer ${kind} expression (${detail})`
	const type = staticType(text)
	if (kind === "cycle") {
		if (type !== "STRING")
			return wrap(`Expected result of the expression '${text}' to be 'STRING', but was '${type}'.`)
		try {
			if (text.startsWith("R")) parseRepeatingInterval(text)
			else parseCron(text)
			return undefined
		} catch (e) {
			const message = (e as Error).message
			return message.startsWith("Text '")
				? `Invalid timer cycle expression (${message}`
				: wrap(message)
		}
	}
	const types = kind === "duration" ? "[DURATION, PERIOD, STRING]" : "[DATE_TIME, STRING]"
	if (type !== "STRING")
		return wrap(
			`Expected result of the expression '${text}' to be one of '${types}', but was '${type}'.`,
		)
	try {
		if (kind === "duration") parseInterval(text)
		else parseZonedDateTime(text)
		return undefined
	} catch {
		const label = kind === "duration" ? "duration" : "date-time"
		return wrap(`Invalid ${label} format '${text}' for expression '${text}'.`)
	}
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function interruptingTimerCycle(
	ctx: ZeebeContext,
	elementId: string,
	defs: BpmnEventDefinition[],
): void {
	if (defs.some((d) => d.type === "timer" && d.timeCycle !== undefined))
		ctx.report(
			"interrupting-timer-cycle",
			elementId,
			"Interrupting timer event with time cycle is not allowed.",
			"Use a time duration or date, or make the event non-interrupting.",
		)
}

/** Z37, Z39: start event definition count and start listeners. */
const startEvents: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type !== "startEvent") continue
		if (node.eventDefinitions.length > 1)
			ctx.report(
				"start-event-definitions",
				node.id,
				"Start event can't have more than one type",
				"Keep one event definition on the start event.",
			)
		const listeners = executionListeners(ctx, node)
		if (listeners !== undefined && hasListener(listeners, "start"))
			ctx.report(
				"start-event-start-listener",
				node.id,
				"Execution listeners of type 'start' are not supported by start events",
				"Use an 'end' execution listener on the start event.",
			)
	}
}

/** Z38: a start event form with public access, unsupported since public forms were removed. */
const publicAccessForm: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type !== "startEvent") continue
		const enabled = ctx
			.zeebe(node, "properties")
			.flatMap((p) => ctx.zeebeChildren(p, "property"))
			.some((p) => p.attributes.name === "publicAccess" && javaBoolean(p.attributes.value ?? ""))
		if (enabled)
			ctx.report(
				"start-form-public-access",
				node.id,
				"Start event forms with public access enabled are not supported. Please remove the 'publicAccess' property or set it to 'false'",
				"Remove the 'publicAccess' property from the start event.",
			)
	}
}

/**
 * Z40-Z43 for event sub-processes. Zeebe validates only the first start event,
 * and names the event sub-process.
 */
const eventSubProcessStarts: ZeebeCheck = (ctx) => {
	for (const { node, scope } of nodes(ctx)) {
		if (!isEventSubProcess(node)) continue
		const start = children(node).find((c) => c.type === "startEvent")
		if (start === undefined || start.type !== "startEvent") continue
		const defs = start.eventDefinitions
		const typed =
			"Start events in event subprocesses must be one of: message, timer, error, signal, escalation or conditional"
		const suggestion =
			"Give the event sub-process start event a message, timer, error, signal, escalation or conditional trigger."
		if (defs.length === 0) ctx.report("event-sub-process-start-typed", node.id, typed, suggestion)
		if (defs.some((d) => d.type === "compensate") && scope.kind === "process")
			ctx.report(
				"compensation-event-sub-process-level",
				node.id,
				"A compensation event subprocess is not allowed on the process level",
				"Move the compensation event sub-process into a sub-process.",
			)
		// A typed but unsupported trigger is Z17 (event-sub-process-start-type, structure.ts).
		const interrupting = start.isInterrupting !== false
		if (interrupting) interruptingTimerCycle(ctx, node.id, defs)
		if (interrupting && scope.kind === "adHocSubProcess")
			ctx.report(
				"interrupting-event-sub-process-in-ad-hoc",
				node.id,
				"An interrupting event subprocess is not allowed inside an ad-hoc subprocess",
				"Make the event sub-process non-interrupting.",
			)
	}
}

/** Z43 for boundary events: `cancelActivity` defaults to true. */
const boundaryTimerCycle: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type === "boundaryEvent" && node.cancelActivity !== false)
			interruptingTimerCycle(ctx, node.id, node.eventDefinitions)
	}
}

function timerDefs(node: BpmnFlowElement): BpmnTimerEventDefinition[] {
	return eventDefinitions(node).filter((d): d is BpmnTimerEventDefinition => d.type === "timer")
}

/** Z44: exactly one of timeDuration / timeDate / timeCycle, on any timer definition. */
const timerOneValue: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		for (const def of timerDefs(node)) {
			const count = [def.timeDate, def.timeDuration, def.timeCycle].filter(
				(v) => v !== undefined,
			).length
			if (count !== 1)
				ctx.report(
					"timer-one-value",
					node.id,
					"Must be exactly one type of timer: timeDuration, timeDate or timeCycle",
					"Give the timer exactly one of time duration, time date or time cycle.",
				)
		}
	}
}

/** Z45, Z57: an intermediate catch event has one definition; a timer one needs a duration or date. */
const intermediateCatch: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type !== "intermediateCatchEvent") continue
		const [def] = node.eventDefinitions
		if (node.eventDefinitions.length !== 1 || def === undefined) {
			ctx.report(
				"intermediate-catch-definitions",
				node.id,
				"Must have exactly one event definition",
				"Give the intermediate catch event exactly one event definition.",
			)
		} else if (
			def.type === "timer" &&
			def.timeDuration === undefined &&
			def.timeDate === undefined
		) {
			ctx.report(
				"intermediate-timer-value",
				node.id,
				"Intermediate timer catch event must have either a time duration or a time date.",
				"Use a time duration or time date on the intermediate timer.",
			)
		}
	}
}

function isCatchEvent(node: BpmnFlowElement): boolean {
	return (
		node.type === "startEvent" ||
		node.type === "intermediateCatchEvent" ||
		node.type === "boundaryEvent"
	)
}

/**
 * Z46: every timer value must parse as FEEL; on catch events Zeebe also
 * evaluates the static value (duration, then cycle, then date, whichever comes
 * first). Process start events evaluate FEEL too, without variables; that needs
 * a FEEL engine identical to Zeebe's, so only static values are evaluated here.
 */
const timerExpression: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		for (const def of timerDefs(node)) {
			for (const text of [def.timeDate, def.timeDuration, def.timeCycle]) {
				if (text !== undefined && feelError(text) !== undefined)
					ctx.report(
						"timer-expression",
						node.id,
						feelFailure(text),
						"Fix the FEEL syntax of the timer expression.",
					)
			}
			if (!isCatchEvent(node)) continue
			const [kind, text]: [TimerKind, string | undefined] =
				def.timeDuration !== undefined
					? ["duration", def.timeDuration]
					: def.timeCycle !== undefined
						? ["cycle", def.timeCycle]
						: ["date", def.timeDate]
			if (text === undefined || isExpression(text)) continue
			const failure = staticTimerFailure(kind, text)
			if (failure !== undefined)
				ctx.report(
					"timer-expression",
					node.id,
					failure,
					kind === "duration"
						? "Use an ISO-8601 duration such as PT5M, or a FEEL expression starting with '='."
						: kind === "date"
							? "Use an ISO-8601 date-time with offset such as 2030-01-01T09:00:00Z, or a FEEL expression."
							: "Use an ISO-8601 repeating interval such as R3/PT10M or a 6-field cron expression.",
				)
		}
	}
}

/** Every association of the model, as Zeebe's `getModelElementsByType(Association)` sees them. */
function associations(ctx: ZeebeContext): BpmnAssociation[] {
	const out: BpmnAssociation[] = []
	for (const c of ctx.defs.collaborations) out.push(...(c.associations ?? []))
	for (const p of ctx.defs.processes) out.push(...p.associations)
	for (const { node } of ctx.nodes) {
		if ("associations" in node && Array.isArray(node.associations)) out.push(...node.associations)
	}
	return out
}

/** Z48-Z52: boundary event attachment, flows, definition count and listeners. */
const boundaryEvents: ZeebeCheck = (ctx) => {
	let all: BpmnAssociation[] | undefined
	for (const { node } of nodes(ctx)) {
		if (node.type !== "boundaryEvent") continue
		const host = ctx.node(node.attachedToRef)?.node
		// A reference to a non-activity fails Zeebe's parse with a ClassCastException; it is just as undeployable.
		if (host === undefined || !isBpmnActivity(host))
			ctx.report(
				"boundary-attached",
				node.id,
				"Must be attached to an activity",
				"Attach the boundary event to an activity.",
			)
		if (ctx.incoming(node.id).length > 0)
			ctx.report(
				"boundary-incoming",
				node.id,
				"Cannot have incoming sequence flows",
				"Remove the sequence flows into the boundary event.",
			)
		const defs = node.eventDefinitions
		if (defs.some((d) => d.type === "compensate")) {
			all ??= associations(ctx)
			const associated = all.some((a) => a.sourceRef === node.id)
			if (ctx.outgoing(node.id).length > 0 || !associated)
				ctx.report(
					"compensation-boundary-shape",
					node.id,
					"Compensation boundary events must have a compensation association and no outgoing sequence flows",
					"Connect the compensation boundary event to its handler with an association, not a sequence flow.",
				)
		}
		if (defs.length !== 1)
			ctx.report(
				"boundary-event-definitions",
				node.id,
				"Must have exactly one event definition",
				"Give the boundary event exactly one event definition.",
			)
		const listeners = executionListeners(ctx, node)
		const [first] = defs
		if (listeners === undefined || first === undefined) continue
		if (first.type === "compensate")
			ctx.report(
				"boundary-listeners",
				node.id,
				"Execution listeners of type 'start' and 'end' are not supported by [compensation] boundary events",
				"Remove the execution listeners from the compensation boundary event.",
			)
		else if (hasListener(listeners, "start"))
			ctx.report(
				"boundary-listeners",
				node.id,
				"Execution listeners of type 'start' are not supported by boundary events",
				"Use an 'end' execution listener on the boundary event.",
			)
	}
}

/** Z53-Z56: end event flows, definition count, waitForCompletion and error end listeners. */
const endEvents: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type === "intermediateThrowEvent") {
			const compensations = node.eventDefinitions.filter((d) => d.type === "compensate")
			const wait =
				compensations.length === 1
					? compensations[0]?.unknownAttributes?.waitForCompletion
					: undefined
			if (wait !== undefined && !javaBoolean(wait))
				ctx.report(
					"compensation-wait-for-completion",
					node.id,
					"A compensation intermediate throwing event waitForCompletion attribute must be true or not present",
					"Remove waitForCompletion or set it to true.",
				)
			continue
		}
		if (node.type !== "endEvent") continue
		if (ctx.outgoing(node.id).length > 0)
			ctx.report(
				"end-event-outgoing",
				node.id,
				"End events must not have outgoing sequence flows to other elements.",
				"Remove the outgoing sequence flows of the end event.",
			)
		const defs = node.eventDefinitions
		if (defs.length > 1)
			ctx.report(
				"end-event-definitions",
				node.id,
				"Must have at most one event definition",
				"Keep at most one event definition on the end event.",
			)
		for (const def of defs) {
			const wait = def.type === "compensate" ? def.unknownAttributes?.waitForCompletion : undefined
			if (wait !== undefined && !javaBoolean(wait))
				ctx.report(
					"compensation-wait-for-completion",
					node.id,
					"A compensation end event waitForCompletion attribute must be true or not present",
					"Remove waitForCompletion or set it to true.",
				)
		}
		const listeners = executionListeners(ctx, node)
		if (listeners !== undefined && defs[0]?.type === "error" && hasListener(listeners, "end"))
			ctx.report(
				"error-end-end-listener",
				node.id,
				"Execution listeners of type 'end' are not supported by [error] end events",
				"Use a 'start' execution listener on the error end event.",
			)
	}
}

/** Z58: a conditional event's condition must be a FEEL expression that parses. */
const conditionalCondition: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		for (const def of eventDefinitions(node)) {
			if (def.type !== "conditional" || def.condition === undefined) continue
			const text = def.condition
			if (!isExpression(text))
				ctx.report(
					"conditional-condition",
					node.id,
					staticValueMessage(text),
					"Write the condition as a FEEL expression starting with '='.",
				)
			else if (feelError(text) !== undefined)
				ctx.report(
					"conditional-condition",
					node.id,
					feelFailure(text),
					"Fix the FEEL syntax of the condition.",
				)
		}
	}
}

/** Z59: `zeebe:conditionalFilter` variableEvents, wherever the filter is. */
const conditionalFilter: ZeebeCheck = (ctx) => {
	const check = (entry: NodeEntry, filters: XmlElement[]) => {
		for (const filter of filters) {
			const events = filter.attributes.variableEvents
			if (events === undefined || javaTrim(events) === "") continue
			for (const raw of events.split(",")) {
				const event = javaTrim(raw)
				if (event !== "" && event !== "create" && event !== "update")
					ctx.report(
						"conditional-filter-events",
						entry.node.id,
						`Variable event '${event}' is not valid. Must be one of: create, update or a comma-separated list of both.`,
						"Use 'create', 'update' or 'create,update' as variable events.",
					)
			}
		}
	}
	for (const entry of nodes(ctx)) {
		check(entry, ctx.zeebe(entry.node, "conditionalFilter"))
		for (const def of eventDefinitions(entry.node)) {
			if (def.type === "conditional") check(entry, ctx.zeebe(def, "conditionalFilter"))
		}
	}
}

/** Z60: the conditional catch events after an event-based gateway need distinct conditions. */
const eventBasedGatewayConditions: ZeebeCheck = (ctx) => {
	for (const { node } of nodes(ctx)) {
		if (node.type !== "eventBasedGateway") continue
		const conditions: string[] = []
		for (const { flow } of ctx.outgoing(node.id)) {
			const target = ctx.node(flow.targetRef)?.node
			if (target?.type !== "intermediateCatchEvent") continue
			for (const def of target.eventDefinitions) {
				if (def.type === "conditional" && def.condition !== undefined && def.condition !== "")
					conditions.push(javaTrim(def.condition))
			}
		}
		const reported: string[] = []
		conditions.forEach((c, i) => {
			if (conditions.indexOf(c) !== i && !reported.includes(c)) {
				reported.push(c)
				ctx.report(
					"event-based-gateway-duplicate-condition",
					node.id,
					`Multiple conditional event definitions with the same condition expression '${c}' are not allowed.`,
					"Give each conditional event after the gateway a different condition.",
				)
			}
		})
	}
}

/** Checks for zeebe-rules.md section D, in spec order (see index.ts). */
export const checks: ZeebeCheck[] = [
	startEvents,
	publicAccessForm,
	eventSubProcessStarts,
	boundaryTimerCycle,
	timerOneValue,
	intermediateCatch,
	timerExpression,
	boundaryEvents,
	endEvents,
	conditionalCondition,
	conditionalFilter,
	eventBasedGatewayConditions,
]
