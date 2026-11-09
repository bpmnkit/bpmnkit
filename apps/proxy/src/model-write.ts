import { Bpmn } from "@bpmnkit/core"
import { writeBpmn } from "@bpmnkit/core/node"
import { refuseUndeployable } from "./final-diagram.js"

/**
 * Parses BPMN a model produced and writes it through `writeBpmn`, which checks that
 * the file reads back as the same model and replaces the destination atomically.
 * XML that does not parse, or that Camunda 8 would not deploy, is refused here rather
 * than written for the user to find.
 */
export async function writeModelXml(
	filePath: string,
	xml: string,
): Promise<{ changes: string | null }> {
	let definitions: ReturnType<typeof Bpmn.parse>
	try {
		definitions = Bpmn.parse(xml)
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error)
		throw new Error(`The model returned BPMN that does not parse (${reason}); nothing was written.`)
	}
	refuseUndeployable(
		xml,
		"The model returned BPMN Camunda 8 would not deploy; nothing was written.",
	)
	const result = await writeBpmn(definitions, { output: filePath, force: true })
	const changes = result.changes
	return {
		changes: changes
			? `${changes.added.length} added, ${changes.removed.length} removed, ${changes.changed.length} changed`
			: null,
	}
}
