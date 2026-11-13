import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { Bpmn, lintDiagram } from "@bpmnkit/core"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { parseArgs } from "../args.js"
import { resolveOutputFormat } from "../output.js"
import type { RunContext } from "../types.js"
import { compileTextSpec, dropThrowOnlyMessages } from "./build-spec.js"
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

describe("compileTextSpec", () => {
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

describe("dropThrowOnlyMessages", () => {
	it("unlinks a message only thrown, keeps one that is caught", () => {
		const { definitions } = compileTextSpec(
			"# T | id=t\ns[start S] > m[catch Paid | msg=paid key=id] > sent[end:message Sent]",
		)
		expect(definitions.messages.map((m) => m.name)).toEqual(["paid", "sent"])
		expect(dropThrowOnlyMessages(definitions)).toEqual(["Message_sent"])
		expect(definitions.messages.map((m) => m.name)).toEqual(["paid"])
		const sent = definitions.processes[0]?.flowElements.find((e) => e.id === "sent")
		expect(sent && "eventDefinitions" in sent && sent.eventDefinitions[0]).toEqual({
			type: "message",
			id: "sent_MessageEventDefinition",
		})
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
