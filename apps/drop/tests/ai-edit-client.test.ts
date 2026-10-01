// @vitest-environment happy-dom
/**
 * The page's half of AI changes from review comments: what a proposal says it
 * does, the replies it leaves, how the route's stream is read, and where the
 * comments panel offers it.
 */
import type { BpmnCanvas } from "@bpmnkit/canvas"
import {
	Bpmn,
	expand,
	parseProcessDelta,
	parseProcessText,
	semanticHash,
	writeProcessText,
} from "@bpmnkit/core"
import { applyProcessDelta } from "@bpmnkit/editor/headless"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
	type AiEditOptions,
	openAiEdit,
	readAnswer,
	replyText,
	summarise,
} from "../src/client/ai-edit.js"
import { CommentsPanel, type Thread } from "../src/client/comments.js"
import { AUTHOR_STORAGE_KEY, type CommentView, authorIdFromToken } from "../src/shared/comments.js"
import type { SuggestionView } from "../src/shared/suggestions.js"

// The preview is drawn by the real canvas on the page; here it only has to exist.
vi.mock("@bpmnkit/canvas", () => ({
	BpmnCanvas: class {
		on() {}
		highlight() {}
		loadDefinitions() {}
		destroy() {}
	},
}))

/** An order process laid out as a shared drop would be, with the names of `bpmn-samples/order-process.bpmn`. */
const XML = Bpmn.export(
	expand(
		parseProcessText(
			[
				"# Order Process",
				"start[start Order Received] > validate[service Validate Order] > valid[xor Valid?]",
				"valid >(Yes: valid = true) process[service Process Order] > merge[xor Merge] > notify[service Send Notification] > end[end Order Complete]",
				"valid >(No: default) reject[service Reject Order] > merge",
			].join("\n"),
		).diagram,
	),
)

function comment(over: Partial<CommentView>): CommentView {
	return {
		id: "Abc123def456",
		filename: "order.bpmn",
		elementId: null,
		elementLabel: null,
		elementIds: [],
		parentId: null,
		authorName: "Anna",
		authorId: "aaaaaaaaaaaaaaaa",
		body: "text",
		mentions: [],
		createdAt: 1,
		editedAt: null,
		deletedAt: null,
		resolvedAt: null,
		resolvedBy: null,
		...over,
	}
}

const thread = (over: Partial<CommentView>): Thread => ({ root: comment(over), replies: [] })

function propose(script: string) {
	const before = Bpmn.parse(XML)
	const { aliases } = writeProcessText(before)
	return { before, result: applyProcessDelta(before, parseProcessDelta(script), { aliases }) }
}

describe("summarise", () => {
	it("says what each thread gets, in words, from the two documents", () => {
		const { before, result } = propose(
			[
				"start > credit[service Check credit] > validate",
				"reject[Decline order]",
				"- notify",
				"@1 credit",
				"@2 reject notify",
			].join("\n"),
		)
		const threads = [
			thread({ id: "T1aaaaaaaaaa" }),
			thread({ id: "T2aaaaaaaaaa" }),
			thread({ id: "T3aaaaaaaaaa" }),
		]
		const summary = summarise(before, result, threads)
		expect(summary.empty).toBe(false)
		expect(summary.threads.map((t) => [t.n, t.changes])).toEqual([
			[1, ['Added service task "Check credit"']],
			[
				2,
				['Renamed "Reject Order" to "Decline order"', 'Removed service task "Send Notification"'],
			],
			[3, []],
		])
		// A removal and a new job type deserve a careful look, whoever asked for them.
		expect(summary.review).toEqual([
			'Removes "Send Notification"',
			'Job type of "Check credit": credit',
		])
		expect(summary.unclaimed).toEqual([])
		expect(summary.fixes).toContain('gave credit the job type "credit"')
		expect(replyText(summary.threads[1] as (typeof summary.threads)[number])).toBe(
			'Changed with AI: Renamed "Reject Order" to "Decline order"; Removed service task "Send Notification".',
		)
	})

	it("lists a change no @ line claims, and a new condition", () => {
		const { before, result } = propose(
			"valid >(Big: total > 1000) review[user Review order] > process",
		)
		const summary = summarise(before, result, [thread({})])
		expect(summary.threads[0]?.changes).toEqual([])
		expect(summary.unclaimed).toEqual(['Added user task "Review order"'])
		expect(summary.review).toEqual(['Condition "Valid?" → "Review order": total > 1000'])
	})

	it("says what changed on a decision's branches", () => {
		const { before, result } = propose("valid >(No: is_invalid = true) reject\n@1 valid")
		const conditioned = summarise(before, result, [thread({})])
		expect(conditioned.threads[0]?.changes).toEqual([
			'Set the condition to "Reject Order": is_invalid = true',
		])
		const defaulted = propose("valid >(Yes: default) process\n@1 valid")
		expect(summarise(defaulted.before, defaulted.result, [thread({})]).threads[0]?.changes).toEqual(
			['Made the branch to "Process Order" the default of "Valid?"'],
		)
	})

	it("says when nothing changes", () => {
		const { before, result } = propose("")
		expect(summarise(before, result, [thread({})])).toMatchObject({ empty: true, review: [] })
	})

	it("keeps a reply under the comment limit", () => {
		const long = { thread: thread({}), n: 1, changes: ["x".repeat(3000)] }
		expect(replyText(long).length).toBeLessThanOrEqual(1_900)
	})
})

