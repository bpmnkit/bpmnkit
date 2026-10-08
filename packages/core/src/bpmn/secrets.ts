import type { XmlElement } from "../types/xml-element.js"
import type { BpmnDefinitions, BpmnFlowElement } from "./bpmn-model.js"

/** A secret a diagram needs, and the elements that use it. */
export interface DiagramSecret {
	/** The name to create in the cluster's secrets: `SLACK_TOKEN`. */
	name: string
	/** Elements whose configuration reads it, in diagram order. */
	elementIds: string[]
}

/** `{{secrets.NAME}}`, `camunda.secrets.NAME` and `` camunda.secrets.`NAME` ``. */
const SECRET = /\{\{\s*secrets\.([\w-]+)\s*\}\}|camunda\.secrets\.(?:([\w-]+)|`([^`]+)`)/g

function scan(text: string | undefined, found: (name: string) => void): void {
	if (text === undefined || !text.includes("secrets.")) return
	for (const m of text.matchAll(SECRET)) {
		const name = m[1] ?? m[2] ?? m[3]
		if (name) found(name)
	}
}

function scanXml(elements: readonly XmlElement[], found: (name: string) => void): void {
	for (const x of elements) {
		for (const value of Object.values(x.attributes)) scan(value, found)
		scan(x.text, found)
		scanXml(x.children, found)
	}
}

/**
 * The secrets a diagram's configuration reads — connector inputs, headers,
 * properties and message subscriptions — so whoever deploys it knows what to
 * create in the cluster first. Sorted by name.
 */
export function listSecrets(definitions: BpmnDefinitions): DiagramSecret[] {
	const byName = new Map<string, Set<string>>()
	const add = (elementId: string) => (name: string) => {
		const ids = byName.get(name) ?? new Set<string>()
		ids.add(elementId)
		byName.set(name, ids)
	}
	const messageUsers = new Map<string, string[]>()
	const walk = (elements: readonly BpmnFlowElement[]) => {
		for (const el of elements) {
			scanXml(el.extensionElements, add(el.id))
			const ref =
				"messageRef" in el && typeof el.messageRef === "string"
					? el.messageRef
					: "eventDefinitions" in el
						? el.eventDefinitions.find((d) => d.type === "message")?.messageRef
						: undefined
			if (ref !== undefined) messageUsers.set(ref, [...(messageUsers.get(ref) ?? []), el.id])
			if ("flowElements" in el && Array.isArray(el.flowElements)) walk(el.flowElements)
		}
	}
	for (const process of definitions.processes) walk(process.flowElements)
	// A message's correlation key is configured on the message, used by the events that wait for it
	for (const message of definitions.messages) {
		for (const id of messageUsers.get(message.id) ?? [message.id]) {
			scanXml(message.extensionElements ?? [], add(id))
		}
	}
	return [...byName.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([name, ids]) => ({ name, elementIds: [...ids] }))
}
