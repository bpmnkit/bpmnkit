/**
 * The editor's AI chat: say what to change, and the diagram being edited changes.
 *
 * Loaded with `import()` the first time "Ask AI" is pressed, like the editor and
 * the AI changes from comments, whose route and applier it shares:
 *
 * 1. The request goes to `POST /drop/api/ai-edit` as the one feedback item, on
 *    the elements selected when it was sent (none: the whole diagram), with the
 *    editor's document.
 * 2. The change script that streams back is applied here with the layout kept
 *    (`applyProcessDelta`), so hand edits and positions survive — unlike the
 *    describe-to-diagram generator, which writes the whole diagram again.
 * 3. The result is one editor change, made at once: the requester asked for it
 *    in their own words, the room checks it like any edit, and Undo reverts it.
 *    The answer says what changed, and what deserves a careful look.
 *
 * Each request stands alone: the model reads the diagram as it is now, which
 * already holds every earlier answer that was kept.
 */
import { Bpmn, type BpmnDefinitions, parseProcessDelta } from "@bpmnkit/core"
import { applyProcessDelta } from "@bpmnkit/editor/headless"
import { MAX_CHANGE_CHARS, MIN_CHANGE_CHARS } from "../lib/generate.js"
import { type Answer, postAiEdit, readAnswer, readCode, summarise, writeCode } from "./ai-edit.js"
import type { Challenge } from "./comments.js"

/** The editor as the chat needs it, or null once editing has ended. */
export interface ChatTarget {
	filename: string
	xml(): string
	selection(): string[]
	apply(defs: BpmnDefinitions): void
}

export interface AiChatOptions {
	shareId: string
	/** The panel's scrolling body, where the exchanges go. */
	log: HTMLElement
	/** The panel's footer, where the request is typed. */
	compose: HTMLElement
	/** The deployment challenges AI requests (a Turnstile site key is set). */
	turnstile: boolean
	challenge: Challenge
	/** The editor now; null when the page is not editing. */
	target(): ChatTarget | null
}