describe("readAnswer", () => {
	const stream = (events: unknown[]) =>
		new Response(events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(""), {
			headers: { "Content-Type": "text/event-stream" },
		})

	it("collects the aliases and the script, and reports progress", async () => {
		const seen: string[] = []
		const answer = await readAnswer(
			stream([
				{ aliases: { a: "A_1" } },
				{ text: "a > b\n" },
				{ text: "@1 b\n" },
				{ done: true, cached: false },
			]),
			(script) => seen.push(script),
		)
		expect(answer).toEqual({
			ok: true,
			aliases: { a: "A_1" },
			script: "a > b\n@1 b\n",
			cached: false,
		})
		expect(seen).toEqual(["a > b\n", "a > b\n@1 b\n"])
	})

	it("passes on the route's error, with the status for a refused request", async () => {
		expect(await readAnswer(stream([{ aliases: {} }, { error: "stopped" }]), () => {})).toEqual({
			ok: false,
			error: "stopped",
		})
		const refused = new Response(JSON.stringify({ error: "invalid access code" }), { status: 401 })
		expect(await readAnswer(refused, () => {})).toEqual({
			ok: false,
			status: 401,
			error: "invalid access code",
		})
	})
})

describe("the comments panel with AI changes on", () => {
	let asked: Thread[][]
	let host: HTMLElement
	let panel: CommentsPanel
	const canvas = {
		overlays: { add: () => "1", remove: () => {} },
		highlight: vi.fn(),
		clearHighlights: vi.fn(),
	} as unknown as BpmnCanvas

	function mount(aiEdit = true, kind = "bpmn") {
		host = document.createElement("div")
		host.innerHTML = `<button id="t"></button><aside id="p" hidden><div id="l"></div><footer id="c"></footer></aside>
			<div id="n" hidden><span id="nt"></span><button id="no"></button></div>`
		document.body.replaceChildren(host)
		const q = <T extends HTMLElement>(id: string) => host.querySelector(`#${id}`) as T
		panel = new CommentsPanel({
			shareId: "share1",
			readOnly: null,
			toggle: q("t"),
			panel: q("p"),
			list: q("l"),
			compose: q("c"),
			notice: { box: q("n"), text: q("nt"), open: q("no") },
			challenge: async () => ({ ok: true, token: null }),
			announceName: () => {},
			...(aiEdit ? { aiEdit: (threads: Thread[]) => asked.push(threads) } : {}),
		})
		panel.setFile({ filename: "order.bpmn", kind })
		panel.showOn(canvas, Bpmn.parse(XML))
		panel.open()
		return q
	}

	const buttons = (root: HTMLElement) =>
		[...root.querySelectorAll("button")].map((b) => b.textContent)

	beforeEach(() => {
		asked = []
		localStorage.clear()
	})

	afterEach(() => vi.unstubAllGlobals())

	it("offers it on each open thread, and once for all of them", () => {
		const q = mount()
		panel.receive(comment({ id: "a11111111111", elementId: "validate" }))
		panel.receive(comment({ id: "a22222222222", createdAt: 2 }))
		panel.receive(comment({ id: "a33333333333", resolvedAt: 5, resolvedBy: "Ben" }))
		const list = q("l")
		expect(buttons(list).filter((b) => b === "Apply with AI")).toHaveLength(2)
		const all = [...list.querySelectorAll("button")].find(
			(b) => b.textContent === "Apply all 2 open with AI",
		)
		all?.click()
		expect(asked.map((ts) => ts.map((t) => t.root.id))).toEqual([["a11111111111", "a22222222222"]])
	})

	it("is not offered when the deployment has it off, or on a file that is not a diagram", () => {
		const off = mount(false)
		panel.receive(comment({ id: "a11111111111" }))
		expect(buttons(off("l"))).not.toContain("Apply with AI")
		const form = mount(true, "form")
		panel.receive(comment({ id: "a11111111111" }))
		expect(buttons(form("l"))).not.toContain("Apply with AI")
	})

	it("replies on a thread and resolves it", async () => {
		localStorage.setItem("bpmnkit-drop-name", "Ben")
		localStorage.setItem(AUTHOR_STORAGE_KEY, JSON.stringify({ share1: "1".repeat(24) }))
		mount()
		const root = comment({ id: "a11111111111" })
		panel.receive(root)
		const sent: { method: string; url: string; body: unknown }[] = []
		vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
			const body = JSON.parse(String(init.body))
			sent.push({ method: String(init.method), url, body })
			const answer =
				init.method === "POST"
					? comment({ id: "r11111111111", parentId: root.id, body: body.body })
					: { ...root, resolvedAt: 9, resolvedBy: "Ben" }
			return new Response(JSON.stringify({ comment: answer }), { status: 200 })
		})
		expect(await panel.reply(root.id, "Changed with AI: done.", true)).toBe(true)
		expect(sent.map((s) => [s.method, s.url])).toEqual([
			["POST", "/drop/api/comments/share1"],
			["PATCH", `/drop/api/comments/share1/${root.id}`],
		])
		expect(sent[0]?.body).toMatchObject({
			parentId: root.id,
			body: "Changed with AI: done.",
			name: "Ben",
		})
		expect(sent[1]?.body).toEqual({ resolved: true, name: "Ben" })
	})

	it("starts a thread for an AI review suggestion and answers it", async () => {
		localStorage.setItem("bpmnkit-drop-name", "Ben")
		localStorage.setItem(AUTHOR_STORAGE_KEY, JSON.stringify({ share1: "1".repeat(24) }))
		mount()
		const sent: Record<string, unknown>[] = []
		vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
			const body = JSON.parse(String(init.body)) as Record<string, unknown>
			sent.push(body)
			return new Response(
				JSON.stringify({
					comment: comment({
						id: "s11111111111",
						elementId: "validate",
						elementIds: ["validate"],
						body: String(body.body),
					}),
				}),
				{ status: 201 },
			)
		})
		const thread = await panel.startThread({
			elementId: "validate",
			elementLabel: "Validate Order",
			body: "AI review: Add a timeout — the task can wait forever.",
		})
		expect(thread?.root.id).toBe("s11111111111")
		expect(thread?.replies).toEqual([])
		expect(sent[0]).toMatchObject({
			filename: "order.bpmn",
			elementId: "validate",
			elementLabel: "Validate Order",
			body: "AI review: Add a timeout — the task can wait forever.",
			name: "Ben",
		})
	})

	it("starts no thread without a name, and says so", async () => {
		const q = mount()
		const fetched = vi.fn()
		vi.stubGlobal("fetch", fetched)
		expect(await panel.startThread({ body: "AI review: x" })).toBeNull()
		expect(fetched).not.toHaveBeenCalled()
		expect(q("c").querySelector(".cm-status")?.textContent).toContain("Add your name first")
	})

	it("does not resolve a thread it could not reply to", async () => {
		localStorage.setItem("bpmnkit-drop-name", "Ben")
		localStorage.setItem(AUTHOR_STORAGE_KEY, JSON.stringify({ share1: "1".repeat(24) }))
		mount()
		panel.receive(comment({ id: "a11111111111" }))
		const methods: string[] = []
		vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
			methods.push(String(init.method))
			return new Response(JSON.stringify({ error: "too many" }), { status: 429 })
		})
		expect(await panel.reply("a11111111111", "x", true)).toBe(false)
		expect(methods).toEqual(["POST"])
	})
})

