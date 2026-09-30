/**
 * A hedged model call: ask a second model when the first is slow to start.
 *
 * Workers AI sometimes queues a request before a model instance takes it. In the
 * 2026-09-30 benchmark, 4 of 36 glm-4.7-flash calls waited 2–12 s for their
 * first byte against a median of 167 ms — the model was not slow, the queue
 * was. Once content flows, it flows at the model's usual speed. So the wait is
 * hidden by racing: if the first model has written nothing after a short delay,
 * the same request goes to a second model, and whichever writes first is kept.
 * The other is cancelled. The price is a second call only in the slow cases.
 *
 * See `doc/drop-ai-generate-analysis.md` §10.
 */
import { type AiUsage, createSseReader, readAiEvent } from "./generate.js"

/**
 * One model's answer, read as it streams.
 *
 * {@link first} waits for the first piece of content without losing it, so a
 * race can be decided before anything reaches the client; {@link rest} then
 * yields everything from that piece on.
 */
export class ModelStream {
	/** Every piece of content read so far. */
	text = ""
	reasoningChars = 0
	usage: AiUsage | undefined
	/** The call failed, or its stream broke. */
	failed = false
	/** When the first piece of content arrived, in ms after {@link first} was called. */
	firstContentMs: number | undefined

	private reader: ReadableStreamDefaultReader<Uint8Array> | undefined
	private readonly sse = createSseReader()
	private readonly decoder = new TextDecoder()
	private pending: string[] = []
	private cancelled = false

	constructor(
		readonly model: string,
		private readonly start: () => Promise<unknown>,
	) {}

	/** Resolves `true` at the first piece of content, `false` if the answer ends or fails without one. */
	async first(): Promise<boolean> {
		const began = Date.now()
		let upstream: unknown
		try {
			upstream = await this.start()
		} catch {
			this.failed = true
			return false
		}
		if (!(upstream instanceof ReadableStream)) {
			this.failed = true
			return false
		}
		this.reader = (upstream as ReadableStream<Uint8Array>).getReader()
		// Lost the race while the call was still being accepted.
		if (this.cancelled) {
			this.cancel()
			return false
		}
		for (;;) {
			const content = await this.read()
			if (content === null) return false
			if (content.length > 0) {
				this.firstContentMs = Date.now() - began
				this.pending = content
				return true
			}
		}
	}

	/** The content from the first piece on. Stops at the end of the answer or when it breaks. */
	async *rest(): AsyncGenerator<string> {
		yield* this.pending
		this.pending = []
		for (;;) {
			const content = await this.read()
			if (content === null) return
			yield* content
		}
	}

	/** Stops reading, and tells Workers AI to stop writing. */
	cancel(): void {
		this.cancelled = true
		this.reader?.cancel().catch(() => {})
	}

	/** The content in the next chunk (possibly none), or `null` at the end. */
	private async read(): Promise<string[] | null> {
		if (!this.reader) return null
		let chunk: ReadableStreamReadResult<Uint8Array>
		try {
			chunk = await this.reader.read()
		} catch {
			if (!this.cancelled) this.failed = true
			return null
		}
		if (chunk.done) return null
		const content: string[] = []
		for (const data of this.sse.push(this.decoder.decode(chunk.value, { stream: true }))) {
			const delta = readAiEvent(data)
			if (!delta) continue
			if (delta.reasoning) this.reasoningChars += delta.reasoning.length
			if (delta.usage) this.usage = delta.usage
			if (delta.content) {
				this.text += delta.content
				content.push(delta.content)
			}
		}
		return content
	}
}

/** The outcome of {@link hedge}. */
export interface HedgeResult {
	/** The stream that wrote first, or `null` when none wrote anything. */
	winner: ModelStream | null
	/** Every stream that was started, winner included — each one is charged. */
	started: ModelStream[]
}

/**
 * Starts `primary`, and `fallback()` too if the primary has written nothing
 * after `hedgeMs` or fails before writing. Resolves once one of them has
 * written, with the other cancelled.
 *
 * @param fallback - Creates the second stream; `null` for no hedge.
 */
export async function hedge(
	primary: ModelStream,
	fallback: (() => ModelStream) | null,
	hedgeMs: number,
): Promise<HedgeResult> {
	const primaryFirst = primary.first()
	if (!fallback) return { winner: (await primaryFirst) ? primary : null, started: [primary] }

	let timer: ReturnType<typeof setTimeout> | undefined
	const slow = new Promise<"slow">((resolve) => {
		timer = setTimeout(() => resolve("slow"), hedgeMs)
	})
	const early = await Promise.race([primaryFirst, slow])
	clearTimeout(timer)
	if (early === true) return { winner: primary, started: [primary] }

	const second = fallback()
	const winner = await firstToWrite([
		[primary, primaryFirst],
		[second, second.first()],
	])
	for (const stream of [primary, second]) if (stream !== winner) stream.cancel()
	return { winner, started: [primary, second] }
}

/** The first stream whose `first()` resolves `true`, or `null` when all resolve `false`. */
function firstToWrite(entries: [ModelStream, Promise<boolean>][]): Promise<ModelStream | null> {
	return new Promise((resolve) => {
		let left = entries.length
		for (const [stream, wrote] of entries) {
			void wrote.then((ok) => {
				if (ok) resolve(stream)
				else if (--left === 0) resolve(null)
			})
		}
	})
}
