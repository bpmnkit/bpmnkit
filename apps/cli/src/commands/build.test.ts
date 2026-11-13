import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Bpmn, lintDiagram } from "@bpmnkit/core"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { parseArgs } from "../args.js"
import { resolveOutputFormat } from "../output.js"
import type { RunContext } from "../types.js"
import { compileTextSpec, keyThrownMessages } from "./build-spec.js"
import { buildGroup } from "./build.js"
import { clusterFromEnv } from "./deploy.js"
import { bpmnlintrcKey } from "./lint.js"

const S04 = `# Expense approval | id=expense
start[start Expense submitted] > review[user Review expense | fields=amount:number,approved:checkbox] > ok[xor Approved?]
ok >(Yes: approved = true) pay[service Pay expense | job=pay-expense] > paid[end Expense paid]
ok >(No: default) fix[user Revise expense] > review`

const S16 = `# Hiring
## HR | id=hiring
### Recruiter
start[start Application received] > screen[user Screen candidate]
### Manager
screen > approve[user Approve hire]
### Recruiter
approve > offer[send Send offer | job=send-offer] > answer[catch Answer received | msg=answer key=candidateId] > done[end Hired]
cv[object CV] ..> screen
offer ..> db[store HR system]
## Candidate | blackbox
offer ~> candidate: Offer
candidate ~> answer: Answer`

const S16X = `# Hiring
policy[annotation Hiring follows the company policy]
## HR | id=hiring
### Recruiter
received[start:message Application received | msg=application] > screen[user Screen candidate] > interviews[sub Organise interviews] > decide[xor Hire?]
interviews {
  is[start Interviews needed] > plan[user Plan interviews] > hold[user Hold interview | each=interviewers] > ie[end Interviews held]
}
### Manager
decide >(Yes: hire = true) offer[send Send offer | job=send-offer] > answer[catch Answer received | msg=answer key=candidateId] > hired[end Hired]
decide >(No: default) reject[send Send rejection | job=send-rejection] > rejected[end Rejected]
cv[object CV] ..> screen
n2[annotation Offers need manager approval] ..> offer
## Talent pool | id=talent
opened[start:condition Headcount opened | cond=openings > 0] > search[service Search talent pool | job=search] > found[end Search done]
## Candidate | blackbox
candidate ~> received: Application
offer ~> candidate: Offer
candidate ~> answer: Answer`

const S16Y = `# Order fulfilment
policy[annotation Orders ship within two days]
## Shipping | id=shipping
handover[start Parcel handed over] > ship[service Ship parcel | job=ship] > delivered[end:message Delivered | msg=delivered]
## Shop | id=shop
### Sales
order[start:message Order received | msg=order] > risk[rule Assess risk] > ok[xor Risk acceptable?]
ok >(Yes: risk = "low") charge[send Request payment | job=charge] > paid[catch Payment confirmed | msg=paid key=orderId] > pick[send Request picking | job=pick] > picked[catch Goods picked | msg=picked key=orderId] > confirm[end:message Order confirmed | msg=confirmed]
ok >(No: default) refuse[end:message Order refused | msg=refused]
orders[store Order DB] ..> risk
n1[annotation Risk rules come from DMN] ..> risk
## Customer | blackbox
## Warehouse | id=warehouse
req[start Picking requested] > prep[sub Prepare goods] > hand[send Hand over parcel | job=handover] > done[end Goods out]
prep {
  ps[start Start] > collect[user Collect items] > pack[user Pack parcel] > pe[end Packed]
}
prep ..> orders2[store Order DB]
## Payment provider | blackbox
customer ~> order: Order
charge ~> payment-provider: Payment request
payment-provider ~> paid: Payment confirmation
pick ~> req: Pick list
prep ~> picked: Picked
hand ~> handover: Parcel
delivered ~> customer: Delivery notice
confirm ~> customer: Confirmation
refuse ~> customer: Refusal`

