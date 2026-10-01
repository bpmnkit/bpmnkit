/**
 * Describe-to-diagram on `/drop`: type what a process should do, watch the
 * diagram being drawn, share it.
 *
 * The Worker streams the model's answer in the line format; each finished line
 * is parsed here and drawn at once, so the first shapes appear while the model
 * is still writing. The final diagram is parsed from the same text by the same
 * parser, so what is shared is exactly what was drawn.
 *
 * Once drawn, the draft can be changed: a change is sent with the description
 * and the draft's text, and the model writes the whole diagram again. The
 * guesses the parser had to make are asked as questions, and an answer is sent
 * as a change. Each change can be undone.
 *
 * A picture can stand in for the description: a whiteboard, sketch or photo,
 * picked or pasted, is scaled down and re-encoded as JPEG here, and the Worker
 * sends it to a vision model. Only the first draft reads the image; changes go
 * to the text model with the draft's text, like any other.
 *
 * Nothing is stored until the reader asks for a link. The diagram then goes
 * through `/drop/api/drops` as an ordinary `.bpmn` upload — same validation,
 * same Terms, same short link.
 */
import { BpmnCanvas } from "@bpmnkit/canvas"
import {
	Bpmn,
	type BpmnDefinitions,
	type ProcessTextQuestion,
	createProcessTextStream,
	expand,
	parseProcessText,
} from "@bpmnkit/core"
import {
	type GenerateEvent,
	IMAGE_MAX_SIDE,
	MAX_DESCRIPTION_CHARS,
	MAX_IMAGE_CHARS,
	MIN_CHANGE_CHARS,
	createSseReader,
} from "../lib/generate.js"
import { AI_CODE_STORAGE_KEY, AI_PASS_HEADER } from "../shared/constants.js"

// Short on purpose: a starting point for describing your own process.
const EXAMPLES: readonly { label: string; text: string }[] = [
	{
		label: "Expense approval",
		text: "An employee submits an expense. If it is over 1000, a manager reviews it; otherwise it is approved automatically. Then the payment is made. If the payment fails, notify finance.",
	},
	{
		label: "Order fulfillment",
		text: "When an order is placed, pick the items, pack the box and print the shipping label at the same time, then dispatch the package once all three are done.",
	},
	{
		label: "Support ticket",
		text: "A customer opens a ticket. Support triages it. Urgent tickets go straight to an engineer; others wait in the queue. If nobody answers within 2 days, escalate to the team lead. Close the ticket when it is resolved.",
	},
]

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null

function readCode(): string | null {
	try {
		return localStorage.getItem(AI_CODE_STORAGE_KEY)
	} catch {
		return null
	}
}

function writeCode(code: string | null): void {
	try {
		if (code === null) localStorage.removeItem(AI_CODE_STORAGE_KEY)
		else localStorage.setItem(AI_CODE_STORAGE_KEY, code)
	} catch {
		// private mode: the code lives in the input for this visit only
	}
}

/** The slice of Turnstile's global this page uses. */
interface Turnstile {
	render(
		el: HTMLElement,
		options: {
			sitekey: string
			callback(token: string): void
			"error-callback"?(): void
			"expired-callback"?(): void
		},
	): string
	remove(widgetId: string): void
}

/**
 * What a change is told the draft was made from, when it came from an image
 * alone: the change route needs a description, and the image is not sent again.
 */
const IMAGE_DESCRIPTION = "A process read from an image."

/**
 * Scales `file` down to {@link IMAGE_MAX_SIDE} and re-encodes it as a JPEG data
 * URL, lowering the quality once if it is still too large.
 *
 * @returns The data URL, or `null` when the browser cannot decode the file.
 */
async function readImage(file: Blob): Promise<string | null> {
	let bitmap: ImageBitmap
	try {
		bitmap = await createImageBitmap(file)
	} catch {
		return null
	}
	const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height))
	const canvas = document.createElement("canvas")
	canvas.width = Math.max(1, Math.round(bitmap.width * scale))
	canvas.height = Math.max(1, Math.round(bitmap.height * scale))
	const ctx = canvas.getContext("2d")
	if (!ctx) return null
	// JPEG has no transparency: a transparent screenshot would turn black.
	ctx.fillStyle = "#fff"
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
	bitmap.close()
	for (const quality of [0.85, 0.6]) {
		const url = canvas.toDataURL("image/jpeg", quality)
		if (url.length <= MAX_IMAGE_CHARS) return url
	}
	return null
}

