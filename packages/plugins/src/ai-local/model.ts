import { AI_LOCAL_EXAMPLE, AI_LOCAL_SYSTEM_PROMPT } from "./prompt.js"

export type Availability = "unavailable" | "downloadable" | "downloading" | "available"

export interface LocalSession {
	promptStreaming(input: string, o?: { signal?: AbortSignal }): ReadableStream<string>
	measureContextUsage(input: string): Promise<number>
	readonly contextUsage: number
	readonly contextWindow: number
	destroy(): void
}

// Declared locally: the Prompt API has no stable lib.dom types yet.
interface LanguageModelStatic {
	availability(o: LanguageModelOptions): Promise<Availability>
	create(
		o: LanguageModelOptions & {
			initialPrompts: { role: "system" | "user" | "assistant"; content: string }[]
			monitor?: (m: EventTarget) => void
			signal?: AbortSignal
		},
	): Promise<LocalSession>
}

interface LanguageModelOptions {
	expectedInputs: { type: "text"; languages: string[] }[]
	expectedOutputs: { type: "text"; languages: string[] }[]
}

/** Tokens kept free for the model's answer when checking whether a prompt fits. */
export const ANSWER_RESERVE = 1024

// Gemini Nano only supports a few languages; English keeps output quality predictable.
const LANGUAGE_OPTIONS: LanguageModelOptions = {
	expectedInputs: [{ type: "text", languages: ["en"] }],
	expectedOutputs: [{ type: "text", languages: ["en"] }],
}

function api(): LanguageModelStatic | undefined {
	return (globalThis as { LanguageModel?: LanguageModelStatic }).LanguageModel
}

export async function checkAvailability(): Promise<Availability> {
	const lm = api()
	if (!lm) return "unavailable"
	try {
		return await lm.availability(LANGUAGE_OPTIONS)
	} catch {
		return "unavailable"
	}
}

export async function createSession(o: {
	signal: AbortSignal
	onDownloadProgress?(loaded: number): void
}): Promise<LocalSession> {
	const lm = api()
	if (!lm) throw new Error("Chrome's Prompt API is not available")
	return lm.create({
		...LANGUAGE_OPTIONS,
		initialPrompts: [
			{ role: "system", content: AI_LOCAL_SYSTEM_PROMPT },
			{ role: "user", content: AI_LOCAL_EXAMPLE.description },
			{ role: "assistant", content: AI_LOCAL_EXAMPLE.answer },
		],
		signal: o.signal,
		monitor(m) {
			m.addEventListener("downloadprogress", (e) => {
				o.onDownloadProgress?.((e as Event & { loaded: number }).loaded)
			})
		},
	})
}

export async function fitsContext(session: LocalSession, description: string): Promise<boolean> {
	const needed = await session.measureContextUsage(description)
	return session.contextUsage + needed + ANSWER_RESERVE <= session.contextWindow
}