describe("compileTextSpec", () => {
	it("builds sub-process bodies, conditional starts and free annotations, all drawn", () => {
		const { definitions: d, problems } = compileTextSpec(S16X)
		expect(problems).toEqual([])
		const hiring = d.processes.find((p) => p.id === "hiring")
		const sub = hiring?.flowElements.find((e) => e.id === "interviews")
		expect(sub?.type).toBe("subProcess")
		expect(sub && "flowElements" in sub && sub.flowElements.map((e) => e.id)).toEqual(
			expect.arrayContaining(["is", "plan", "hold", "ie"]),
		)
		const opened = d.processes.find((p) => p.id === "talent")?.flowElements[0]
		expect(opened && "eventDefinitions" in opened && opened.eventDefinitions[0]?.type).toBe(
			"conditional",
		)
		expect(d.collaborations[0]?.textAnnotations.map((a) => a.id)).toEqual(["policy"])
		expect(hiring?.textAnnotations.map((a) => a.id)).toEqual(["n2"])
		expect(hiring?.associations.map((a) => [a.sourceRef, a.targetRef])).toEqual([["offer", "n2"]])
		const shapes = new Map(d.diagrams[0]?.plane.shapes.map((s) => [s.bpmnElement, s]))
		for (const id of ["policy", "n2", "interviews", "plan", "opened"])
			expect(shapes.has(id), id).toBe(true)
		expect(shapes.get("interviews")?.isExpanded).toBe(true)
		// An annotation in a pool stays inside it.
		const pool = shapes.get("Pool_hiring")?.bounds
		const n2 = shapes.get("n2")?.bounds
		expect(n2 && pool && n2.y + n2.height <= pool.y + pool.height).toBe(true)
		const report = lintDiagram(Bpmn.parse(Bpmn.export(d)))
		expect(report.diagnostics.filter((x) => x.severity === "error")).toEqual([])
	})

	it("says in one line what the spec cannot use and where to go instead", () => {
		const problems = (text: string) => compileTextSpec(text).problems
		expect(problems("s[start S] > x[subprocess X] > e[end E]")).toEqual([
			'line 1: "x": kind "subprocess" is not in the text spec (kinds: casen build --help); write a builder module (.mjs) instead, see the card\'s "Not in the text spec"',
		])
		expect(problems("s[start S] > x[sub X] > e[end E]")).toEqual([
			'"x": a sub-process needs its body: "x {" on its own line, its paths, then "}"',
		])
		expect(problems("s[start S] > x[sub X] > e[end E]\nx {\na[start A] > b[end B]")).toEqual([
			'line 2: "x {" is not closed; end the body with "}"',
		])
		expect(problems("s[start S] > e[end E]\n}")).toEqual(['line 2: "}" closes no "id {" body'])
		expect(problems("s[start:timer S | at==dueDate] > e[end E]")[0]).toMatch(
			/^line 1: "s" at==dueDate: a timer start takes a literal date-time/,
		)
		expect(problems("s[start:timer S | at=2026-01-31T09:00:00Z] > e[end E]")).toEqual([])
	})

	it("builds one process with its id, version and form fields", () => {
		const { definitions, fields, problems } = compileTextSpec(S04)
		expect(problems).toEqual([])
		expect(definitions.processes.map((p) => p.id)).toEqual(["expense"])
		expect(definitions.collaborations).toEqual([])
		expect(definitions.unknownAttributes["modeler:executionPlatformVersion"]).toBe("8.10.0")
		expect(fields).toEqual({ review: "amount:number,approved:checkbox" })
		expect(definitions.diagrams[0]?.plane.shapes.length).toBeGreaterThan(5)
	})

	it("builds pools, lanes, message flows and data", () => {
		const { definitions: d, problems } = compileTextSpec(S16)
		expect(problems).toEqual([])
		const collab = d.collaborations[0]
		expect(collab?.participants.map((p) => [p.id, p.processRef])).toEqual([
			["Pool_hiring", "hiring"],
			["candidate", undefined],
		])
		expect(collab?.messageFlows.map((f) => [f.sourceRef, f.targetRef, f.name])).toEqual([
			["offer", "candidate", "Offer"],
			["candidate", "answer", "Answer"],
		])
		const process = d.processes[0]
		expect(process?.laneSet?.lanes.map((l) => [l.id, l.flowNodeRefs])).toEqual([
			["Lane_recruiter", ["start", "screen", "offer", "answer", "done"]],
			["Lane_manager", ["approve"]],
		])
		const screen = process?.flowElements.find((e) => e.id === "screen")
		expect(screen?.dataInputAssociations?.[0]?.sourceRefs).toEqual(["cv"])
		const offer = process?.flowElements.find((e) => e.id === "offer")
		expect(offer?.dataOutputAssociations?.[0]?.targetRef).toBe("db")
		expect(d.unknownChildren?.map((c) => c.attributes.id)).toEqual(["DataStore_db"])
		// Data references sit inside the pool, under their task.
		const shapes = new Map(d.diagrams[0]?.plane.shapes.map((s) => [s.bpmnElement, s.bounds]))
		const pool = shapes.get("Pool_hiring")
		for (const id of ["cv", "db"]) {
			const b = shapes.get(id)
			expect(b && pool && b.y + b.height <= pool.y + pool.height, id).toBe(true)
		}
		expect(lintDiagram(Bpmn.parse(Bpmn.export(d))).counts.error).toBe(0)
	})

	it("renames generated ids two pools share", () => {
		const { definitions, fixes } = compileTextSpec(
			"## A | id=a\nx[task X] > y[task Y]\n## B | id=b\nx[task X2] > z[task Z]",
		)
		const ids = definitions.processes.flatMap((p) => p.flowElements.map((e) => e.id))
		expect(new Set(ids).size).toBe(ids.length)
		expect(fixes.some((f) => f.includes('"x"'))).toBe(true)
	})

	it("reports lines it cannot use", () => {
		expect(compileTextSpec("a[task A] > b[task B]\na ~> b").problems).toEqual([
			'line 2: a message flow needs pools ("## Pool name" sections)',
		])
		const { problems } = compileTextSpec("## P\na[task A] > b[task B]\nd[object D] ..> nope")
		expect(problems).toEqual(['line 3: "d" is wired to no node of pool "p"'])
		expect(compileTextSpec("## P\na[task A]\n## Q\nb[task B]\na ~> zz").problems).toEqual([
			'line 5: no node or pool "zz"',
		])
	})
})

