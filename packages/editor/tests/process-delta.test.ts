import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import {
	Bpmn,
	type BpmnBounds,
	type BpmnDefinitions,
	expand,
	parseProcessDelta,
	parseProcessText,
	writeProcessText,
} from "@bpmnkit/core"
import { applyConnectorLines } from "@bpmnkit/core/connectors"
import { describe, expect, it } from "vitest"
import { createIdFactory } from "../src/id.js"
import { applyProcessDelta } from "../src/process-delta.js"

const ROUNDTRIP = join(__dirname, "..", "..", "core", "tests", "fixtures", "roundtrip")

/** A loan process, laid out — standing in for one a person drew and shared. */
const LOAN = `# Loan
start[start Application received] > check[xor Amount over 10k?]
check >(Yes: amount > 10000) review[user Review application] > pay[service Pay out | job=payout] > done[end Paid]
check >(No: default) auto[service Approve automatically | job=approve] > pay`

function drawn(text: string): BpmnDefinitions {
	return Bpmn.parse(Bpmn.export(expand(parseProcessText(text).diagram)))
}

function fixture(file: string): BpmnDefinitions {
	return Bpmn.parse(readFileSync(join(ROUNDTRIP, file), "utf8"))
}

/** Applies `script` to `defs` as a model would: against the text `writeProcessText` gave it. */
function apply(defs: BpmnDefinitions, script: string) {
	const { aliases } = writeProcessText(defs)
	return applyProcessDelta(defs, parseProcessDelta(script), {
		aliases,
		ids: createIdFactory("test"),
	})
}

function boundsOf(defs: BpmnDefinitions, id: string): BpmnBounds {
	const shape = defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)
	if (!shape) throw new Error(`no shape for ${id}`)
	return shape.bounds
}

function element(defs: BpmnDefinitions, id: string) {
	return defs.processes[0]?.flowElements.find((el) => el.id === id)
}

function flowsOf(defs: BpmnDefinitions) {
	return (defs.processes[0]?.sequenceFlows ?? []).map((f) => `${f.sourceRef}>${f.targetRef}`).sort()
}

/** Whether every node of the first process is drawn on the first diagram: what an editable drop has. */
function drawnInFull(defs: BpmnDefinitions): boolean {
	const shapes = new Set(defs.diagrams[0]?.plane.shapes.map((s) => s.bpmnElement))
	return (
		defs.processes[0]?.flowElements.every((el) => el.type === "dataObject" || shapes.has(el.id)) ??
		false
	)
}

function duplicateIds(defs: BpmnDefinitions): string[] {
	const ids: string[] = JSON.stringify(defs).match(/"id":"[^"]+"/g) ?? []
	return [...new Set(ids.filter((id, k) => ids.indexOf(id) !== k))]
}

/**
 * What the Drop room checks before it stores a document, and that it exports
 * and parses back. Duplicate ids are compared with `before`: some test files
 * already have one, and a change must only not add another.
 */
function expectSound(defs: BpmnDefinitions, before?: BpmnDefinitions): void {
	const process = defs.processes[0]
	const plane = defs.diagrams[0]?.plane
	const nodes = new Set(process?.flowElements.map((el) => el.id))
	const flows = new Set(process?.sequenceFlows.map((f) => f.id))
	// A data object is drawn through its references, never itself.
	const drawable = (process?.flowElements ?? []).filter((el) => el.type !== "dataObject")
	for (const { id } of drawable) {
		expect(
			plane?.shapes.some((s) => s.bpmnElement === id),
			id,
		).toBe(true)
	}
	for (const id of flows)
		expect(
			plane?.edges.some((e) => e.bpmnElement === id),
			id,
		).toBe(true)
	for (const f of process?.sequenceFlows ?? []) {
		expect(nodes.has(f.sourceRef), f.id).toBe(true)
		expect(nodes.has(f.targetRef), f.id).toBe(true)
	}
	for (const el of process?.flowElements ?? []) {
		if ("default" in el && el.default !== undefined) expect(flows.has(el.default)).toBe(true)
		if (el.type === "boundaryEvent") expect(nodes.has(el.attachedToRef)).toBe(true)
	}
	for (const lane of process?.laneSet?.lanes ?? []) {
		for (const ref of lane.flowNodeRefs) expect(nodes.has(ref), ref).toBe(true)
	}
	expect(duplicateIds(defs)).toEqual(before ? duplicateIds(before) : [])
	expect(() => Bpmn.parse(Bpmn.export(defs))).not.toThrow()
}

