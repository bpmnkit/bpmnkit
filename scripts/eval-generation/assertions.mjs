/**
 * Assertions on what a generated diagram says, shared by the eval harness
 * (run-eval.mjs) and the drop benchmark (apps/drop/scripts/bench-generate.mjs)
 * so both read an expected.json the same way. Each takes a parsed
 * `BpmnDefinitions` and returns the failures as short strings.
 *
 *   mustContainElementIds    every id is an element of the diagram (tools inside a sub-process too)
 *   mustContainFormIds       every form id is the `zeebe:formDefinition` of some element
 *   mustContainInputTargets  every name is the target of some `zeebe:input`
 *   mustContainFlowNames     every name is the label of some sequence flow
 *   mustContainAnnotations   a number (at least that many text annotations) or a list of texts
 *                            (each must appear in one annotation)
 *   mustBeReady              `readiness()` says "ready", i.e. no engine-category lint error and
 *                            nothing left to configure
 *
 * expected.json may also carry `knownPlanGaps`: the assertion misses a
 * `fixture.plan.json` is known to have because the plan format cannot say the
 * thing (a start-event form, an input mapping, an annotation, a loop back, ...).
 * Each entry is `{ "assertion": "<key>", "value": <the value that misses> }`,
 * e.g. `{ "assertion": "mustContainFormIds", "value": "my-form" }`; for
 * `mustContainAnnotations` given as a number the value is that number. Only the
 * plan-level eval reads it: a listed miss is reported as a known gap, an unlisted
 * miss fails the run, and a listed gap that no longer misses is reported as stale.
 */

/** Every flow element, the ones inside sub-processes included. */
function walk(elements) {
	return elements.flatMap((el) => (el.flowElements ? [el, ...walk(el.flowElements)] : [el]))
}

/** Every process's sequence flows, those of nested sub-processes included. */
function flowsOf(containers) {
	return containers.flatMap((c) => [
		...(c.sequenceFlows ?? []),
		...flowsOf((c.flowElements ?? []).filter((e) => e.flowElements)),
	])
}

export const SPEC_ASSERTION_KEYS = [
	"mustContainElementIds",
	"mustContainFormIds",
	"mustContainInputTargets",
	"mustContainFlowNames",
	"mustContainAnnotations",
	"mustBeReady",
]

export const hasSpecAssertions = (assertions) =>
	SPEC_ASSERTION_KEYS.some((key) => assertions[key] !== undefined)

/**
 * @param defs a parsed `BpmnDefinitions`
 * @param assertions an expected.json `assertions` object; keys this does not know are ignored
 * @param readiness `readiness()` from apps/drop/src/lib/readiness.ts; only needed for `mustBeReady`
 * @returns the failed assertions, empty when all hold
 */
export function scoreSpecAssertions(defs, assertions, readiness) {
	return specFailures(defs, assertions, readiness).map((f) => f.message)
}

/**
 * Like scoreSpecAssertions, but each failure names the assertion key and the
 * value that missed (`{ assertion: "mustContainFormIds", value: "my-form",
 * message }`), so expected.json's `knownPlanGaps` can match it exactly.
 */
