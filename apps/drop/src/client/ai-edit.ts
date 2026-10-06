/**
 * Changes from review comments, on the writer's page.
 *
 * Loaded with `import()` the first time someone asks, like the editor: almost
 * nobody who opens a drop uses it. The flow is the analysis' §6:
 *
 * 1. The page posts the editor's document and the chosen threads; the route
 *    streams a change script back (`routes/ai-edit.ts`).
 * 2. The script is applied **here**, to that same document, with the layout
 *    kept (`applyProcessDelta`). Nothing has changed yet: the result is a
 *    proposal, drawn in a dialog with what it does to each thread and what
 *    deserves a careful look.
 * 3. Only **Apply** changes the drop: one editor change, which the room checks
 *    like any other edit and the editor can undo. Then each thread the change
 *    answers gets a reply saying what was done, and is resolved if the box is
 *    ticked.
 *
 * A proposal is private to the person who asked until they apply it
 * (`doc/drop-ai-feedback-edits-analysis.md` §10) — or share it on its threads
 * as a suggested change. The same dialog reviews a shared suggestion: its
 * script is worked out again against the reader's document, so what it shows
 * is what applying it would do (§16).
 */
import { BpmnCanvas } from "@bpmnkit/canvas"
import {
	Bpmn,
	type BpmnDefinitions,
	type BpmnFlowElement,
	parseProcessDelta,
	semanticHash,
} from "@bpmnkit/core"
import { type ApplyProcessDeltaResult, applyProcessDelta } from "@bpmnkit/editor/headless"
import type { FeedbackEvent } from "../lib/feedback.js"
import { createSseReader } from "../lib/generate.js"
import { AI_CODE_STORAGE_KEY, AI_PASS_HEADER } from "../shared/constants.js"
import { type Challenge, type Thread, anchorsOf } from "./comments.js"

// ── What a proposal does, in words ──────────────────────────────────────────

/** One thread's part of a proposal. */
export interface ThreadSummary {
	thread: Thread
	/** Its number in the request: what the script's `@n` lines refer to. */
	n: number
	/** The changes the script says answer it, in words. */
	changes: string[]
}

/** A proposal, as the dialog shows it and the replies say it. */
export interface ProposalSummary {
	threads: ThreadSummary[]
	/** Changes worth a careful look whatever thread asked: removals, conditions, job types. */
	review: string[]
	/** Changes no `@` line claims. */
	unclaimed: string[]
	/** What the script asked for and could not be done. */
	problems: string[]
	/** What was done that the script did not say outright. */
	fixes: string[]
	/** Nothing changes. */
	empty: boolean
}

const elementsOf = (defs: BpmnDefinitions) =>
	new Map((defs.processes[0]?.flowElements ?? []).map((el) => [el.id, el]))

/** `userTask` → "user task". */
function kind(type: string): string {
	return type.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()
}

const named = (el: BpmnFlowElement | undefined, id: string) => `"${el?.name || id}"`

function jobType(el: BpmnFlowElement | undefined): string | undefined {
	return el?.extensionElements.find((e) => e.name === "zeebe:taskDefinition")?.attributes.type
}

/**
 * Says what `result` does to `before`, thread by thread.
 *
 * Every change is described from the two documents, never from the script:
 * what the reader approves is what Apply will do.
 */
