import { type CompactElement, parseProcessText } from "@bpmnkit/core"

/**
 * The check after a draft: what the request names that the draft has no
 * element for. glm-4.7-flash follows the guide's rules unevenly — a timeout
 * becomes an xor, a DMN decision a plain gateway — and examples it copies into
 * processes that never asked for them. Checking in code costs nothing on a
 * draft that is complete; one that is not gets a single change request
 * naming exactly what is missing.
 */

/** Something the request asks for that the draft does not have. */
export interface DraftGap {
	kind: "dmn" | "deadline" | "failure" | "rest" | "parallel" | "each" | "user" | "message" | "feel"
	/** One line of the change request that adds it. */
	change: string
}

interface Rule {
	kind: DraftGap["kind"]
	/** What in the request asks for it. */
	asks: RegExp
	/** Whether the draft already has it. */
	has: (elements: readonly CompactElement[]) => boolean
	change: (request: string, elements: readonly CompactElement[]) => string
}

const DURATION =
	/\b(?:within|after|in|for)\s+(\d+)\s*(seconds?|minutes?|mins?|hours?|days?|weeks?)\b/i

const hasType = (type: CompactElement["type"]) => (elements: readonly CompactElement[]) =>
	elements.some((e) => e.type === type)

const errorBoundary = (elements: readonly CompactElement[]) =>
	elements.some((e) => e.type === "boundaryEvent" && e.eventType === "error")

/** A step's name that says it only works on data the process already has. */
const COMPUTES =
	/^(?:calculate|count|compute|sum|total|average|filter|sort|format|convert|transform|aggregate|merge|extract|parse|round|concatenate|determine|derive)\b/i

/** Words that make a step a call to another system rather than a computation. */
const CALLS = /\b(?:api|http|rest|endpoint|service|system|via)\b/i

/** Steps named for a computation that are not a script task evaluating FEEL. */
const unscripted = (elements: readonly CompactElement[]) =>
	elements.filter(
		(e) =>
			(e.type === "task" || e.type === "scriptTask" || e.type === "serviceTask") &&
			e.script === undefined &&
			COMPUTES.test(e.name ?? "") &&
			!CALLS.test(e.name ?? ""),
	)

const RULES: readonly Rule[] = [
	{
		kind: "dmn",
		asks: /\b(?:dmn|decision tables?|business rules?)\b/i,
		has: hasType("businessRuleTask"),
		change: () =>
			"Make the decision a DMN decision: a rule task, with an xor after it that branches on its result.",
	},
	{
		kind: "deadline",
		asks: new RegExp(`${DURATION.source}|\\btime(?:s|d)?[ -]?out\\b|\\bdeadline\\b`, "i"),
		has: (elements) =>
			elements.some((e) => e.eventType === "timer" && e.type !== "startEvent") ||
			elements.some((e) => e.type === "eventBasedGateway"),
		change: (request) => {
			const m = DURATION.exec(request)
			const after = m ? ` after=${m[1]}${m[2]?.[0]?.toLowerCase()}` : ""
			return `Add the time limit as a boundary:timer with on=<the task that may take too long>${after}, leading to what the description says happens then.`
		},
	},
	{
		kind: "failure",
		asks: /\bif (?:the |it |that |this |a |an )?(?:[\w-]+ ){0,3}fails?\b/i,
		has: errorBoundary,
		change: () =>
			"Handle the failure the description names with a boundary:error on the task that may fail, leading to what happens then.",
	},
	{
		kind: "rest",
		asks: /\b(?:rest|http)\b|\bexternal api\b/i,
		has: errorBoundary,
		change: () => "Give the REST call a boundary:error leading to a task that handles the failure.",
	},
	{
		kind: "parallel",
		asks: /\b(?:at the same time|in parallel|simultaneously|concurrently)\b/i,
		has: hasType("parallelGateway"),
		change: () =>
			"Run the steps the description does at the same time as branches of an and split, joined by an and node before what follows.",
	},
	{
		kind: "each",
		// "For each new support ticket" is each process instance, not a list
		asks: /\b(?:each|every) \w+ (?:in|of|on|from) (?:a|the) (?:list|set|collection)\b|\beach of the \w+s\b/i,
		has: (elements) => elements.some((e) => e.multiInstance !== undefined),
		change: () =>
			"The step done for every item of the list runs once per item: give it each=<list variable>.",
	},
	{
		kind: "user",
		asks: /\buser tasks?\b|\breview(?:ed)? by\b|\bfor review\b|\bmanual(?:ly)?\b/i,
		has: hasType("userTask"),
		change: () => "The work a person does is a user task: give it the user kind.",
	},
	{
		kind: "message",
		asks: /\bwait (?:for|until) (?:a |an |the )?["“]?[\w-]+["”]? message\b/i,
		has: (elements) =>
			elements.some(
				(e) =>
					e.type === "receiveTask" ||
					((e.type === "intermediateCatchEvent" || e.type === "boundaryEvent") &&
						e.eventType === "message"),
			),
		change: () => "Wait for the message with a catch:message event before the step that needs it.",
	},
	{
		kind: "feel",
		asks: /\b(?:calculat|count|comput|sum|total|averag|filter|sort|format|convert|transform|aggregat|merg|extract|pars|round|concatenat|determin|deriv)\w*/i,
		has: (elements) => unscripted(elements).length === 0,
		change: (_request, elements) =>
			`Make ${unscripted(elements)
				.map((e) => `"${e.name}"`)
				.join(
					", ",
				)} a script task that computes a FEEL expression from the process data: id[script Name | result=<variable> feel=<FEEL expression>].`,
	},
]

/** What `request` asks for that the line-format draft `text` has no element for. */
export function draftGaps(request: string, text: string): DraftGap[] {
	const elements = parseProcessText(text).diagram.processes[0]?.elements ?? []
	const gaps = RULES.filter((rule) => rule.asks.test(request) && !rule.has(elements))
	// One error boundary answers both a failure the request names and a REST call
	const kinds = new Set(gaps.map((g) => g.kind))
	return gaps
		.filter((rule) => !(rule.kind === "rest" && kinds.has("failure")))
		.map((rule) => ({ kind: rule.kind, change: rule.change(request, elements) }))
}

/** The one change request that fills `gaps`, or `undefined` when there are none. */
export function gapChange(gaps: readonly DraftGap[]): string | undefined {
	if (gaps.length === 0) return undefined
	return `The diagram misses what the description asks for:\n${gaps.map((g) => `- ${g.change}`).join("\n")}\nAdd it and keep everything else.`
}

/**
 * Whether a completed draft is the better one: it fills a gap the first left,
 * opens none, and keeps the first's elements. A model asked to add a timer
 * sometimes rewrites the process instead; the first draft then stands.
 */
export function completes(request: string, before: string, after: string): boolean {
	const was = draftGaps(request, before).length
	const is = draftGaps(request, after).length
	const count = (text: string) => parseProcessText(text).diagram.processes[0]?.elements.length ?? 0
	return is < was && count(after) >= count(before)
}
