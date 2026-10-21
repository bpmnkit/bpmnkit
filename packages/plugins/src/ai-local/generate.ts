import { Bpmn, createProcessTextStream, expand } from "@bpmnkit/core"
import type { BpmnDefinitions, ProcessTextProblem } from "@bpmnkit/core"
import type { LocalSession } from "./model.js"

export interface GenerateResult {
	definitions: BpmnDefinitions
	xml: string
	name: string
	problems: ProcessTextProblem[]
	fixes: string[]
	/** True when the user aborted; the diagram is whatever had streamed so far. */
	stopped: boolean
}

const FENCE = /^\s*```/

/** Streams the model's process text into a diagram; `null` when it produced no flow nodes. */
export async function generateProcess(
	session: LocalSession,
	description: string,
	o: { signal: AbortSignal; onFrame(defs: BpmnDefinitions): void },
): Promise<GenerateResult | null> {
	const parser = createProcessTextStream()
	let stopped = false
	let frames = 0
	// Lines are split here, not in the parser, so fences never reach it and
	// chunk boundaries (or \r\n) cannot change the result.
	let pending = ""
	const feed = (line: string): void => {
		if (FENCE.test(line)) return
		const defs = parser.push(`${line}\n`)
		if (!defs) return
		frames++
		o.onFrame(defs)
	}

	const reader = session.promptStreaming(description, { signal: o.signal }).getReader()
	try {
		for (;;) {
			const { done, value } = await reader.read()
			if (done) break
			pending += value
			const lines = pending.split(/\r\n|\n|\r/)
			pending = lines.pop() ?? ""
			for (const line of lines) feed(line)
		}
		if (pending) feed(pending)
	} catch (e) {
		// The signal is authoritative: the real API and the fake reject differently.
		if (!o.signal.aborted) throw e
		stopped = true
	} finally {
		reader.releaseLock()
	}

	const { diagram, problems, fixes } = parser.end()
	// end() invents a start and end event for text with no nodes, so "no frame
	// ever streamed" is what tells prose apart from a diagram.
	if (frames === 0) return null
	const definitions = expand(diagram)
	return {
		definitions,
		xml: Bpmn.export(definitions),
		name: diagram.processes[0]?.name || "Generated process",
		problems,
		fixes,
		stopped,
	}
}