function suggestion(over: Partial<SuggestionView>): SuggestionView {
	return {
		id: "sug111111111",
		filename: "order.bpmn",
		threadIds: ["a11111111111"],
		script: "validate[service Check Order]\n@1 validate",
		aliases: writeProcessText(Bpmn.parse(XML)).aliases,
		baseHash: semanticHash(Bpmn.parse(XML)),
		authorName: "Ben",
		authorId: "bbbbbbbbbbbbbbbb",
		createdAt: 2,
		status: "open",
		closedAt: null,
		closedBy: null,
		...over,
	}
}

describe("shared suggestions in the comments panel", () => {
	const TOKEN = "1".repeat(24)
	let reviewed: SuggestionView[]
	let host: HTMLElement
	let panel: CommentsPanel
	const canvas = {
		overlays: { add: () => "1", remove: () => {} },
		highlight: vi.fn(),
		clearHighlights: vi.fn(),
	} as unknown as BpmnCanvas

	function mount() {
		host = document.createElement("div")
		host.innerHTML = `<button id="t"></button><aside id="p" hidden><div id="l"></div><footer id="c"></footer></aside>
			<div id="n" hidden><span id="nt"></span><button id="no"></button></div>`
		document.body.replaceChildren(host)
		const q = <T extends HTMLElement>(id: string) => host.querySelector(`#${id}`) as T
		panel = new CommentsPanel({
			shareId: "share1",
			readOnly: null,
			toggle: q("t"),
			panel: q("p"),
			list: q("l"),
			compose: q("c"),
			notice: { box: q("n"), text: q("nt"), open: q("no") },
			challenge: async () => ({ ok: true, token: null }),
			announceName: () => {},
			aiEdit: () => {},
			reviewSuggestion: (s) => reviewed.push(s),
		})
		panel.setFile({ filename: "order.bpmn", kind: "bpmn" })
		panel.showOn(canvas, Bpmn.parse(XML))
		panel.open()
		panel.receive(comment({ id: "a11111111111", elementId: "validate" }))
		panel.receive(comment({ id: "a22222222222", createdAt: 2 }))
		return q("l")
	}

	const cards = (list: HTMLElement) => [...list.querySelectorAll<HTMLElement>(".cm-suggestion")]
	const buttons = (root: HTMLElement) =>
		[...root.querySelectorAll("button")].map((b) => b.textContent)

	beforeEach(() => {
		reviewed = []
		localStorage.clear()
		localStorage.setItem("bpmnkit-drop-name", "Ben")
		localStorage.setItem(AUTHOR_STORAGE_KEY, JSON.stringify({ share1: TOKEN }))
	})

	afterEach(() => vi.unstubAllGlobals())

	it("shows an open suggestion on each thread it answers, with Review", () => {
		const list = mount()
		panel.receiveSuggestion(suggestion({ threadIds: ["a11111111111", "a22222222222"] }))
		const shown = cards(list)
		expect(shown).toHaveLength(2)
		expect(shown[0]?.textContent).toContain("Suggested change")
		expect(shown[0]?.textContent).toContain("Also answers 1 other thread")
		expect(buttons(shown[0] as HTMLElement)).toEqual(["Review"])
		;(shown[0]?.querySelector("button") as HTMLButtonElement).click()
		expect(reviewed.map((s) => s.id)).toEqual(["sug111111111"])
	})

	it("offers its author Withdraw, says who applied one, and hides a withdrawn one", async () => {
		const list = mount()
		const mine = await authorIdFromToken(TOKEN)
		await vi.waitFor(() => {
			panel.receiveSuggestion(suggestion({ authorId: mine }))
			expect(buttons(cards(list)[0] as HTMLElement)).toEqual(["Review", "Withdraw"])
		})
		panel.receiveSuggestion(
			suggestion({ authorId: mine, status: "applied", closedAt: 3, closedBy: "Carla" }),
		)
		expect(cards(list)[0]?.textContent).toContain("Applied by Carla")
		expect(buttons(cards(list)[0] as HTMLElement)).toEqual([])
		panel.receiveSuggestion(suggestion({ status: "withdrawn", closedAt: 4, closedBy: "Ben" }))
		expect(cards(list)).toHaveLength(0)
	})

	it("shares a proposal and marks a suggestion applied, under the stored name and token", async () => {
		mount()
		const sent: { method: string; url: string; body: Record<string, unknown> }[] = []
		vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
			const body = JSON.parse(String(init.body)) as Record<string, unknown>
			sent.push({ method: String(init.method), url, body })
			const answer =
				init.method === "POST"
					? suggestion({})
					: suggestion({ status: "applied", closedAt: 3, closedBy: "Ben" })
			return new Response(JSON.stringify({ suggestion: answer }), { status: 201 })
		})
		const shared = await panel.shareSuggestion({
			filename: "order.bpmn",
			threadIds: ["a11111111111"],
			script: "validate[service Check Order]",
			aliases: {},
			baseHash: "a".repeat(64),
		})
		expect(shared?.id).toBe("sug111111111")
		expect(await panel.markSuggestion("sug111111111", "applied")).toBe(true)
		expect(sent.map((s) => [s.method, s.url])).toEqual([
			["POST", "/drop/api/suggestions/share1"],
			["PATCH", "/drop/api/suggestions/share1/sug111111111"],
		])
		expect(sent[0]?.body).toMatchObject({ threadIds: ["a11111111111"], name: "Ben" })
		expect(sent[1]?.body).toEqual({ status: "applied", name: "Ben" })
	})

	it("numbers a suggestion's threads in its order, with a gap for one deleted since", () => {
		mount()
		const threads = panel.threadsOf(
			suggestion({ threadIds: ["a22222222222", "a99999999999", "a11111111111"] }),
		)
		expect(threads.map((t) => t?.root.id ?? null)).toEqual(["a22222222222", null, "a11111111111"])
	})
})

