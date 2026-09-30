/**
 * Describe-to-diagram on `/drop`: type what a process should do, watch the
 * diagram being drawn, share it.
 *
 * The Worker streams the model's answer in the line format; each finished line
 * is parsed here and drawn at once, so the first shapes appear while the model
 * is still writing. The final diagram is parsed from the same text by the same
 * parser, so what is shared is exactly what was drawn.
 *
 * Nothing is stored until the reader asks for a link. The diagram then goes
 * through `/drop/api/drops` as an ordinary `.bpmn` upload — same validation,
 * same Terms, same short link.
 */
import { BpmnCanvas } from "@bpmnkit/canvas"
import { Bpmn, type BpmnDefinitions, createProcessTextStream, expand } from "@bpmnkit/core"
import { type GenerateEvent, MAX_DESCRIPTION_CHARS, createSseReader } from "../lib/generate.js"
import { AI_CODE_STORAGE_KEY } from "../shared/constants.js"

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
		!copy
	) {
		return
	}

	let canvas: BpmnCanvas | null = null
	let running: AbortController | null = null
	let result: { xml: string; file: string } | null = null
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

	async function generate(): Promise<void> {
		if (!input || !errors || !out || !share || !passcode || !codeInput || !name) return
		errors.classList.add("hidden")
		out.classList.add("hidden")
		const description = input.value.trim()
		if (description.length < 10) return showError("Describe the process in a sentence or two.")

		const typed = codeInput.value.trim()
		if (typed) writeCode(typed)
		const code = readCode()
		if (!code) return askForCode(false)
		passcode.hidden = true

		running?.abort()
		const controller = new AbortController()
		running = controller
		result = null
		share.hidden = true
		const started = performance.now()
		setStatus("drafting…", true)

		let res: Response
		try {
			res = await fetch("/drop/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json", "X-Drop-AI-Code": code },
				body: JSON.stringify({ description }),
				signal: controller.signal,
			})
		} catch {
			if (!controller.signal.aborted) {
				setStatus("draft")
				showError("Network error — please try again.")
			}
			return
		}
		if (!res.ok || !res.body) {
			setStatus("draft")
			if (res.status === 401) {
				writeCode(null)
				codeInput.value = ""
				return askForCode(true)
			}
			const body = (await res.json().catch(() => ({}))) as { error?: string }
			return showError(body.error ?? "Couldn't draft the diagram. Please try again.")
		}

		const sse = createSseReader()
		const stream = createProcessTextStream()
		const decoder = new TextDecoder()
		let outcome: GenerateEvent | null = null
		try {
			// A reader loop rather than `for await`: Safari streams have no async iterator.
			const body = res.body.getReader()
			for (let chunk = await body.read(); !chunk.done; chunk = await body.read()) {
				for (const data of sse.push(decoder.decode(chunk.value, { stream: true }))) {
					const event = JSON.parse(data) as GenerateEvent
					if ("text" in event) {
						const frame = stream.push(event.text)
						if (frame) {
							draw(frame)
							setStatus(`drafting… ${frame.processes[0]?.flowElements.length ?? 0} elements`, true)
						}
					} else {
						outcome = event
					}
				}
			}
		} catch {
			if (controller.signal.aborted) return
			outcome = { error: "The connection dropped. Please try again." }
		}
		if (controller.signal.aborted) return
		running = null

		if (!outcome || "error" in outcome) {
			setStatus("draft")
			return showError(outcome && "error" in outcome ? outcome.error : "No diagram came back.")
		}
		const { diagram, problems } = stream.end()
		const defs = expand(diagram)
		draw(defs)
		result = { xml: Bpmn.export(defs), file: fileName(defs) }
		name.textContent = result.file
		const seconds = ((performance.now() - started) / 1000).toFixed(1)
		const skipped = problems.length > 0 ? ` · ${problems.length} line(s) skipped` : ""
		setStatus(outcome.cached ? `ready (cached)${skipped}` : `ready in ${seconds}s${skipped}`)
		share.hidden = false
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
	share.addEventListener("click", () => void shareIt())
	copy.addEventListener("click", async () => {
		await navigator.clipboard.writeText(url.value)
		copy.textContent = "Copied"
		setTimeout(() => {
			copy.textContent = "Copy"
		}, 1500)
	})

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
