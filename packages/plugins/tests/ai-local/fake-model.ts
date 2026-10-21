import type { Availability, LocalSession } from "../../src/ai-local/model.js"

export interface FakeOptions {
	availability?: Availability
	chunks?: string[]
	contextWindow?: number
	usage?: number
	createError?: Error
	progress?: number[]
	/** The stream errors with this after the chunks, like a mid-run quota failure. */
	streamError?: Error
}

export interface FakeHandle {
	created: unknown[]
	destroyed: number
}

type SessionOptions = Pick<FakeOptions, "chunks" | "contextWindow" | "usage" | "streamError">

/** A session that streams one chunk per pull and errors with `signal.reason` on abort. */
export function fakeSession(
	o: SessionOptions = {},
	handle?: FakeHandle,
): LocalSession & FakeHandle {
	const chunks = o.chunks ?? []
	const self = {
		created: handle?.created ?? [],
		destroyed: 0,
		contextWindow: o.contextWindow ?? 4096,
		contextUsage: o.usage ?? 0,
		promptStreaming(_input: string, opts?: { signal?: AbortSignal }) {
			const signal = opts?.signal
			let i = 0
			return new ReadableStream<string>({
				start(controller) {
					// The real API rejects at once for a signal that is already aborted.
					if (signal?.aborted) return controller.error(signal.reason)
					// Abort must surface as a stream error, like the real API.
					signal?.addEventListener("abort", () => controller.error(signal.reason), { once: true })
				},
				pull(controller) {
					if (signal?.aborted) return
					const chunk = chunks[i++]
					if (chunk === undefined) {
						if (o.streamError) controller.error(o.streamError)
						else controller.close()
					} else controller.enqueue(chunk)
				},
			})
		},
		measureContextUsage: (input: string) => Promise.resolve(input.length),
		destroy() {
			self.destroyed++
			if (handle) handle.destroyed++
		},
	}
	return self
}

export function installFakeModel(o: FakeOptions = {}): FakeHandle {
	const handle: FakeHandle = { created: [], destroyed: 0 }
	;(globalThis as Record<string, unknown>).LanguageModel = {
		availability: () => Promise.resolve(o.availability ?? "available"),
		async create(opts: {
			monitor?: (m: EventTarget) => void
			signal?: AbortSignal
		}) {
			handle.created.push(opts)
			if (o.createError) throw o.createError
			if (opts.monitor) {
				const target = new EventTarget()
				opts.monitor(target)
				for (const loaded of o.progress ?? []) {
					target.dispatchEvent(Object.assign(new Event("downloadprogress"), { loaded }))
				}
			}
			return fakeSession(o, handle)
		},
	}
	return handle
}

export function uninstallFakeModel(): void {
	// biome-ignore lint/performance/noDelete: assigning undefined would leave the key present
	delete (globalThis as Record<string, unknown>).LanguageModel
}