export interface AiChat {
	focus(): void
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

function list(items: readonly string[]): HTMLUListElement {
	const ul = el("ul", "ae-list")
	for (const item of items) ul.append(el("li", "", item))
	return ul
}

/** The selected ids that are elements of the process, by name: what a request can be about. */
function selectedElements(defs: BpmnDefinitions, ids: readonly string[]) {
	const elements = new Map((defs.processes[0]?.flowElements ?? []).map((e) => [e.id, e]))
	return ids.flatMap((id) => {
		const found = elements.get(id)
		return found ? [{ id, label: found.name || id }] : []
	})
}

export function mountAiChat(opts: AiChatOptions): AiChat {
	const area = el("textarea", "cm-text")
	area.rows = 3
	area.maxLength = MAX_CHANGE_CHARS
	area.placeholder =
		"Say what to change, e.g. a manager approves orders over 5000. Select elements first to ask about them."
	area.setAttribute("aria-label", "Ask the AI to change the diagram")
	const sendButton = el("button", "hv-btn hv-btn--go", "Send")
	sendButton.type = "button"
	const actions = el("div", "cm-actions")
	actions.append(sendButton)
	opts.compose.replaceChildren(area, actions)

	if (opts.log.childElementCount === 0) {
		opts.log.append(
			el(
				"div",
				"ai-msg",
				"Ask for a change and it is made in the editor — Undo reverts it. The AI reads the diagram as it is now.",
			),
		)
	}

	let running: AbortController | null = null

	const scroll = () => {
		opts.log.scrollTop = opts.log.scrollHeight
	}

	/** Asks for the access code in the log, then sends `request` again. */
	function askForCode(invalid: boolean, request: string, reply: HTMLElement): void {
		const input = el("input", "cm-name")
		input.type = "password"
		input.placeholder = "Access code"
		input.autocomplete = "off"
		const unlock = el("button", "hv-btn hv-btn--go", "Unlock")
		unlock.type = "button"
		const go = () => {
			const code = input.value.trim()
			if (!code) return
			writeCode(code)
			reply.remove()
			void send(request)
		}
		unlock.addEventListener("click", go)
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") go()
		})
		reply.replaceChildren(
			el(
				"div",
				"ai-msg",
				invalid
					? "That access code was not accepted. Try again."
					: "AI changes are in a closed beta. Enter your access code.",
			),
			input,
			unlock,
		)
		input.focus()
	}

	async function send(request: string): Promise<void> {
		const target = opts.target()
		if (!target) return
		const xml = target.xml()
		const before = Bpmn.parse(xml)
		const about = selectedElements(before, target.selection())

		const exchange = el("div", "cm-thread")
		exchange.append(
			el(
				"div",
				"cm-anchor",
				about.length === 0
					? "You · whole diagram"
					: `You · ${about[0]?.label}${about.length > 1 ? ` + ${about.length - 1} more` : ""}`,
			),
			el("div", "cm-body", request),
		)
		const reply = el("div")
		exchange.append(reply)
		opts.log.append(exchange)
		scroll()

		const code = readCode()
		if (!code) return askForCode(false, request, reply)

		running?.abort()
		const controller = new AbortController()
		running = controller
		sendButton.disabled = true
		const status = el("div", "ai-msg")
		status.setAttribute("role", "status")
		reply.replaceChildren(status)
		const started = performance.now()
		let lines = 0
		const tick = () => {
			const seconds = Math.round((performance.now() - started) / 1000)
			status.textContent = `Working… ${seconds}s${lines > 0 ? ` · ${lines} line${lines === 1 ? "" : "s"}` : ""}`
		}
		tick()
		const ticker = setInterval(tick, 1000)
		let answer: Answer
		try {
			const res = await postAiEdit(
				{ ...opts, filename: target.filename, xml },
				{ request, elementIds: about.map((a) => a.id) },
				code,
				controller.signal,
				"One check before the AI changes this",
			)
			if (res === null) {
				answer = { ok: false, error: "Cancelled — the AI needs that check first." }
			} else {
				answer = await readAnswer(res, (script) => {
					lines = script.trimEnd().split("\n").length
					tick()
				})
			}
		} catch {
			if (controller.signal.aborted) return
			answer = { ok: false, error: "Network error — please try again." }
		} finally {
			clearInterval(ticker)
			if (running === controller) {
				running = null
				sendButton.disabled = false
			}
		}
		if (controller.signal.aborted) return
		if (!answer.ok) {
			if (answer.status === 401) {
				writeCode(null)
				return askForCode(true, request, reply)
			}
			status.textContent = answer.error
			return scroll()
		}

		const result = applyProcessDelta(before, parseProcessDelta(answer.script), {
			aliases: answer.aliases,
		})
		const summary = summarise(before, result, [])
		const now = opts.target()
		// The answer was worked out on the document the AI read: if it changed since,
		// or editing ended, it no longer fits.
		if (summary.empty) {
			status.textContent = "No change — the AI found nothing to do for this."
		} else if (!now || now.filename !== target.filename || now.xml() !== xml) {
			status.textContent = "The diagram changed while the AI was working — ask again."
		} else {
			now.apply(result.definitions)
			status.textContent = `Changed${answer.cached ? " (answered before)" : ""} — Undo in the editor reverts it.`
			reply.append(list(summary.unclaimed))
			if (summary.review.length > 0) {
				reply.append(el("div", "ai-label", "Look closely"), list(summary.review))
			}
		}
		if (summary.problems.length > 0) {
			reply.append(el("div", "ai-label", "Left out"), list(summary.problems))
		}
		scroll()
	}

	const submit = () => {
		const request = area.value.trim()
		if (request.length < MIN_CHANGE_CHARS) return area.focus()
		area.value = ""
		void send(request)
	}
	sendButton.addEventListener("click", submit)
	area.addEventListener("keydown", (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			submit()
		}
	})

	return { focus: () => area.focus() }
}
