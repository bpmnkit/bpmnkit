import { checkAvailability, createSession, fitsContext } from "@bpmnkit/plugins/ai-local"
import type { LocalSession } from "@bpmnkit/plugins/ai-local"
import { createDiagramLineFilter } from "../lib/generate.js"

/** The copy shown to the user; `message` is ready to display. */
export class OnDeviceError extends Error {}

/** True when Chrome has, or can fetch, its on-device model. */
export async function onDeviceAvailable(): Promise<boolean> {
	return (await checkAvailability()) !== "unavailable"
}

const reason = (e: unknown) => (e instanceof Error ? e.message : String(e))

/**
 * Streams the model's answer to `description` as diagram text: only lines that pass
 * the server route's line filter, so both sources feed the same parser.
 * Ends quietly when `signal` aborts; throws OnDeviceError otherwise.
 */
export async function* onDeviceText(
	description: string,
	o: { signal: AbortSignal; onDownloadProgress?(loaded: number): void },
): AsyncGenerator<string, void, undefined> {
	// First statement, no await before it: Chrome needs the click's user activation for create().
	const creating = createSession({ signal: o.signal, onDownloadProgress: o.onDownloadProgress })
	let session: LocalSession | undefined
	try {
		try {
			session = await creating
		} catch (e) {
			if (o.signal.aborted) return
			throw new OnDeviceError(`Chrome couldn't prepare the on-device model: ${reason(e)}`)
		}
		if (o.signal.aborted) return
		if (!(await fitsContext(session, description))) {
			throw new OnDeviceError("Description too long for the on-device model — shorten it.")
		}
		const filter = createDiagramLineFilter()
		// A reader loop rather than `for await`: ReadableStream isn't async-iterable in Safari.
		const reader = session.promptStreaming(description, { signal: o.signal }).getReader()
		try {
			for (;;) {
				const { done, value } = await reader.read()
				// The stream may have buffered chunks before the abort; drop them.
				if (done || o.signal.aborted) break
				const out = filter.push(value)
				if (out) yield out
			}
		} catch (e) {
			if (o.signal.aborted) return
			if (e instanceof Error && e.name === "QuotaExceededError") {
				throw new OnDeviceError("The diagram outgrew the model's context — try a smaller process.")
			}
			throw new OnDeviceError(`Generation failed: ${reason(e)}`)
		} finally {
			reader.releaseLock()
		}
		if (o.signal.aborted) return
		const rest = filter.end()
		if (rest) yield rest
	} finally {
		session?.destroy()
	}
}

/** True for `?ai=on-device`: the page opts in, nothing else triggers the probe. */
export function onDeviceRequested(search: string): boolean {
	return new URLSearchParams(search).get("ai") === "on-device"
}

/** The slice of `Document` used: this file is also compiled where there is no DOM lib. */
interface MetaHost<M> {
	createElement(tag: "meta"): M
	head: { append(meta: M): void }
}

/**
 * The trial token only switches the Prompt API on for pages that carry it, so it is added
 * here, before the availability check, instead of on every page. No token, no tag.
 */
export function addOriginTrialToken<M>(doc: MetaHost<M>, token: string): void {
	if (!token) return
	const meta = doc.createElement("meta")
	Object.assign(meta as object, { httpEquiv: "origin-trial", content: token })
	doc.head.append(meta)
}

/** The line shown for a failure: OnDeviceError carries its own copy, anything else gets a prefix. */
export function onDeviceFailure(e: unknown): string {
	return e instanceof OnDeviceError ? e.message : `Generation failed: ${reason(e)}`
}

/** The status shown while Chrome fetches the model; `loaded` is a fraction. */
export function downloadStatus(loaded: number): string {
	return `downloading the on-device model… ${Math.round(loaded * 100)}%`
}