/** Questions shown at once: past three, a reader stops reading them. */
const MAX_QUESTIONS = 3

/** A filename from the process name the model wrote, for the shared file. */
function fileName(defs: BpmnDefinitions): string {
	const name = defs.processes[0]?.name ?? "process"
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
	return `${slug || "process"}.bpmn`
}

export function mountGenerator(): void {
	const input = $<HTMLTextAreaElement>("genInput")
	const count = $("genCount")
	const run = $<HTMLButtonElement>("genRun")
	const share = $<HTMLButtonElement>("genShare")
	const status = $("genStatus")
	const name = $("genName")
	const host = $("genCanvas")
	const errors = $("genErrors")
	const passcode = $("genPasscode")
	const passcodeMsg = $("genPasscodeMsg")
	const codeInput = $<HTMLInputElement>("genCode")
	const out = $("genOut")
	const url = $<HTMLInputElement>("genUrl")
	const open = $<HTMLAnchorElement>("genOpen")
	const copy = $<HTMLButtonElement>("genCopy")
	const examples = $("genExamples")
	const refine = $("genRefine")
	const questions = $("genQuestions")
	const changeInput = $<HTMLInputElement>("genChange")
	const apply = $<HTMLButtonElement>("genApply")
	const undo = $<HTMLButtonElement>("genUndo")
	// Present only when the deployment drafts from images.
	const imagePick = $<HTMLButtonElement>("genImagePick")
	const imageFile = $<HTMLInputElement>("genImageFile")
	const imagePreview = $<HTMLImageElement>("genImagePreview")
	const imageNote = $("genImageNote")
	const imageClear = $<HTMLButtonElement>("genImageClear")
	if (
		!input ||
		!count ||
		!run ||
		!share ||
		!status ||
		!name ||
		!host ||
		!errors ||
		!passcode ||
		!passcodeMsg ||
		!codeInput ||
		!out ||
		!url ||
		!open ||
		!copy ||
		!refine ||
		!questions ||
		!changeInput ||
		!apply ||
		!undo
	) {
		return
	}

	let canvas: BpmnCanvas | null = null
	let running: AbortController | null = null
	/** Set when the deployment challenges describe-to-diagram; the page then carries the widget. */
	const sitekey = $("describe")?.dataset.turnstileKey
	/**
	 * The pass a solved challenge earned. Kept for this visit only: it is bound
	 * to the IP it was issued to and lasts half an hour anyway.
	 */
	let pass: string | null = null
	/** True while the reader is looking at the challenge, so the wait counter does not count it. */
	let confirming = false
	let result: { xml: string; file: string } | null = null
	/** The draft on screen, as the model wrote it: what a change is made to. */
	let draft: { description: string; text: string } | null = null
	/** Earlier texts of this draft, newest last, for Undo. */
	const earlier: string[] = []
	/** The image the next draft is read from, as the JPEG data URL sent. */
	let image: string | null = null
	/** The latest frame not yet drawn: frames arrive faster than a screen refreshes. */
	let pending: BpmnDefinitions | null = null

	function draw(defs: BpmnDefinitions): void {
		pending = defs
		requestAnimationFrame(() => {
			if (!pending || !host) return
			if (!canvas) {
				host.innerHTML = ""
				// Fitted here rather than by the canvas, so the fit can be capped below.
				canvas = new BpmnCanvas({ container: host, theme: "light", grid: true, fit: "none" })
			}
			canvas.loadDefinitions(pending)
			pending = null
			canvas.fitView()
			// Fitting the first two or three shapes to the panel draws them at poster
			// size, and every new line then shrinks them again. Never enlarge past 1:1.
			const { tx, ty, scale } = canvas.getViewport()
			if (scale > 1) {
				const cx = host.clientWidth / 2
				const cy = host.clientHeight / 2
				canvas.setViewport({ scale: 1, tx: cx - (cx - tx) / scale, ty: cy - (cy - ty) / scale })
			}
		})
	}

	/** The working indicator on the canvas: shown while a request runs, never in the way. */
	function setBusy(on: boolean): void {
		if (!host) return
		host.classList.toggle("busy", on)
		host.setAttribute("aria-busy", String(on))
	}

	function setStatus(text: string, busy = false): void {
		if (!status) return
		status.textContent = text
		status.classList.toggle("busy", busy)
	}

	function showError(message: string): void {
		if (!errors) return
		errors.textContent = message
		errors.classList.remove("hidden")
	}

	function askForCode(invalid: boolean): void {
		if (!passcode || !passcodeMsg || !codeInput) return
		passcodeMsg.textContent = invalid
			? "Invalid access code. Try again."
			: "This feature is in a closed beta. Enter your access code, then draft again."
		passcode.classList.toggle("err", invalid)
		passcode.hidden = false
		codeInput.focus()
	}

	/** Draws a finished answer, and asks what the parser had to guess. */
	function show(text: string): { ids: Set<string>; problems: number } {
		if (!name || !share || !refine || !undo) return { ids: new Set(), problems: 0 }
		const parsed = parseProcessText(text)
		const defs = expand(parsed.diagram)
		draw(defs)
		result = { xml: Bpmn.export(defs), file: fileName(defs) }
		name.textContent = result.file
		showQuestions(parsed.questions)
		share.hidden = false
		refine.hidden = false
		undo.hidden = earlier.length === 0
		return {
			ids: new Set(parsed.diagram.processes[0]?.elements.map((e) => e.id)),
			problems: parsed.problems.length,
		}
	}

	function showQuestions(list: ProcessTextQuestion[]): void {
		if (!questions) return
		questions.replaceChildren(
			...list.slice(0, MAX_QUESTIONS).map((question) => {
				const item = document.createElement("li")
				item.textContent = question.text
				const answers = document.createElement("div")
				answers.className = "fc-examples"
				for (const option of question.options) {
					const button = document.createElement("button")
					button.type = "button"
					button.textContent = option.label
					button.addEventListener("click", () => void change(option.change))
					answers.append(button)
				}
				const own = document.createElement("button")
				own.type = "button"
				own.textContent = question.options.length > 0 ? "Something else…" : "Answer…"
				own.addEventListener("click", () => {
					if (!changeInput) return
					changeInput.value = question.draft
					changeInput.focus()
				})
				answers.append(own)
				item.append(answers)
				return item
			}),
		)
	}

	/**
	 * Gets a Turnstile token from the reader.
	 *
	 * @returns The token, or `null` when the reader closed the check or it could
	 * not load (then an error says so).
	 */
	function solveChallenge(): Promise<string | null> {
		const api = (globalThis as { turnstile?: Turnstile }).turnstile
		const dialog = $<HTMLDialogElement>("genTurnstile")
		const widget = $("genTurnstileWidget")
		const failed = $("genTurnstileError")
		if (!sitekey || !api || !dialog || !widget) {
			showError("The check could not load. Please reload the page and try again.")
			return Promise.resolve(null)
		}
		return new Promise((resolve) => {
			let widgetId: string | null = null
			let settled = false
			const finish = (token: string | null) => {
				if (settled) return
				settled = true
				if (widgetId) api.remove(widgetId)
				confirming = false
				dialog.close()
				resolve(token)
			}
			confirming = true
			setStatus("one check first…", true)
			if (failed) failed.hidden = true
			widget.replaceChildren()
			dialog.showModal()
			// Escape and Cancel both end at `close`.
			dialog.addEventListener("close", () => finish(null), { once: true })
			widgetId = api.render(widget, {
				sitekey,
				callback: (token) => finish(token),
				"error-callback": () => {
					if (failed) failed.hidden = false
				},
				"expired-callback": () => {
					if (failed) failed.hidden = false
				},
			})
		})
	}

	/**
	 * Posts to the route. When the deployment challenges and the page holds no
	 * pass, the challenge comes first; when the route refuses the pass (expired,
	 * or a new IP), the reader is challenged once more. A pass the route hands
	 * out is kept for the next call.
	 *
	 * @returns The response, or `null` when the reader closed the challenge.
	 */
	async function send(
		body: { description: string; diagram?: string; change?: string; image?: string },
		code: string,
		signal: AbortSignal,
	): Promise<Response | null> {
		const post = (token?: string) =>
			fetch("/drop/api/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Drop-AI-Code": code,
					...(pass ? { [AI_PASS_HEADER]: pass } : {}),
				},
				body: JSON.stringify(token ? { ...body, token } : body),
				signal,
			})
		let res: Response
		if (sitekey && pass === null) {
			const token = await solveChallenge()
			if (token === null) return null
			res = await post(token)
		} else {
			res = await post()
			if (res.status === 403 && sitekey) {
				pass = null
				const token = await solveChallenge()
				if (token === null) return null
				res = await post(token)
			}
		}
		const issued = res.headers.get(AI_PASS_HEADER)
		if (issued) pass = issued
		return res
	}

	/**
	 * Streams one answer from the route and draws it as it arrives.
	 *
	 * @returns The answer's text, or `null` when it failed — the error is shown.
	 */
	async function ask(
		body: { description: string; diagram?: string; change?: string; image?: string },
		verb: string,
	): Promise<{ text: string; cached: boolean } | null> {
		if (!errors || !out || !passcode || !codeInput) return null
		errors.classList.add("hidden")
		out.classList.add("hidden")
		const typed = codeInput.value.trim()
		if (typed) writeCode(typed)
		const code = readCode()
		if (!code) {
			askForCode(false)
			return null
		}
		passcode.hidden = true

		running?.abort()
		const controller = new AbortController()
		running = controller
		setStatus(`${verb}…`, true)
		setBusy(true)
		const started = performance.now()
		// Workers AI can queue a call for seconds before its first line: count
		// them, so a wait reads as a wait and not as a hang.
		let drawn = false
		const ticker = setInterval(() => {
			if (!drawn && !confirming) {
				setStatus(`${verb}… ${Math.round((performance.now() - started) / 1000)}s`, true)
			}
		}, 1000)
		try {
			let res: Response
			try {
				const sent = await send(body, code, controller.signal)
				if (sent === null) {
					setStatus("draft")
					return null
				}
				res = sent
			} catch {
				if (!controller.signal.aborted) {
					setStatus("draft")
					showError("Network error — please try again.")
				}
				return null
			}
			if (!res.ok || !res.body) {
				// Before the await below, so the count cannot overwrite the status.
				clearInterval(ticker)
				setStatus("draft")
				if (res.status === 401) {
					writeCode(null)
					codeInput.value = ""
					askForCode(true)
					return null
				}
				const payload = (await res.json().catch(() => ({}))) as { error?: string }
				showError(payload.error ?? "Couldn't draft the diagram. Please try again.")
				return null
			}

			const sse = createSseReader()
			const stream = createProcessTextStream()
			const decoder = new TextDecoder()
			let text = ""
			let outcome: GenerateEvent | null = null
			try {
				// A reader loop rather than `for await`: Safari streams have no async iterator.
				const reader = res.body.getReader()
				for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
					for (const data of sse.push(decoder.decode(chunk.value, { stream: true }))) {
						const event = JSON.parse(data) as GenerateEvent
						if ("text" in event) {
							text += event.text
							const frame = stream.push(event.text)
							if (frame) {
								drawn = true
								draw(frame)
								setStatus(`${verb}… ${frame.processes[0]?.flowElements.length ?? 0} elements`, true)
							}
						} else {
							outcome = event
						}
					}
				}
			} catch {
				if (controller.signal.aborted) return null
				outcome = { error: "The connection dropped. Please try again." }
			}
			if (controller.signal.aborted) return null
			running = null

			if (!outcome || "error" in outcome) {
				setStatus("draft")
				showError(outcome && "error" in outcome ? outcome.error : "No diagram came back.")
				return null
			}
			return { text, cached: outcome.done && outcome.cached }
		} finally {
			clearInterval(ticker)
			// A newer request took over and owns the indicator now.
			if (!controller.signal.aborted) setBusy(false)
		}
	}

	const repaired = (problems: number) => (problems > 0 ? ` · ${problems} problem(s) repaired` : "")

	async function generate(): Promise<void> {
		if (!input || !share || !refine) return
		const description = input.value.trim()
		if (!image && description.length < 10) {
			return showError(
				imagePick
					? "Describe the process in a sentence or two, or add an image of it."
					: "Describe the process in a sentence or two.",
			)
		}
		draft = null
		earlier.length = 0
		result = null
		share.hidden = true
		refine.hidden = true
		const started = performance.now()
		const answer = await ask(
			image ? { description, image } : { description },
			image ? "reading the image" : "drafting",
		)
		if (!answer) return
		draft = {
			description: image && description.length < 10 ? IMAGE_DESCRIPTION : description,
			text: answer.text,
		}
		const { problems } = show(answer.text)
		const seconds = ((performance.now() - started) / 1000).toFixed(1)
		setStatus(
			answer.cached
				? `ready (cached)${repaired(problems)}`
				: `ready in ${seconds}s${repaired(problems)}`,
		)
	}

	/** Asks for `request` to be made to the draft on screen, and draws the result. */
	async function change(request: string): Promise<void> {
		if (!draft || !changeInput) return
		const text = request.trim()
		if (text.length < MIN_CHANGE_CHARS) {
			changeInput.focus()
			return
		}
		const before = parseProcessText(draft.text).diagram.processes[0]?.elements ?? []
		const started = performance.now()
		const answer = await ask(
			{ description: draft.description, diagram: draft.text, change: text },
			"changing",
		)
		if (!answer) {
			// The canvas shows what streamed before it failed; the draft is unchanged.
			if (running === null) show(draft.text)
			return
		}
		earlier.push(draft.text)
		draft.text = answer.text
		changeInput.value = ""
		const { ids, problems } = show(answer.text)
		const added = [...ids].filter((id) => !before.some((e) => e.id === id)).length
		const removed = before.filter((e) => !ids.has(e.id)).length
		const seconds = ((performance.now() - started) / 1000).toFixed(1)
		setStatus(
			`changed${answer.cached ? " (cached)" : ` in ${seconds}s`} · +${added} −${removed}${repaired(problems)}`,
		)
	}

	async function shareIt(): Promise<void> {
		if (!result || !share || !url || !open || !out) return
		const body = new FormData()
		body.append(
			"files",
			new File([result.xml], result.file, { type: "application/xml" }),
			result.file,
		)
		share.disabled = true
		try {
			const res = await fetch("/drop/api/drops", { method: "POST", body })
			const payload = (await res.json()) as { url?: string; error?: string; details?: string[] }
			if (!res.ok || !payload.url) {
				return showError(payload.details?.join("\n") ?? payload.error ?? "Sharing failed.")
			}
			url.value = new URL(payload.url, location.origin).href
			open.href = payload.url
			out.classList.remove("hidden")
		} catch {
			showError("Network error — please try again.")
		} finally {
			share.disabled = false
		}
	}

	const updateCount = () => {
		count.textContent = `${input.value.length} / ${MAX_DESCRIPTION_CHARS}`
	}
	input.addEventListener("input", updateCount)
	input.addEventListener("keydown", (e) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void generate()
	})
	codeInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") void generate()
	})
	run.addEventListener("click", () => void generate())
	$("genTurnstileCancel")?.addEventListener("click", () =>
		$<HTMLDialogElement>("genTurnstile")?.close(),
	)
	apply.addEventListener("click", () => void change(changeInput.value))
	changeInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") void change(changeInput.value)
	})
	undo.addEventListener("click", () => {
		const previous = earlier.pop()
		if (!draft || previous === undefined) return
		running?.abort()
		running = null
		setBusy(false)
		draft.text = previous
		show(previous)
		setStatus("undone")
	})
	share.addEventListener("click", () => void shareIt())
	copy.addEventListener("click", async () => {
		await navigator.clipboard.writeText(url.value)
		copy.textContent = "Copied"
		setTimeout(() => {
			copy.textContent = "Copy"
		}, 1500)
	})

	if (imagePick && imageFile && imagePreview && imageNote && imageClear) {
		const note = imageNote.textContent ?? ""
		const setImage = async (file: Blob) => {
			errors.classList.add("hidden")
			imageNote.textContent = "reading…"
			const url = await readImage(file)
			if (url === null) {
				imageNote.textContent = note
				return showError("That image could not be read. Try a PNG or JPEG.")
			}
			image = url
			imagePreview.src = url
			imagePreview.hidden = false
			imageClear.hidden = false
			imageNote.textContent = "drafted from this image; the text above is optional"
		}
		imagePick.addEventListener("click", () => imageFile.click())
		imageFile.addEventListener("change", () => {
			const file = imageFile.files?.[0]
			imageFile.value = ""
			if (file) void setImage(file)
		})
		input.addEventListener("paste", (e) => {
			const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"))
			if (!file) return
			e.preventDefault()
			void setImage(file)
		})
		imageClear.addEventListener("click", () => {
			image = null
			imagePreview.hidden = true
			imagePreview.removeAttribute("src")
			imageClear.hidden = true
			imageNote.textContent = note
		})
	}

	for (const example of EXAMPLES) {
		const button = document.createElement("button")
		button.type = "button"
		button.textContent = example.label
		button.addEventListener("click", () => {
			input.value = example.text
			updateCount()
			input.focus()
		})
		examples?.append(button)
	}
}
