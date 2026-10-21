import type { BpmnDefinitions } from "@bpmnkit/core"
import { generateProcess } from "./generate.js"
import { checkAvailability } from "./model.js"
import { createAiLocalPanel } from "./panel.js"

export { generateProcess, checkAvailability }

export interface AiLocalPluginOptions {
	/** Called with the first streamed frame; opens a new diagram tab. */
	openDiagram(xml: string, name: string): void
	/** Called with every later frame and the final result. */
	updateDiagram(defs: BpmnDefinitions): void
	/** Dock pane to mount into instead of document.body. */
	container?: HTMLElement
	/** Called when the button is clicked in docked mode. */
	onOpen?(): void
}

const ICON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5l1.4 3.6 3.6 1.4-3.6 1.4L8 11.5 6.6 7.9 3 6.5l3.6-1.4z"/><path d="M12.5 10.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/></svg>`

/**
 * Describe-to-diagram with Chrome's on-device model. The `button` stays hidden
 * until `ready` resolves true, so browsers without the Prompt API see nothing.
 */
export function createAiLocalPlugin(o: AiLocalPluginOptions): {
	name: "ai-local"
	install(api: unknown): void
	button: HTMLButtonElement
	ready: Promise<boolean>
	stop(): void
} {
	const { panel, setAvailability, stop } = createAiLocalPanel(o)
	if (o.container) o.container.append(panel)

	const button = document.createElement("button")
	button.title = "Generate from description"
	button.innerHTML = ICON
	button.hidden = true
	button.addEventListener("click", () => {
		if (!panel.isConnected) document.body.append(panel)
		o.onOpen?.()
	})

	const ready = checkAvailability().then((a) => {
		const ok = a !== "unavailable"
		button.hidden = !ok
		if (ok) setAvailability(a)
		return ok
	})

	return { name: "ai-local", install() {}, button, ready, stop }
}