describe("keyThrownMessages", () => {
	it("keeps a thrown message's ref and gives it the key the process waits with", () => {
		const { definitions } = compileTextSpec(
			"# T | id=t\ns[start S] > m[catch Paid | msg=paid key=id] > sent[end:message Sent]",
		)
		expect(keyThrownMessages(definitions)).toEqual([
			'message "sent" is only sent; it carries correlation key =id',
		])
		const sent = definitions.processes[0]?.flowElements.find((e) => e.id === "sent")
		const ref = sent && "eventDefinitions" in sent ? sent.eventDefinitions[0] : undefined
		expect(ref && "messageRef" in ref && ref.messageRef).toBe("Message_sent")
		const report = lintDiagram(Bpmn.parse(Bpmn.export(definitions)))
		expect(JSON.stringify(report.diagnostics)).not.toContain("subscription")
	})

	it("shares the caught message of the same name across pools", () => {
		const { definitions } = compileTextSpec(
			"# T\n## A | id=a\ns[start S] > w[catch Done | msg=done key=orderId] > e[end E]\n## B | id=b\nt[start T] > d[end:message Done | msg=done]\nd ~> w",
		)
		keyThrownMessages(definitions)
		expect(definitions.messages.map((m) => m.name)).toEqual(["done"])
	})
})