describe("reviewing a shared suggestion", () => {
	function open(
		over: Partial<AiEditOptions> = {},
		review: Partial<NonNullable<AiEditOptions["review"]>> = {},
	) {
		document.body.replaceChildren()
		const applied = vi.fn(async () => true)
		const replies: string[] = []
		const s = suggestion({})
		const fetched = vi.fn()
		vi.stubGlobal("fetch", fetched)
		openAiEdit({
			shareId: "share1",
			filename: "order.bpmn",
			threads: [thread({ id: "a11111111111", elementId: "validate" })],
			xml: XML,
			theme: "light",
			turnstile: false,
			challenge: async () => ({ ok: true, token: null }),
			currentXml: () => XML,
			review: {
				authorName: s.authorName,
				script: s.script,
				aliases: s.aliases,
				baseHash: s.baseHash,
				applied,
				...review,
			},
			reply: async (id) => {
				replies.push(id)
				return true
			},
			notice: () => {},
			...over,
		})
		const dialog = document.querySelector("dialog") as HTMLDialogElement
		const labels = () => [...dialog.querySelectorAll("button")].map((b) => b.textContent)
		const press = (label: string) =>
			[...dialog.querySelectorAll("button")].find((b) => b.textContent === label)?.click()
		return { dialog, labels, press, applied, replies, fetched }
	}

	afterEach(() => vi.unstubAllGlobals())

	it("works the script out without asking the AI, and a reader cannot apply it", () => {
		const { dialog, labels, fetched } = open()
		expect(fetched).not.toHaveBeenCalled()
		expect(dialog.querySelector(".ts-title")?.textContent).toBe("Suggested change · 1 thread")
		const status = dialog.querySelector(".ae-status")?.textContent ?? ""
		expect(status).toContain("Suggested by Ben")
		expect(status).toContain("Press Edit to apply it")
		expect(status).not.toContain("earlier version")
		expect(dialog.textContent).toContain("Check Order")
		expect(labels()).toEqual(["×", "Close"])
	})

	it("says when it was made on an earlier version", () => {
		const { dialog } = open({}, { baseHash: "f".repeat(64) })
		expect(dialog.querySelector(".ae-status")?.textContent).toContain("on an earlier version")
	})

	it("applies it in the editor, replies on its threads, and records it applied", async () => {
		const apply = vi.fn()
		const { labels, press, applied, replies } = open({ apply })
		expect(labels()).toEqual(["×", "Close", "Apply"])
		press("Apply")
		await vi.waitFor(() => expect(applied).toHaveBeenCalledOnce())
		expect(apply).toHaveBeenCalledOnce()
		expect(replies).toEqual(["a11111111111"])
	})
})
