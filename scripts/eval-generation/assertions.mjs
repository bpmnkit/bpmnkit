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
	const failed = []
	const elements = defs.processes.flatMap((p) => walk(p.flowElements))
	const extensions = elements.flatMap((e) => e.extensionElements ?? [])

	const ids = new Set(elements.map((e) => e.id))
	for (const id of assertions.mustContainElementIds ?? []) {
		if (!ids.has(id)) failed.push(`no element ${id}`)
	}

	const formIds = new Set(
		extensions.filter((x) => x.name === "zeebe:formDefinition").map((x) => x.attributes.formId),
	)
	for (const id of assertions.mustContainFormIds ?? []) {
		if (!formIds.has(id)) failed.push(`no form ${id}`)
	}

	const targets = new Set(
		extensions
			.filter((x) => x.name === "zeebe:ioMapping")
			.flatMap((x) => x.children ?? [])
			.filter((c) => c.name === "zeebe:input")
			.map((c) => c.attributes.target),
	)
	for (const target of assertions.mustContainInputTargets ?? []) {
		if (!targets.has(target)) failed.push(`no input target ${target}`)
	}

	const flowNames = new Set(flowsOf(defs.processes).map((f) => f.name))
	for (const name of assertions.mustContainFlowNames ?? []) {
		if (!flowNames.has(name)) failed.push(`no flow named ${name}`)
	}

	const notes = defs.processes.flatMap((p) => p.textAnnotations ?? [])
	const wanted = assertions.mustContainAnnotations
	if (typeof wanted === "number") {
		if (notes.length < wanted) failed.push(`${notes.length} < ${wanted} annotations`)
	} else {
		for (const text of wanted ?? []) {
			if (!notes.some((n) => (n.text ?? "").includes(text))) failed.push(`no annotation "${text}"`)
		}
	}

	if (assertions.mustBeReady) {
		if (!readiness) throw new Error("mustBeReady needs readiness()")
		const verdict = readiness(defs)
		if (verdict.state === "invalid") {
			failed.push(`not ready: ${verdict.errors.length} deploy errors`)
		} else if (verdict.state === "shape-only") {
			failed.push(`not ready: ${verdict.missing.length} steps need configuration`)
		}
	}
	return failed
}