function overlap(a: BpmnBounds, b: BpmnBounds): boolean {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

describe("applyProcessDelta", () => {
	it("changes nothing when the script restates the diagram it was given", () => {
		const defs = drawn(LOAN)
		const result = apply(defs, writeProcessText(defs).text)
		expect(result.problems).toEqual([])
		expect(result.fixes).toEqual([])
		expect([result.created, result.changed, result.removed]).toEqual([[], [], []])
		expect(result.definitions).toEqual(defs)
	})

	it("never mutates its input", () => {
		const defs = drawn(LOAN)
		const before = structuredClone(defs)
		apply(defs, "review > second[user Second approval] > pay\n- auto")
		expect(defs).toEqual(before)
	})

	it("renames and retypes in place, and leaves every other shape where it was", () => {
		const defs = drawn(LOAN)
		const result = apply(defs, "review[Assess application]\nauto[user Approve by hand]")
		expect(result.problems).toEqual([])
		expect(result.changed.sort()).toEqual(["auto", "review"])
		const next = result.definitions
		expect(element(next, "review")).toMatchObject({ type: "userTask", name: "Assess application" })
		expect(element(next, "auto")).toMatchObject({ type: "userTask", name: "Approve by hand" })
		for (const id of ["start", "check", "pay", "done", "review", "auto"]) {
			expect(boundsOf(next, id)).toEqual(boundsOf(defs, id))
		}
		expectSound(next)
	})

	it("adds a script task that computes FEEL, and changes an existing one's expression", () => {
		const defs = drawn(LOAN)
		const added = apply(
			defs,
			"pay > fee[task Compute fee | result=fee feel=amount * 0.01] > done",
		).definitions
		const script = (id: string, d: BpmnDefinitions) =>
			element(d, id)?.extensionElements.find((e) => e.name === "zeebe:script")?.attributes
		expect(element(added, "fee")?.type).toBe("scriptTask")
		expect(script("fee", added)).toEqual({ expression: "= amount * 0.01", resultVariable: "fee" })
		// The writer gives it back to the model as it is, and a change to it lands
		expect(writeProcessText(added).text).toContain(
			"fee[script Compute fee | result=fee feel=amount * 0.01]",
		)
		const changed = apply(added, "fee[script Compute fee | feel=amount * 0.02]").definitions
		expect(script("fee", changed)).toEqual({ expression: "= amount * 0.02", resultVariable: "fee" })
		expectSound(changed)
	})

	it("resizes a retyped shape about its centre", () => {
		const defs = drawn(LOAN)
		const next = apply(defs, "review[xor Complete?]").definitions
		const before = boundsOf(defs, "review")
		const after = boundsOf(next, "review")
		expect(after).toMatchObject({ width: 50, height: 50 })
		expect(after.x + after.width / 2).toBe(before.x + before.width / 2)
		expect(after.y + after.height / 2).toBe(before.y + before.height / 2)
		expectSound(next)
	})

	it("inserts a step into a flow, in the gap, moving what lies right of it", () => {
		const defs = drawn(LOAN)
		// As the model reads it, review leads to the join the layout drew before pay.
		expect(writeProcessText(defs).text).toContain("review[user Review application] > pay_join")
		const result = apply(defs, "review > second[user Second approval] > pay_join\n@1 second")
		expect(result.problems).toEqual([])
		expect(result.created).toEqual(["second"])
		expect(result.fixes).toEqual([
			"replaced the flow review > pay_join with the path through second",
		])
		const next = result.definitions
		expect(flowsOf(next)).toContain("review>second")
		expect(flowsOf(next)).toContain("second>pay_join")
		expect(flowsOf(next)).not.toContain("review>pay_join")
		const review = boundsOf(next, "review")
		const second = boundsOf(next, "second")
		const join = boundsOf(next, "pay_join")
		expect(second.x).toBeGreaterThan(review.x + review.width)
		expect(second.x + second.width).toBeLessThan(join.x)
		// On review's row.
		expect(second.y + second.height / 2).toBe(review.y + review.height / 2)
		// Left of the insert nothing moved; right of it everything moved by the same amount.
		for (const id of ["start", "check", "review", "auto"]) {
			expect(boundsOf(next, id)).toEqual(boundsOf(defs, id))
		}
		const dx = boundsOf(next, "pay_join").x - boundsOf(defs, "pay_join").x
		expect(dx).toBeGreaterThan(0)
		for (const id of ["pay", "done"]) expect(boundsOf(next, id).x - boundsOf(defs, id).x).toBe(dx)
		expect(result.addressed.get(1)).toEqual(["second"])
		expectSound(next)
	})

	it("keeps a branch's condition on the first flow of a step inserted into it", () => {
		const defs = drawn(LOAN)
		const result = apply(defs, "check > kyc[service Check identity] > review")
		const next = result.definitions
		const flow = next.processes[0]?.sequenceFlows.find(
			(f) => f.sourceRef === "check" && f.targetRef === "kyc",
		)
		expect(flow?.name).toBe("Yes")
		expect(flow?.conditionExpression?.text).toBe("= amount > 10000")
		// A gateway's new step goes on the row of the branch it is on.
		expect(boundsOf(next, "kyc").y + 40).toBe(boundsOf(next, "review").y + 40)
		expectSound(next)
	})

	it("copies a condition in another expression language unchanged into an insert", () => {
		const defs = fixture("miwg-C.1.1.bpmn")
		const { text, aliases } = writeProcessText(defs)
		expect(text).toContain("invoice_approved >(yes: bpmn:getDataObject('approved')) prepare_bank")
		const result = applyProcessDelta(
			defs,
			parseProcessDelta("invoice_approved > check[user Check] > prepare_bank_transfer"),
			{ aliases, ids: createIdFactory("c11") },
		)
		expect(result.problems).toEqual([])
		const flow = result.definitions.processes[0]?.sequenceFlows.find((f) => f.targetRef === "check")
		const old = defs.processes[0]?.sequenceFlows.find(
			(f) =>
				f.sourceRef === aliases.invoice_approved && f.targetRef === aliases.prepare_bank_transfer,
		)
		expect(flow?.conditionExpression).toEqual(old?.conditionExpression)
		expectSound(result.definitions)
	})

	it("writes a new condition only if it is FEEL, else keeps it as the label", () => {
		const defs = drawn(LOAN)
		const result = apply(defs, "check >(Odd: is odd) odd[end Odd]\ncheck >(Yes: is big) review")
		const flows = result.definitions.processes[0]?.sequenceFlows ?? []
		expect(flows.find((f) => f.targetRef === "odd")).toMatchObject({ name: "Odd: is odd" })
		expect(flows.find((f) => f.targetRef === "odd")?.conditionExpression).toBeUndefined()
		expect(flows.find((f) => f.targetRef === "review")?.conditionExpression?.text).toBe(
			"= amount > 10000",
		)
		expect(result.problems.map((p) => [p.line, p.message])).toEqual([
			[1, 'condition "is odd" is not FEEL; kept as the branch label'],
			[2, 'condition "is big" is not FEEL; kept the condition it had'],
		])
	})

	it("moves the default with an insert on the default branch", () => {
		const defs = drawn(LOAN)
		const next = apply(defs, "check > score[rule Score applicant] > auto").definitions
		const gateway = element(next, "check")
		const flow = next.processes[0]?.sequenceFlows.find((f) => f.targetRef === "score")
		expect(gateway && "default" in gateway ? gateway.default : undefined).toBe(flow?.id)
		expectSound(next)
	})

	it("adds a branch from a gateway where it overlaps nothing", () => {
		const defs = drawn(LOAN)
		const result = apply(defs, "check >(Fraud: risk > 0.9) block[end Application blocked]")
		expect(result.problems).toEqual([])
		const next = result.definitions
		const shapes = next.diagrams[0]?.plane.shapes ?? []
		const block = boundsOf(next, "block")
		for (const s of shapes) {
			if (s.bpmnElement !== "block") expect(overlap(block, s.bounds), s.bpmnElement).toBe(false)
		}
		const flow = next.processes[0]?.sequenceFlows.find((f) => f.targetRef === "block")
		expect(flow).toMatchObject({ name: "Fraud", conditionExpression: { text: "= risk > 0.9" } })
		expectSound(next)
	})

	it("adds a timer boundary on the host's bottom edge, and its handler below", () => {
		const defs = drawn(LOAN)
		const result = apply(
			defs,
			"late[boundary:timer Two days | on=review nonint] > remind[send Remind applicant] > review_end[end Reminded]",
		)
		expect(result.problems).toEqual([])
		const next = result.definitions
		const late = element(next, "late")
		expect(late).toMatchObject({
			type: "boundaryEvent",
			attachedToRef: "review",
			cancelActivity: false,
			name: "Two days",
		})
		expect(late && "eventDefinitions" in late ? late.eventDefinitions[0]?.type : undefined).toBe(
			"timer",
		)
		const host = boundsOf(next, "review")
		const timer = boundsOf(next, "late")
		expect(timer.y + timer.height / 2).toBe(host.y + host.height)
		expect(boundsOf(next, "remind").y).toBeGreaterThan(host.y + host.height)
		// A send task needs a job type to deploy; it gets its id, as a parsed draft does.
		expect(result.fixes).toContain('gave remind the job type "remind"')
		expectSound(next)
	})

	it("removes a step and joins its neighbours", () => {
		const defs = drawn(LOAN)
		const result = apply(defs, "- review")
		expect(result.removed).toEqual(["review"])
		expect(result.fixes).toEqual(["joined check > pay_join where review was removed"])
		const next = result.definitions
		// The branch goes where review went, and keeps its condition.
		const flow = next.processes[0]?.sequenceFlows.find(
			(f) => f.sourceRef === "check" && f.targetRef === "pay_join",
		)
		expect(flow).toMatchObject({ name: "Yes", conditionExpression: { text: "= amount > 10000" } })
		expectSound(next)
	})

	it("does not leave an empty branch where a parallel step was removed", () => {
		const defs = drawn(
			"s[start Go] > split[and] > a[task A] > join[and] > e[end Done]\nsplit > b[task B] > join",
		)
		const result = apply(defs, "- b")
		expect(result.fixes).toEqual([])
		expect(flowsOf(result.definitions)).not.toContain("split>join")
		expectSound(result.definitions)
	})

	it("lets an @ line name a node the same script removes", () => {
		const result = apply(drawn(LOAN), "- auto\n@1 auto")
		expect(result.problems).toEqual([])
		expect(result.addressed.get(1)).toEqual(["auto"])
	})

	it("does not join the neighbours when the script reconnects them itself", () => {
		const defs = drawn(LOAN)
		const result = apply(defs, "- auto\ncheck >(No: default) done")
		expect(result.fixes).toEqual([])
		expect(flowsOf(result.definitions)).toContain("check>done")
		expectSound(result.definitions)
	})

	it("removes a flow and clears a gateway default that pointed at it", () => {
		const defs = drawn(LOAN)
		const result = apply(defs, "- check > auto")
		expect(result.problems).toEqual([])
		const next = result.definitions
		expect(flowsOf(next)).not.toContain("check>auto")
		const gateway = element(next, "check")
		expect(gateway && "default" in gateway ? gateway.default : "missing").toBeUndefined()
		expectSound(next)
	})

	it("relabels an existing flow and changes only what the script states", () => {
		const defs = drawn(LOAN)
		const result = apply(defs, "check >(Large: amount > 25000) review")
		const flow = result.definitions.processes[0]?.sequenceFlows.find(
			(f) => f.sourceRef === "check" && f.targetRef === "review",
		)
		expect(flow).toMatchObject({ name: "Large", conditionExpression: { text: "= amount > 25000" } })
		expect(result.changed).toEqual(["check"])
		// Restating a flow with only a name keeps its condition.
		const renamed = apply(defs, "check >(Big) review").definitions.processes[0]?.sequenceFlows.find(
			(f) => f.sourceRef === "check" && f.targetRef === "review",
		)
		expect(renamed?.conditionExpression?.text).toBe("= amount > 10000")
	})

	it("gives a task retyped or added as a service or rule task what it needs to deploy", () => {
		const defs = drawn(LOAN)
		const result = apply(
			defs,
			"review[service Review application]\nauto > score[rule Score applicant] > pay_join",
		)
		const ext = (id: string) => element(result.definitions, id)?.extensionElements ?? []
		expect(ext("review").find((e) => e.name === "zeebe:taskDefinition")?.attributes.type).toBe(
			"review",
		)
		expect(ext("score").find((e) => e.name === "zeebe:calledDecision")?.attributes.decisionId).toBe(
			"score",
		)
		expect(result.fixes).toEqual(
			expect.arrayContaining([
				'gave review the job type "review"',
				'gave score the decision "score"',
			]),
		)
		// A task that already has a job type keeps it.
		const kept = apply(defs, "pay[send Pay out]")
		expect(kept.fixes).toEqual([])
		expectSound(result.definitions)
	})

	it("sets a job type and keeps the rest of the task definition", () => {
		const defs = drawn(LOAN)
		const pay = element(defs, "pay")
		const definition = pay?.extensionElements.find((e) => e.name === "zeebe:taskDefinition")
		if (!definition) throw new Error("fixture has no task definition")
		definition.attributes.retries = "5"
		const next = apply(defs, "pay[service Pay out | job=payout-v2]").definitions
		const after = element(next, "pay")?.extensionElements.find(
			(e) => e.name === "zeebe:taskDefinition",
		)
		expect(after?.attributes).toEqual({ type: "payout-v2", retries: "5" })
		expect(apply(defs, "pay[service Pay out | job=payout-v2]").changed).toEqual(["pay"])
	})

	it("reports what it cannot do, and does the rest", () => {
		const defs = drawn(LOAN)
		const result = apply(
			defs,
			[
				"ghost > review",
				"newbie > pay",
				"- nothing",
				"- start > done",
				"sub_1[sub Inner]",
				"timer[boundary:timer Late]",
				"review[boundary:error Broken | on=pay]",
				"@1 review phantom",
				"auto > fast[service Pay fast] > done",
			].join("\n"),
		)
		expect(result.problems.map((p) => p.message)).toEqual(
			expect.arrayContaining([
				'"ghost" is not in the diagram',
				'"newbie" is not in the diagram',
				'there is no "nothing" to remove',
				"there is no flow start > done to remove",
				'a new subProcess cannot be added here; left out "sub_1"',
				'boundary "timer" needs on=<task>',
				'"review" cannot become or stop being a boundary event',
				"@1 names phantom, which is not in the diagram",
			]),
		)
		expect(result.problems).toHaveLength(8)
		expect(result.created).toEqual(["fast"])
		expect(result.addressed.get(1)).toEqual(["review"])
		expectSound(result.definitions)
	})

	it("keeps the id the script wrote, unless the document already uses it", () => {
		const defs = drawn(LOAN)
		// `Flow_1` is a sequence flow's id, which no script is shown.
		expect(defs.processes[0]?.sequenceFlows.some((f) => f.id === "Flow_1")).toBe(true)
		const result = apply(defs, "review > Flow_1[task Taken] > pay_join")
		expect(result.created).toEqual(["Flow_1_2"])
		expectSound(result.definitions)
	})

	it("adds a new node to the lane it is drawn in", () => {
		const defs = fixture("miwg-C.7.0.bpmn")
		const { text, aliases } = writeProcessText(defs)
		expect(text).toContain("write_description")
		const result = applyProcessDelta(
			defs,
			parseProcessDelta("write_description > legal[user Legal review] > complete_advertisement"),
			{ aliases, ids: createIdFactory("lane") },
		)
		expect(result.problems).toEqual([])
		const lanes = result.definitions.processes[0]?.laneSet?.lanes ?? []
		const owner = lanes.find((lane) => lane.flowNodeRefs.includes("legal"))
		const writer = lanes.find((lane) => lane.flowNodeRefs.includes(aliases.write_description ?? ""))
		expect(owner?.id).toBe(writer?.id)
		// The insert made room, and the pool and both lanes widened by exactly that much.
		const next = result.definitions
		const target = aliases.complete_advertisement ?? ""
		const dx = boundsOf(next, target).x - boundsOf(defs, target).x
		expect(dx).toBeGreaterThan(0)
		const containers = [
			...defs.collaborations.flatMap((c) => c.participants.map((p) => p.id)),
			...lanes.map((lane) => lane.id),
		]
		expect(containers).toHaveLength(3)
		for (const id of containers) {
			expect(boundsOf(next, id).width, id).toBe(boundsOf(defs, id).width + dx)
		}
		expectSound(result.definitions)
	})

	describe.each(readdirSync(ROUNDTRIP).filter((f) => f.endsWith(".bpmn")))("%s", (file) => {
		it("takes an insert, a new branch and a removal, and stays sound", () => {
			const defs = fixture(file)
			// Some test files draw nothing, or draw this process on another diagram.
			if (!drawnInFull(defs)) return
			const { text } = writeProcessText(defs)
			const delta = parseProcessDelta(text)
			const first = delta.flows[0]
			if (!first) return
			const other = delta.nodes.find(
				(n) => n.id !== first.from && n.id !== first.to && n.type !== "startEvent",
			)
			const script = [
				`${first.from} > added_step[task Added step] > ${first.to}`,
				`${first.from} > side[task Side step] > side_end[end Side done]`,
				other ? `- ${other.id}` : "",
			].join("\n")
			const result = apply(defs, script)
			expect(result.created).toEqual(["added_step", "side", "side_end"])
			expectSound(result.definitions, defs)
			const shapes = result.definitions.diagrams[0]?.plane.shapes ?? []
			const containers = new Set([
				...result.definitions.collaborations.flatMap((c) => c.participants.map((p) => p.id)),
				...result.definitions.processes.flatMap((p) => (p.laneSet?.lanes ?? []).map((l) => l.id)),
			])
			for (const id of result.created) {
				const mine = boundsOf(result.definitions, id)
				for (const s of shapes) {
					if (s.bpmnElement === id || containers.has(s.bpmnElement)) continue
					expect(overlap(mine, s.bounds), `${id} on ${s.bpmnElement}`).toBe(false)
				}
			}
		})

		it("is left exactly as it was by its own restatement", () => {
			const defs = fixture(file)
			const result = apply(defs, writeProcessText(defs).text)
			expect(result.definitions).toEqual(defs)
			expect([result.created, result.changed, result.removed]).toEqual([[], [], []])
		})
	})
})

describe("applyProcessDelta — with lines", () => {
	const connect = (defs: BpmnDefinitions, script: string, withCatalog = true) => {
		const { aliases } = writeProcessText(defs)
		return applyProcessDelta(defs, parseProcessDelta(script), {
			aliases,
			ids: createIdFactory("test"),
			...(withCatalog ? { applyConnectors: applyConnectorLines } : {}),
		})
	}

	it("configures an existing task as a connector and keeps the layout", () => {
		const before = drawn(LOAN)
		const result = connect(
			before,
			"with pay: http POST https://pay.example/payouts | body=={amount: amount}",
		)
		expect(result.problems).toEqual([])
		expect(result.changed).toEqual(["pay"])
		const pay = result.definitions.processes[0]?.flowElements.find((el) => el.id === "pay")
		expect(pay?.unknownAttributes["zeebe:modelerTemplate"]).toBe(
			"io.camunda.connectors.HttpJson.v2",
		)
		const shapes = (d: BpmnDefinitions) => d.diagrams[0]?.plane.shapes.map((s) => s.bounds)
		expect(shapes(result.definitions)).toEqual(shapes(before))
	})

	it("passes questions on, and reports with lines it cannot apply", () => {
		const result = connect(drawn(LOAN), "with pay: slack chat.postMessage\nwith ghost: http")
		expect(result.questions.map((q) => q.draft)).toContain(
			"with pay: slack chat.postMessage | token=",
		)
		expect(result.problems.map((p) => p.message)).toEqual([
			'"with ghost:" names no node of the diagram; ignored',
		])
		const without = connect(drawn(LOAN), "with pay: http https://x.example", false)
		expect(without.problems.map((p) => p.message)).toEqual([
			'"with pay:" needs the connector catalog to apply; ignored',
		])
	})

	it("can configure a node the same script adds", () => {
		const result = connect(
			drawn(LOAN),
			"review > notify[task Notify applicant] > pay\nwith notify: sendgrid mail | apiKey={{secrets.SG}}",
		)
		const notify = result.definitions.processes[0]?.flowElements.find((el) => el.id === "notify")
		expect(notify?.type).toBe("serviceTask")
		expect(notify?.unknownAttributes["zeebe:modelerTemplate"]).toBe(
			"io.camunda.connectors.SendGrid.v2",
		)
	})
})

describe("applyProcessDelta forms and mappings", () => {
	const ext = (defs: BpmnDefinitions, id: string, name: string) =>
		element(defs, id)?.extensionElements.find((e) => e.name === name)

	it("gives a new user task its form, zeebe:userTask and input", () => {
		const out = apply(drawn(LOAN), "review > n[user Approve | form=f in.x=agent.x] > pay")
		expect(out.problems).toEqual([])
		const id = out.created[0] ?? ""
		expect(ext(out.definitions, id, "zeebe:formDefinition")?.attributes.formId).toBe("f")
		expect(ext(out.definitions, id, "zeebe:userTask")).toBeDefined()
		expect(
			ext(out.definitions, id, "zeebe:ioMapping")?.children.map((c) => [c.name, c.attributes]),
		).toEqual([["zeebe:input", { source: "=agent.x", target: "x" }]])
	})

	it("sets the form and mapping of an existing node, and a restated one changes nothing", () => {
		const defs = drawn(LOAN)
		const out = apply(defs, "review[user Review application | form=g out.ok=resp.ok]")
		expect(out.problems).toEqual([])
		expect(ext(out.definitions, "review", "zeebe:formDefinition")?.attributes.formId).toBe("g")
		expect(ext(out.definitions, "review", "zeebe:ioMapping")?.children[0]?.attributes).toEqual({
			source: "=resp.ok",
			target: "ok",
		})
		const again = apply(out.definitions, "review[user Review application | form=g out.ok=resp.ok]")
		expect(again.changed).toEqual([])
	})

	it("reports form= on a node that cannot have one", () => {
		const out = apply(drawn(LOAN), "pay[service Pay out | form=f]")
		expect(out.problems.map((p) => p.message).join()).toContain("form=")
	})
})

describe("applyProcessDelta ad-hoc sub-processes and notes", () => {
	const AGENT = `# Agent
start[start Go] > agent[adhoc AI Agent] > fin[end Done]
users[service Find sample users | inside=agent]
joke[service Get a safe joke | inside=agent]
note joke: Each tool is a capability`

	const messages = (out: { problems: { message: string }[] }) =>
		out.problems.map((p) => p.message).join(" | ")
	const container = (defs: BpmnDefinitions) => {
		const agent = element(defs, "agent")
		return agent?.type === "adHocSubProcess" ? agent : undefined
	}
	const notesOf = (defs: BpmnDefinitions) => defs.processes[0]?.textAnnotations ?? []

	it("adds a note to an element, with its association and shapes", () => {
		const defs = drawn(AGENT)
		const out = apply(defs, "note agent: Runs the tools it needs")
		expect(out.problems).toEqual([])
		const added = notesOf(out.definitions).filter((a) => a.text === "Runs the tools it needs")
		expect(added).toHaveLength(1)
		const id = added[0]?.id ?? ""
		const assoc = out.definitions.processes[0]?.associations.find(
			(a) => a.sourceRef === "agent" && a.targetRef === id,
		)
		expect(assoc).toBeDefined()
		const plane = out.definitions.diagrams[0]?.plane
		expect(plane?.shapes.some((s) => s.bpmnElement === id)).toBe(true)
		expect(plane?.edges.some((e) => e.bpmnElement === assoc?.id)).toBe(true)
		expect(notesOf(defs)).toHaveLength(1)
		// the note clears the shapes already there
		const note = boundsOf(out.definitions, id)
		for (const shape of plane?.shapes ?? []) {
			if (shape.bpmnElement === id) continue
			const b = shape.bounds
			const apart =
				note.x + note.width <= b.x ||
				b.x + b.width <= note.x ||
				note.y + note.height <= b.y ||
				b.y + b.height <= note.y
			const holdsIt = shape.bpmnElement === "agent"
			expect(apart || holdsIt, shape.bpmnElement).toBe(true)
		}
	})

	it("adds a note to a node the same script adds, and to a node inside a container", () => {
		const out = apply(
			drawn(AGENT),
			"agent > review[user Review] > fin\nnote review: Check it\nnote users: Lists users",
		)
		expect(out.problems).toEqual([])
		const created = out.created[0] ?? ""
		const refs = out.definitions.processes[0]?.associations.map((a) => a.sourceRef) ?? []
		expect(refs).toContain(created)
		expect(refs).toContain("users")
	})

	it("reports a note that names nothing, and one with no element to hold it", () => {
		const out = apply(drawn(AGENT), "note ghost: Nobody")
		expect(messages(out)).toMatch(/note ghost.*not in the diagram/)
		expect(notesOf(out.definitions)).toHaveLength(1)
	})

	it("leaves a restated note alone", () => {
		const defs = drawn(AGENT)
		const out = apply(defs, "note joke: Each tool is a capability")
		expect(out.problems).toEqual([])
		expect(notesOf(out.definitions)).toHaveLength(1)
	})

	it("answers a restated container and tools with nothing to change", () => {
		const defs = drawn(AGENT)
		const out = apply(defs, writeProcessText(defs).text)
		expect(out.problems).toEqual([])
		expect(out.changed).toEqual([])
		expect(out.created).toEqual([])
		expect(out.definitions).toEqual(defs)
	})

	it("renames and re-attributes a tool inside a container", () => {
		const out = apply(drawn(AGENT), "users[service Look up users | inside=agent job=lookup]")
		expect(out.problems).toEqual([])
		const tool = container(out.definitions)?.flowElements.find((el) => el.id === "users")
		expect(tool?.name).toBe("Look up users")
		expect(
			tool?.extensionElements.find((e) => e.name === "zeebe:taskDefinition")?.attributes.type,
		).toBe("lookup")
		expect(out.changed).toContain("users")
	})

	it("reports a change of kind for a tool inside a container", () => {
		const out = apply(drawn(AGENT), "users[user Find sample users | inside=agent]")
		expect(messages(out)).toMatch(/users.*inside/)
		expect(container(out.definitions)?.flowElements.find((el) => el.id === "users")?.type).toBe(
			"serviceTask",
		)
	})

	it("reports an inside= that would move a node, and one on a node it adds", () => {
		const moved = apply(drawn(AGENT), "start[start Go | inside=agent]")
		expect(messages(moved)).toMatch(/inside=agent.*start/)
		expect(container(moved.definitions)?.flowElements.map((el) => el.id)).toEqual(["users", "joke"])
		const added = apply(drawn(AGENT), "extra[service Extra | inside=agent]")
		expect(messages(added)).toMatch(/inside=agent on "extra".*cannot add/)
		expect(added.created).toEqual([])
		expect(element(added.definitions, "extra")).toBeUndefined()
		expect(container(added.definitions)?.flowElements).toHaveLength(2)
	})

	it("reports a flow to or from a node inside a container", () => {
		const out = apply(drawn(AGENT), "start > users")
		expect(messages(out)).toMatch(/users.*inside/)
		expect(flowsOf(out.definitions)).toEqual(["agent>fin", "start>agent"])
	})

	it("reports a new ad-hoc sub-process, which a script cannot add", () => {
		const out = apply(drawn(AGENT), "agent > box[adhoc Box] > fin")
		expect(messages(out)).toMatch(/adHocSubProcess/)
		expect(element(out.definitions, "box")).toBeUndefined()
	})
})
