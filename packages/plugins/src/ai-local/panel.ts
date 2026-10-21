import { Bpmn } from "@bpmnkit/core"
import type { BpmnDefinitions } from "@bpmnkit/core"
import { injectAiLocalStyles } from "./css.js"
import { generateProcess } from "./generate.js"
import { type Availability, createSession, fitsContext } from "./model.js"

export interface PanelOptions {
	openDiagram(xml: string, name: string): void
	updateDiagram(defs: BpmnDefinitions): void
}

const MAX_DESCRIPTION = 2000
const DOWNLOAD_NOTE = "The first run needs a one-time download of Chrome's on-device model."

function message(e: unknown): string {
	return e instanceof Error ? e.message : String(e)
}

export function createAiLocalPanel(o: PanelOptions): {
	panel: HTMLElement
	setAvailability(a: Availability): void
	stop(): void
} {
	injectAiLocalStyles()

	const panel = document.createElement("div")
	panel.className = "ai-local-panel"

	const title = document.createElement("div")
	title.className = "ai-local-title"
	title.textContent = "Generate from description"

	const input = document.createElement("textarea")
	input.className = "ai-local-input"
	input.maxLength = MAX_DESCRIPTION
	input.placeholder = "Describe the process, e.g. an expense approval with a manager review."

	const run = document.createElement("button")
	run.className = "ai-local-run"
	run.type = "button"
	run.textContent = "Generate"
	run.disabled = true

	const status = document.createElement("div")
	status.className = "ai-local-status"
	status.setAttribute("role", "status")

	const notes = document.createElement("ul")
	notes.className = "ai-local-notes"

	panel.append(title, input, run, status, notes)

	let controller: AbortController | null = null

	const setStatus = (text: string, isError = false): void => {
		status.textContent = text
		status.classList.toggle("ai-local-status-err", isError)
	}
	const syncRun = (): void => {
		run.textContent = controller ? "Stop" : "Generate"
		run.disabled = !controller && input.value.trim() === ""
	}
	input.addEventListener("input", syncRun)

	async function start(): Promise<void> {
		const description = input.value.trim()
		if (!description) return
		const ac = new AbortController()
		// Set before the first await so a second click is a Stop, never a second run.
		controller = ac
		notes.replaceChildren()
		syncRun()
		setStatus("Preparing the on-device model…")

		let session: Awaited<ReturnType<typeof createSession>> | null = null
		let opened = false
		try {
			// Created inside the click handler: the download needs user activation.
			try {
				session = await createSession({
					signal: ac.signal,
					// A late event must not overwrite "Stopped" (or a newer run's status).
					onDownloadProgress: (loaded) => {
						if (controller === ac && !ac.signal.aborted) {
							setStatus(`Downloading the on-device model… ${Math.round(loaded * 100)}%`)
						}
					},
				})
			} catch (e) {
				if (ac.signal.aborted) return setStatus("Stopped")
				return setStatus(`Chrome couldn't prepare the on-device model: ${message(e)}`, true)
			}
			if (ac.signal.aborted) return setStatus("Stopped")
			if (!(await fitsContext(session, description))) {
				return setStatus("Description too long for the on-device model — shorten it.", true)
			}
			setStatus("Generating…")
			const result = await generateProcess(session, description, {
				signal: ac.signal,
				onFrame(defs) {
					if (opened) return o.updateDiagram(defs)
					opened = true
					o.openDiagram(Bpmn.export(defs), defs.processes[0]?.name || "Generated process")
				},
			})
			if (!result) {
				return ac.signal.aborted
					? setStatus("Stopped")
					: setStatus("The model didn't return a diagram — try rephrasing.", true)
			}
			o.updateDiagram(result.definitions)
			for (const text of [
				...result.problems.map((p) => `Line ${p.line}: ${p.message}`),
				...result.fixes,
			]) {
				const li = document.createElement("li")
				li.textContent = text
				notes.append(li)
			}
			setStatus(result.stopped ? "Stopped" : "Done")
		} catch (e) {
			if (e instanceof Error && e.name === "QuotaExceededError") {
				setStatus("The diagram outgrew the model's context — try a smaller process.", true)
			} else {
				setStatus(`Generation failed: ${message(e)}`, true)
			}
		} finally {
			session?.destroy()
			controller = null
			syncRun()
		}
	}

	run.addEventListener("click", () => {
		if (controller) controller.abort()
		else void start()
	})

	return {
		panel,
		setAvailability(a) {
			if (a === "downloadable") setStatus(DOWNLOAD_NOTE)
		},
		stop() {
			controller?.abort()
		},
	}
}