export function summarise(
	before: BpmnDefinitions,
	result: ApplyProcessDeltaResult,
	threads: readonly Thread[],
): ProposalSummary {
	const was = elementsOf(before)
	const now = elementsOf(result.definitions)

	const flowsOut = (defs: BpmnDefinitions, id: string) =>
		new Map(
			(defs.processes[0]?.sequenceFlows ?? [])
				.filter((f) => f.sourceRef === id)
				.map((f) => [f.id, f]),
		)
	const defaultOf = (el: BpmnFlowElement | undefined) =>
		el && "default" in el ? (el.default as string | undefined) : undefined

	/** What changed on the flows out of an element the script restated: a default, a condition, a label. */
	const branchChanges = (id: string): string[] => {
		const earlier = flowsOut(before, id)
		const parts: string[] = []
		const target = (ref: string) => named(now.get(ref) ?? was.get(ref), ref)
		for (const [flowId, flow] of flowsOut(result.definitions, id)) {
			const old = earlier.get(flowId)
			if (!old) continue
			const condition = flow.conditionExpression?.text
			if (condition !== undefined && condition !== old.conditionExpression?.text) {
				parts.push(
					`set the condition to ${target(flow.targetRef)}: ${condition.replace(/^=\s*/, "")}`,
				)
			}
			if ((flow.name ?? "") !== (old.name ?? "") && flow.name) {
				parts.push(`labelled the branch to ${target(flow.targetRef)} "${flow.name}"`)
			}
		}
		const newDefault = defaultOf(now.get(id))
		if (newDefault !== undefined && newDefault !== defaultOf(was.get(id))) {
			const flow = flowsOut(result.definitions, id).get(newDefault)
			if (flow)
				parts.push(
					`made the branch to ${target(flow.targetRef)} the default of ${named(now.get(id), id)}`,
				)
		}
		return parts
	}

	const describe = (id: string): string | null => {
		const old = was.get(id)
		const cur = now.get(id)
		if (!old && cur) return `Added ${kind(cur.type)} ${named(cur, id)}`
		if (old && !cur) return `Removed ${kind(old.type)} ${named(old, id)}`
		if (!old || !cur) return null
		const parts: string[] = []
		if (old.type !== cur.type) parts.push(`made ${named(old, id)} a ${kind(cur.type)}`)
		if ((old.name ?? "") !== (cur.name ?? "")) {
			parts.push(`renamed ${named(old, id)} to ${named(cur, id)}`)
		}
		parts.push(...branchChanges(id))
		if (parts.length === 0) parts.push(`changed ${named(cur, id)}`)
		const text = parts.join(", ")
		return text.charAt(0).toUpperCase() + text.slice(1)
	}

	const touched = [...result.created, ...result.changed, ...result.removed]
	const claimed = new Set<string>()
	const summaries = threads.map((thread, k): ThreadSummary => {
		const ids = [...new Set(result.addressed.get(k + 1) ?? [])].filter((id) => touched.includes(id))
		for (const id of ids) claimed.add(id)
		return {
			thread,
			n: k + 1,
			changes: ids.map(describe).filter((text): text is string => text !== null),
		}
	})

	const review: string[] = []
	for (const id of result.removed) review.push(`Removes ${named(was.get(id), id)}`)
	const oldFlows = new Map(
		(before.processes[0]?.sequenceFlows ?? []).map((f) => [f.id, f.conditionExpression?.text]),
	)
	for (const flow of result.definitions.processes[0]?.sequenceFlows ?? []) {
		const condition = flow.conditionExpression?.text
		if (condition === undefined || oldFlows.get(flow.id) === condition) continue
		review.push(
			`Condition ${named(now.get(flow.sourceRef), flow.sourceRef)} → ${named(now.get(flow.targetRef), flow.targetRef)}: ${condition.replace(/^=\s*/, "")}`,
		)
	}
	for (const [id, cur] of now) {
		const type = jobType(cur)
		if (type !== undefined && type !== jobType(was.get(id))) {
			review.push(`Job type of ${named(cur, id)}: ${type}`)
		}
	}

	return {
		threads: summaries,
		review,
		unclaimed: touched
			.filter((id) => !claimed.has(id))
			.map(describe)
			.filter((text): text is string => text !== null),
		problems: result.problems.map((p) => p.message),
		fixes: result.fixes,
		empty: touched.length === 0,
	}
}

/** The reply a thread gets when the change that answers it is applied. */
export function replyText(summary: ThreadSummary): string {
	const text = `Changed with AI: ${summary.changes.join("; ")}.`
	return text.length > 1_900 ? `${text.slice(0, 1_897)}…` : text
}

// ── The request ─────────────────────────────────────────────────────────────

/** What the route answered: the script and the ids it resolves against, or why not. */
export type Answer =
	| { ok: true; aliases: Record<string, string>; script: string; cached: boolean }
	| { ok: false; error: string; status?: number }

/** Reads the route's event stream. `onText` sees the script as it arrives. */
export async function readAnswer(res: Response, onText: (script: string) => void): Promise<Answer> {
	if (!res.ok || !res.body) {
		const payload = (await res.json().catch(() => null)) as { error?: string } | null
		return {
			ok: false,
			status: res.status,
			error: payload?.error ?? "The AI could not be asked. Please try again.",
		}
	}
	const sse = createSseReader()
	const decoder = new TextDecoder()
	let aliases: Record<string, string> | null = null
	let script = ""
	let outcome: FeedbackEvent | null = null
	try {
		// A reader loop rather than `for await`: Safari streams have no async iterator.
		const reader = res.body.getReader()
		for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
			for (const data of sse.push(decoder.decode(chunk.value, { stream: true }))) {
				const event = JSON.parse(data) as FeedbackEvent
				if ("aliases" in event) aliases = event.aliases
				else if ("text" in event) {
					script += event.text
					onText(script)
				} else outcome = event
			}
		}
	} catch {
		return { ok: false, error: "The connection dropped. Please try again." }
	}
	if (!outcome || "error" in outcome || aliases === null) {
		return {
			ok: false,
			error: outcome && "error" in outcome ? outcome.error : "No answer came back.",
		}
	}
	return { ok: true, aliases, script, cached: "done" in outcome && outcome.cached }
}