export function specFailures(defs, assertions, readiness) {
	const failed = []
	const fail = (assertion, value, message) => failed.push({ assertion, value, message })
	const elements = defs.processes.flatMap((p) => walk(p.flowElements))
	const extensions = elements.flatMap((e) => e.extensionElements ?? [])

	const ids = new Set(elements.map((e) => e.id))
	for (const id of assertions.mustContainElementIds ?? []) {
		if (!ids.has(id)) fail("mustContainElementIds", id, `no element ${id}`)
	}

	const formIds = new Set(
		extensions.filter((x) => x.name === "zeebe:formDefinition").map((x) => x.attributes.formId),
	)
	for (const id of assertions.mustContainFormIds ?? []) {
		if (!formIds.has(id)) fail("mustContainFormIds", id, `no form ${id}`)
	}

	const targets = new Set(
		extensions
			.filter((x) => x.name === "zeebe:ioMapping")
			.flatMap((x) => x.children ?? [])
			.filter((c) => c.name === "zeebe:input")
			.map((c) => c.attributes.target),
	)
	for (const target of assertions.mustContainInputTargets ?? []) {
		if (!targets.has(target)) fail("mustContainInputTargets", target, `no input target ${target}`)
	}

	const flowNames = new Set(flowsOf(defs.processes).map((f) => f.name))
	for (const name of assertions.mustContainFlowNames ?? []) {
		if (!flowNames.has(name)) fail("mustContainFlowNames", name, `no flow named ${name}`)
	}

	const notes = defs.processes.flatMap((p) => p.textAnnotations ?? [])
	const wanted = assertions.mustContainAnnotations
	if (typeof wanted === "number") {
		if (notes.length < wanted)
			fail("mustContainAnnotations", wanted, `${notes.length} < ${wanted} annotations`)
	} else {
		for (const text of wanted ?? []) {
			if (!notes.some((n) => (n.text ?? "").includes(text)))
				fail("mustContainAnnotations", text, `no annotation "${text}"`)
		}
	}

	if (assertions.mustBeReady) {
		if (!readiness) throw new Error("mustBeReady needs readiness()")
		const verdict = readiness(defs)
		if (verdict.state === "invalid") {
			fail("mustBeReady", true, `not ready: ${verdict.errors.length} deploy errors`)
		} else if (verdict.state === "shape-only") {
			fail("mustBeReady", true, `not ready: ${verdict.missing.length} steps need configuration`)
		}
	}
	return failed
}

/**
 * Splits failures into the ones expected.json lists in `knownPlanGaps` and the
 * rest, and names the listed gaps that did not fail (stale: prune them).
 */
export function splitKnownGaps(failures, knownPlanGaps = []) {
	const same = (f, g) =>
		f.assertion === g.assertion && JSON.stringify(f.value) === JSON.stringify(g.value)
	return {
		known: failures.filter((f) => knownPlanGaps.some((g) => same(f, g))),
		unexpected: failures.filter((f) => !knownPlanGaps.some((g) => same(f, g))),
		stale: knownPlanGaps.filter((g) => !failures.some((f) => same(f, g))),
	}
}

/**
 * Everything a golden prompt's `assertions` can say about a parsed diagram:
 * the drop benchmark's scoring, in one place so it can be tested.
 * `readiness` is only needed for `mustBeReady`.
 */
export function scoreGolden(defs, assertions, readiness) {
	const elements = defs.processes.flatMap((p) => p.flowElements)
	const types = new Set(elements.map((e) => e.type))
	const jobTypes = new Set(
		elements.flatMap((e) =>
			e.extensionElements
				.filter((x) => x.name === "zeebe:taskDefinition" && x.attributes.type)
				.map((x) => x.attributes.type),
		),
	)
	const failed = []
	if (assertions.minElements !== undefined && elements.length < assertions.minElements) {
		failed.push(`${elements.length} < ${assertions.minElements} elements`)
	}
	for (const type of assertions.mustContainElementTypes ?? []) {
		if (!types.has(type)) failed.push(`no ${type}`)
	}
	for (const alternatives of assertions.mustContainAnyOf ?? []) {
		if (!alternatives.some((type) => types.has(type)))
			failed.push(`no ${alternatives.join(" or ")}`)
	}
	// A step that runs once per item of a list: a multi-instance task or sub-process
	if (assertions.mustContainMultiInstance && !elements.some((e) => e.loopCharacteristics)) {
		failed.push("no multi-instance step")
	}
	// An entry may list alternatives: any one of its job types meets it
	for (const entry of assertions.mustContainTaskTypes ?? []) {
		const any = Array.isArray(entry) ? entry : [entry]
		if (!any.some((t) => jobTypes.has(t))) failed.push(`no task type ${any.join(" or ")}`)
	}
	// A REST call's URL, literal or FEEL: each expected part must be in one of them
	const urls = elements.flatMap((e) =>
		e.extensionElements
			.filter((x) => x.name === "zeebe:ioMapping")
			.flatMap((x) => x.children)
			.filter((c) => c.name === "zeebe:input" && c.attributes.target === "url")
			.map((c) => c.attributes.source ?? ""),
	)
	for (const part of assertions.mustCallUrls ?? []) {
		if (!urls.some((url) => url.includes(part))) failed.push(`no call to ${part}`)
	}
	// What the diagram says: ids, forms, mappings, flow labels, annotations, readiness
	failed.push(...scoreSpecAssertions(defs, assertions, readiness))
	return { elements: elements.length, failed }
}