describe("judge findings", () => {
	it("writes conditions as tFormalExpression", () => {
		const xml = Bpmn.export(compileTextSpec(S04).definitions)
		expect(xml).toMatch(/<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"/)
	})

	it("names a rule task's decision from decision= or its name", () => {
		const { definitions: d, fixes } = compileTextSpec(
			"s[start S] > r[rule Assess risk] > q[rule Score | decision=credit-score] > e[end E]",
		)
		const decision = (id: string) =>
			JSON.stringify(d.processes[0]?.flowElements.find((e) => e.id === id)?.extensionElements)
		expect(decision("r")).toContain('"decisionId":"assess-risk"')
		expect(decision("q")).toContain('"decisionId":"credit-score"')
		expect(fixes).toContain('"r" calls decision "assess-risk"; set decision= to call another')
	})

	it("declares a same-name data store once, referenced from each pool", () => {
		const { definitions: d, problems } = compileTextSpec(
			"# T\n## A | id=a\ns[start S] > t[task T] > e[end E]\nt ..> db[store Order DB]\n## B | id=b\nu[start U] > v[task V] > w[end W]\ndb2[store Order DB] ..> v",
		)
		expect(problems).toEqual([])
		expect(d.unknownChildren?.filter((c) => c.name === "bpmn:dataStore")).toHaveLength(1)
		const refs = d.processes.flatMap((p) =>
			p.flowElements.flatMap((e) => (e.type === "dataStoreReference" ? [e.dataStoreRef] : [])),
		)
		expect(refs).toEqual(["DataStore_db", "DataStore_db"])
	})

	it("makes a none start that a message flow targets a message start", () => {
		const { definitions: d, problems } = compileTextSpec(
			"# T\n## A | id=a\ns[start S] > t[send Ask | job=ask] > e[end E]\n## B | id=b\nu[start Asked] > w[end W]\nt ~> u: Pick list",
		)
		expect(problems).toEqual([])
		const u = d.processes[1]?.flowElements.find((e) => e.id === "u")
		expect(u && "eventDefinitions" in u && u.eventDefinitions[0]).toMatchObject({
			type: "message",
			messageRef: "Message_pick-list",
		})
		expect(d.messages.find((m) => m.id === "Message_pick-list")?.name).toBe("pick-list")
	})
})

describe("bpmnlintrcKey", () => {
	it("names the key c8ctl and .bpmnlintrc use", () => {
		expect(bpmnlintrcKey("compat/user-task-definition")).toBe("camunda-compat/user-task-definition")
		expect(bpmnlintrcKey("flow/mixed-gateway")).toBe("no-gateway-join-fork")
		expect(bpmnlintrcKey("bpmnlint/label-required")).toBe("label-required")
		expect(bpmnlintrcKey("deploy/call-activity-no-process")).toBe("camunda-compat/called-element")
		expect(bpmnlintrcKey("naming/unlabeled-task")).toBeUndefined()
	})
})

describe("clusterFromEnv", () => {
	it("reads the c8ctl / SDK variables", () => {
		expect(clusterFromEnv({})).toBeUndefined()
		expect(clusterFromEnv({ ZEEBE_REST_ADDRESS: "http://c8:8080" })).toEqual({
			baseUrl: "http://c8:8080",
			auth: { type: "none" },
		})
		expect(
			clusterFromEnv({
				CAMUNDA_REST_ADDRESS: "https://x",
				CAMUNDA_CLIENT_ID: "id",
				CAMUNDA_CLIENT_SECRET: "s",
				CAMUNDA_OAUTH_URL: "https://login/token",
			})?.auth,
		).toMatchObject({ type: "oauth2", clientId: "id", audience: "zeebe.camunda.io" })
	})
})

describe("casen build", () => {
	let dir: string
	const lines: string[] = []
	const ctx = (positional: string[], flags: RunContext["flags"] = {}): RunContext => ({
		positional,
		flags,
		output: {
			format: "table",
			isInteractive: false,
			printList() {},
			printItem() {},
			print() {},
			ok: (m) => lines.push(`ok ${m}`),
			info: (m) => lines.push(`info ${m}`),
		},
		getClient: () => Promise.reject(new Error("no client")),
		getAdminClient: () => Promise.reject(new Error("no client")),
	})
	const run = (positional: string[], flags: RunContext["flags"] = {}) =>
		(buildGroup.commands[0] as { run(c: RunContext): Promise<void> }).run(ctx(positional, flags))

	beforeEach(async () => {
		dir = await mkdtemp(join(tmpdir(), "casen-build-"))
		lines.length = 0
		vi.spyOn(process.stdout, "write").mockImplementation(() => true)
	})
	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		vi.unstubAllEnvs()
	})

	it("writes the .bpmn and a form per user task, lint clean, one line", async () => {
		await writeFile(join(dir, "s04.txt"), S04)
		await run([join(dir, "s04.txt")])
		expect(lines).toEqual([
			"ok s04.bpmn + 2 forms (expense-review.form, expense-fix.form) · lint clean",
		])
		expect((await readdir(dir)).sort()).toEqual([
			"expense-fix.form",
			"expense-review.form",
			"s04.bpmn",
			"s04.txt",
		])
		const form = JSON.parse(await readFile(join(dir, "expense-review.form"), "utf8"))
		expect(form.components.map((c: { key?: string }) => c.key)).toEqual([
			undefined,
			"amount",
			"approved",
		])
	})

	it("builds five pools with shared store, message ends and a DMN task, lint clean", async () => {
		await writeFile(join(dir, "s16y.txt"), S16Y)
		await run([join(dir, "s16y.txt")])
		expect(lines.at(-1)).toMatch(/^ok s16y\.bpmn \+ 2 forms .* · lint clean$/)
		const xml = await readFile(join(dir, "s16y.bpmn"), "utf8")
		expect(xml.match(/<bpmn:dataStore /g)).toHaveLength(1)
		for (const id of ["delivered", "confirm", "refuse"])
			expect(xml).toMatch(new RegExp(`id="${id}"[\\s\\S]*?messageRef="Message_`))
		expect(xml).toContain('decisionId="assess-risk"')
	})

	it("-o is the output file, not the global --output format", async () => {
		await writeFile(join(dir, "s.txt"), "a[start A] > t[service T | retries=3] > e[end E]")
		const parsed = parseArgs(["build", join(dir, "s.txt"), "-o", join(dir, "y.bpmn")])
		expect(resolveOutputFormat("build", parsed.flags)).toBe("table")
		expect(resolveOutputFormat("list", { o: "json" })).toBe("json")
		await run(parsed.positional.slice(1), parsed.flags)
		expect((await readdir(dir)).sort()).toEqual(["s.txt", "y.bpmn"])
		expect(await readFile(join(dir, "y.bpmn"), "utf8")).toContain('retries="3"')
	})

	it("keeps an existing form and fails without writing on a spec problem", async () => {
		await writeFile(
			join(dir, "f.form"),
			JSON.stringify({
				id: "expense-review",
				type: "default",
				components: [{ id: "f1", type: "textfield", key: "note", label: "Note" }],
			}),
		)
		await writeFile(join(dir, "s.txt"), S04)
		await run([join(dir, "s.txt")], { out: join(dir, "out.bpmn") })
		expect(lines).toEqual(["ok out.bpmn + 1 form (expense-fix.form) · lint clean"])
		await writeFile(join(dir, "bad.txt"), "a[task A] > b[task B]\na ~> b")
		await expect(run([join(dir, "bad.txt")])).rejects.toThrow(/problem/)
		expect((await readdir(dir)).includes("bad.bpmn")).toBe(false)
	})

	it("edits a file with a module, keeping existing shapes", async () => {
		await writeFile(join(dir, "s04.txt"), S04)
		await run([join(dir, "s04.txt")])
		const before = Bpmn.parse(await readFile(join(dir, "s04.bpmn"), "utf8"))
		await writeFile(
			join(dir, "edit.mjs"),
			`export default (kit, model) => kit.Bpmn.continueProcess(model, "expense")
	.insertAfter("pay").serviceTask("notify", { name: "Notify", taskType: "notify" })`,
		)
		lines.length = 0
		await run([join(dir, "edit.mjs")], { edit: join(dir, "s04.bpmn") })
		expect(lines).toEqual(["ok s04.bpmn · lint clean"])
		const after = Bpmn.parse(await readFile(join(dir, "s04.bpmn"), "utf8"))
		const at = (d: typeof before, id: string) =>
			d.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)?.bounds
		expect(at(after, "start")).toEqual(at(before, "start"))
		expect(at(after, "notify")).toBeDefined()
		// "paid" was right of the insertion point: it moved right to make room.
		expect(at(after, "paid")?.x).toBeGreaterThan(at(before, "paid")?.x ?? 0)
	})

	it("splits a gateway a builder module made a join and a split", async () => {
		await writeFile(
			join(dir, "loop.mjs"),
			`export default (kit) => kit.Bpmn.createProcess("p").name("P")
	.startEvent("s", { name: "S" })
	.eventBasedGateway("gw", { name: "Wait" })
	.branch("a", (b) => b.intermediateCatchEvent("m", { name: "Msg", messageName: "m", correlationKey: "=id" }).endEvent("e", { name: "E" }))
	.branch("b", (b) => b.intermediateCatchEvent("t", { name: "Hour", timerDuration: "PT1H" }).serviceTask("r", { name: "Remind", taskType: "remind" }).connectTo("gw"))`,
		)
		await run([join(dir, "loop.mjs")])
		expect(lines).toEqual(["ok loop.bpmn · lint clean"])
		const defs = Bpmn.parse(await readFile(join(dir, "loop.bpmn"), "utf8"))
		const merge = defs.processes[0]?.flowElements.find((e) => e.id === "gw_merge")
		expect(merge?.type).toBe("exclusiveGateway")
	})

	it("an edit gives forms only to new user tasks, moves only what it must, sets --camunda", async () => {
		await writeFile(join(dir, "s04.txt"), `${S04.replace("id=expense", "id=expense camunda=8.8")}`)
		await run([join(dir, "s04.txt")])
		const before = Bpmn.parse(await readFile(join(dir, "s04.bpmn"), "utf8"))
		await writeFile(
			join(dir, "edit.mjs"),
			`export default (kit, model) => kit.Bpmn.continueProcess(model, "expense")
	.insertAfter("pay").userTask("archive", { name: "Archive", assignee: "clerk", candidateGroups: "finance" })`,
		)
		lines.length = 0
		const parsed = parseArgs([
			"build",
			join(dir, "edit.mjs"),
			"--edit",
			join(dir, "s04.bpmn"),
			"--camunda",
			"8.10",
		])
		await run(parsed.positional.slice(1), parsed.flags)
		expect(lines).toEqual(["ok s04.bpmn + 1 form (expense-archive.form) · lint clean"])
		const xml = await readFile(join(dir, "s04.bpmn"), "utf8")
		expect(xml).toContain('executionPlatformVersion="8.10.0"')
		expect(xml).toContain('assignee="clerk" candidateGroups="finance"')
		const after = Bpmn.parse(xml)
		const at = (d: typeof before, id: string) =>
			d.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)?.bounds
		for (const id of ["start", "review", "ok", "pay", "fix"])
			expect(at(after, id), id).toEqual(at(before, id))
		// The new task sits on the row of the task it follows.
		expect(at(after, "archive")?.y).toBe(at(before, "pay")?.y)
	})

	it("deploys the model with its forms in one request", async () => {
		vi.stubEnv("ZEEBE_REST_ADDRESS", "http://cluster:8080")
		const fetch = vi.fn(
			async (_url: string, _init?: RequestInit) =>
				new Response(JSON.stringify({ deploymentKey: "42" }), { status: 200 }),
		)
		vi.stubGlobal("fetch", fetch)
		await writeFile(join(dir, "s04.txt"), S04)
		await run([join(dir, "s04.txt")], { deploy: true })
		expect(lines).toEqual([
			"ok s04.bpmn + 2 forms (expense-review.form, expense-fix.form) · lint clean · deployed 3 to camunda8 (key 42)",
		])
		expect(fetch.mock.calls[0]?.[0]).toBe("http://cluster:8080/v2/deployments")
		const body = fetch.mock.calls[0]?.[1]?.body as FormData
		expect(body.getAll("resources[]").map((f) => (f as File).name)).toEqual([
			"s04.bpmn",
			"expense-review.form",
			"expense-fix.form",
		])
	})
})