export function readCode(): string | null {
	try {
		return localStorage.getItem(AI_CODE_STORAGE_KEY)
	} catch {
		return null
	}
}

export function writeCode(code: string | null): void {
	try {
		if (code === null) localStorage.removeItem(AI_CODE_STORAGE_KEY)
		else localStorage.setItem(AI_CODE_STORAGE_KEY, code)
	} catch {
		// Not remembered: asked again next visit.
	}
}

/** The pass a solved challenge earned, for this visit (see `lib/ai-pass.ts`). */
let pass: string | null = null

/**
 * Posts to the AI-changes route, with the challenge first when the deployment
 * asks and the page holds no pass, and once more when the route refuses it.
 *
 * @returns The response, or `null` when the reader closed the challenge.
 */
export async function postAiEdit(
	to: {
		shareId: string
		filename: string
		xml: string
		turnstile: boolean
		challenge: Challenge
	},
	body: Record<string, unknown>,
	code: string,
	signal: AbortSignal,
	title: string,
): Promise<Response | null> {
	const post = (token?: string) =>
		fetch(`/drop/api/ai-edit/${to.shareId}/${encodeURIComponent(to.filename)}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Drop-AI-Code": code,
				...(pass ? { [AI_PASS_HEADER]: pass } : {}),
			},
			body: JSON.stringify({ xml: to.xml, ...body, ...(token ? { token } : {}) }),
			signal,
		})
	const solve = async () => {
		const verified = await to.challenge(title)
		return verified.ok ? (verified.token ?? undefined) : null
	}
	let res: Response
	if (to.turnstile && pass === null) {
		const token = await solve()
		if (token === null) return null
		res = await post(token)
	} else {
		res = await post()
		if (res.status === 403 && to.turnstile) {
			pass = null
			const token = await solve()
			if (token === null) return null
			res = await post(token)
		}
	}
	const issued = res.headers.get(AI_PASS_HEADER)
	if (issued) pass = issued
	return res
}

// ── The dialog ──────────────────────────────────────────────────────────────

export interface AiEditOptions {
	shareId: string
	filename: string
	/** The threads to answer, in the order they are numbered. */
	threads: Thread[]
	/** The editor's document when the request was made; the shown one when reviewing. */
	xml: string
	theme: "light" | "dark"
	/** The deployment challenges AI requests (a Turnstile site key is set). */
	turnstile: boolean
	challenge: Challenge
	/** The editor's document now, or null when the editor has closed. */
	currentXml(): string | null
	/**
	 * Makes the change in the editor: one edit, checked by the room. Absent when
	 * the reader is not editing — a suggestion can be reviewed, not applied.
	 */
	apply?(defs: BpmnDefinitions): void
	/**
	 * Shares a fresh proposal on its threads as a suggested change, so the
	 * reviewers can see it before it is applied. Answers whether it was shared.
	 */
	share?(proposal: {
		threadIds: string[]
		script: string
		aliases: Record<string, string>
		baseHash: string
	}): Promise<boolean>
	/**
	 * Review a shared suggestion instead of asking the AI: its script is worked
	 * out against `xml` here, as a fresh answer would be. `applied` records it
	 * once the change is made.
	 */
	review?: {
		authorName: string
		script: string
		aliases: Record<string, string>
		baseHash: string
		applied(): Promise<boolean>
	}
	/** Posts a reply on a thread, and resolves it if asked. Answers whether the reply went. */
	reply(threadId: string, body: string, resolve: boolean): Promise<boolean>
	/** A short message on the page, after the dialog has closed. */
	notice(text: string): void
}

function el<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className = "",
	text?: string,
): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag)
	if (className) node.className = className
	if (text !== undefined) node.textContent = text
	return node
}

function button(text: string, onClick: () => void, className = "hv-btn"): HTMLButtonElement {
	const b = el("button", className, text)
	b.type = "button"
	b.addEventListener("click", onClick)
	return b
}

function list(items: readonly string[]): HTMLUListElement {
	const ul = el("ul", "ae-list")
	for (const item of items) ul.append(el("li", "", item))
	return ul
}

/** " + 2 more" for a thread on several elements. */
function more(root: Thread["root"]): string {
	const extra = anchorsOf(root).length - 1
	return extra > 0 ? ` + ${extra} more` : ""
}

/** Opens the dialog and asks straight away. */
export function openAiEdit(opts: AiEditOptions): void {
	const before = Bpmn.parse(opts.xml)
	const dialog = el("dialog", "ts-dialog ae-dialog")
	const review = opts.review
	const title = review ? "Suggested change" : "AI changes"
	dialog.setAttribute("aria-label", title)
	const head = el("div", "ae-head")
	head.append(
		el(
			"span",
			"ts-title",
			`${title} · ${opts.threads.length} thread${opts.threads.length === 1 ? "" : "s"}`,
		),
		button("×", () => dialog.close(), "ai-x"),
	)
	const status = el("div", "ai-msg ae-status")
	status.setAttribute("role", "status")
	const preview = el("div", "ae-preview")
	const body = el("div", "ae-body")
	const foot = el("div", "ae-foot")
	dialog.append(head, status, preview, body, foot)
	document.body.append(dialog)
	let canvas: BpmnCanvas | null = null
	let running: AbortController | null = null
	dialog.addEventListener("close", () => {
		running?.abort()
		canvas?.destroy()
		dialog.remove()
	})
	dialog.showModal()

	const askForCode = (invalid: boolean, hint: string) => {
		const input = el("input", "cm-name")
		input.type = "password"
		input.placeholder = "Access code"
		input.autocomplete = "off"
		const go = () => {
			const code = input.value.trim()
			if (!code) return
			writeCode(code)
			void ask(hint)
		}
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") go()
		})
		status.textContent = invalid
			? "That access code was not accepted. Try again."
			: "AI changes are in a closed beta. Enter your access code."
		body.replaceChildren(input)
		foot.replaceChildren(button("Unlock", go, "hv-btn hv-btn--go"))
		input.focus()
	}

	const send = (code: string, hint: string, signal: AbortSignal) =>
		postAiEdit(
			opts,
			{ threadIds: opts.threads.map((t) => t.root.id), ...(hint ? { hint } : {}) },
			code,
			signal,
			"One check before the AI changes this",
		)

	async function ask(hint = ""): Promise<void> {
		const code = readCode()
		if (!code) return askForCode(false, hint)
		running?.abort()
		const controller = new AbortController()
		running = controller
		body.replaceChildren()
		foot.replaceChildren(button("Cancel", () => dialog.close()))
		const started = performance.now()
		let lines = 0
		const tick = () => {
			const seconds = Math.round((performance.now() - started) / 1000)
			status.textContent = `Reading the threads… ${seconds}s${lines > 0 ? ` · ${lines} line${lines === 1 ? "" : "s"}` : ""}`
		}
		tick()
		const ticker = setInterval(tick, 1000)
		let answer: Answer
		try {
			const res = await send(code, hint, controller.signal)
			if (res === null) {
				status.textContent = "Cancelled — the AI needs that check first."
				foot.replaceChildren(
					button("Try again", () => void ask(hint)),
					button("Close", () => dialog.close()),
				)
				return
			}
			answer = await readAnswer(res, (script) => {
				lines = script.trimEnd().split("\n").length
				tick()
			})
		} catch {
			if (controller.signal.aborted) return
			answer = { ok: false, error: "Network error — please try again." }
		} finally {
			clearInterval(ticker)
		}
		if (controller.signal.aborted) return
		if (!answer.ok) {
			if (answer.status === 401) {
				writeCode(null)
				return askForCode(true, hint)
			}
			status.textContent = answer.error
			foot.replaceChildren(
				button("Try again", () => void ask(hint)),
				button("Close", () => dialog.close()),
			)
			return
		}
		propose(answer, hint)
	}

	function propose(answer: Extract<Answer, { ok: true }>, hint: string): void {
		const result = applyProcessDelta(before, parseProcessDelta(answer.script), {
			aliases: answer.aliases,
		})
		const summary = summarise(before, result, opts.threads)
		if (review) {
			const earlier = semanticHash(before) !== review.baseHash
			status.textContent = summary.empty
				? `Suggested by ${review.authorName} — it changes nothing on this version.`
				: `Suggested by ${review.authorName}${earlier ? ", on an earlier version — check it still fits" : ""}. ${opts.apply ? "Nothing is changed until you apply it." : "Press Edit to apply it."}`
		} else {
			status.textContent = summary.empty
				? "The AI proposes no change."
				: `Proposed change${answer.cached ? " (answered before)" : ""} — nothing is changed until you apply it.`
		}

		canvas?.destroy()
		canvas = null
		preview.replaceChildren()
		if (!summary.empty) {
			canvas = new BpmnCanvas({ container: preview, theme: opts.theme, fit: "contain" })
			const drawn = canvas
			drawn.on("diagram:load", () => {
				drawn.highlight(result.created, "new")
				drawn.highlight(result.changed, "changed")
			})
			drawn.loadDefinitions(result.definitions)
		}

		body.replaceChildren()
		if (summary.review.length > 0) {
			body.append(el("div", "ai-label", "Look closely"), list(summary.review))
		}
		for (const t of summary.threads) {
			const box = el("div", "ae-thread")
			const root = t.thread.root
			box.append(
				el(
					"div",
					"cm-anchor",
					`${t.n}. ${root.elementLabel ?? (root.elementId === null ? "Whole file" : root.elementId)}${more(root)}`,
				),
				el("div", "cm-body", `${root.authorName}: ${root.body}`),
			)
			box.append(
				t.changes.length > 0
					? list(t.changes)
					: el("div", "ai-msg", "Not answered — no change for this thread."),
			)
			body.append(box)
		}
		if (summary.unclaimed.length > 0) {
			body.append(el("div", "ai-label", "Not tied to a thread"), list(summary.unclaimed))
		}
		if (summary.problems.length > 0) {
			body.append(el("div", "ai-label", "Left out"), list(summary.problems))
		}
		// What the applier filled in is worth having, not worth reading first.
		if (summary.fixes.length > 0) {
			const details = el("details", "ae-details")
			details.append(
				el("summary", "ai-label", `Filled in (${summary.fixes.length})`),
				list(summary.fixes),
			)
			body.append(details)
		}

		const hintBox = el("input", "cm-name ae-hint")
		hintBox.placeholder = "Hint for another try (optional)"
		hintBox.maxLength = 500
		hintBox.value = hint
		const resolve = el("input")
		resolve.type = "checkbox"
		resolve.checked = true
		const resolveLabel = el("label", "ae-check")
		resolveLabel.append(resolve, " Resolve the threads it answers")

		const controls: HTMLElement[] = []
		if (!review) {
			controls.push(
				hintBox,
				button("Try again", () => void ask(hintBox.value.trim())),
			)
			if (opts.share && !summary.empty) {
				const share = opts.share
				const shareButton = button("Share as suggestion", () => {
					shareButton.disabled = true
					void share({
						threadIds: opts.threads.map((t) => t.root.id),
						script: answer.script,
						aliases: answer.aliases,
						baseHash: semanticHash(before),
					}).then((shared) => {
						if (!shared) {
							shareButton.disabled = false
							return
						}
						dialog.close()
						opts.notice("Shared on its threads as a suggested change.")
					})
				})
				controls.push(shareButton)
			}
		}
		controls.push(button(review ? "Close" : "Discard", () => dialog.close()))
		if (opts.apply) {
			const apply = button(
				"Apply",
				() => {
					void commit(result, summary, resolve.checked)
				},
				"hv-btn hv-btn--go",
			)
			apply.disabled = summary.empty
			controls.unshift(resolveLabel)
			controls.push(apply)
		}
		foot.replaceChildren(...controls)
	}

	async function commit(
		result: ApplyProcessDeltaResult,
		summary: ProposalSummary,
		resolve: boolean,
	): Promise<void> {
		// The proposal was worked out on the document the AI read. If the writer
		// changed it since — or the editor has closed — it no longer fits.
		if (opts.currentXml() !== opts.xml || !opts.apply) {
			status.textContent = review
				? "The diagram changed since this was opened. Close it and review the suggestion again."
				: "The diagram changed since the AI read it. Try again to get a proposal for this version."
			return
		}
		opts.apply(result.definitions)
		dialog.close()
		// A thread deleted since has nobody left to reply to.
		const answered = summary.threads.filter(
			(t) => t.changes.length > 0 && t.thread.root.deletedAt === null,
		)
		let replied = 0
		for (const t of answered) {
			if (await opts.reply(t.thread.root.id, replyText(t), resolve)) replied += 1
		}
		if (review) await review.applied()
		opts.notice(
			answered.length === 0
				? "Applied. No thread was answered, so none was replied to."
				: `Applied, and replied to ${replied} of ${answered.length} thread${answered.length === 1 ? "" : "s"}${resolve ? " — resolved" : ""}. Undo is in the editor.`,
		)
	}

	if (review) {
		propose({ ok: true, aliases: review.aliases, script: review.script, cached: false }, "")
	} else void ask()
}
