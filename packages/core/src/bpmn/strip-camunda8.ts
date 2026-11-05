import type { BpmnDefinitions } from "./bpmn-model.js"

/** One Camunda 8 vendor bit removed by {@link stripCamunda8}. */
export interface DroppedCamunda8Item {
	/** Id of the owning element (`"definitions"` when it has none). */
	elementId: string
	kind: "extensionElement" | "attribute" | "namespace"
	/** Qualified name, e.g. `zeebe:taskDefinition`, `modeler:executionPlatform`, `xmlns:zeebe`. */
	name: string
}

export interface StripCamunda8Result {
	definitions: BpmnDefinitions
	dropped: DroppedCamunda8Item[]
}

const PREFIXES = ["zeebe", "modeler"] as const
const isVendor = (qname: string): boolean => PREFIXES.some((p) => qname.startsWith(`${p}:`))

/**
 * Returns a copy of `definitions` without Camunda 8 vendor content (`zeebe:*`
 * extension elements and attributes, `modeler:*` attributes) so the export is
 * plain BPMN, e.g. as a base for Camunda 7/Operaton. Opt-in and non-mutating;
 * `camunda:*` and other vendors are left alone. Their `xmlns` declarations go
 * too, unless some remaining content still uses the prefix.
 */
export function stripCamunda8(definitions: BpmnDefinitions): StripCamunda8Result {
	const copy = structuredClone(definitions)
	const dropped: DroppedCamunda8Item[] = []

	const walk = (node: unknown, ownerId: string): void => {
		if (Array.isArray(node)) {
			for (const item of node) walk(item, ownerId)
			return
		}
		if (node === null || typeof node !== "object") return
		const obj = node as Record<string, unknown>
		const id = typeof obj.id === "string" ? obj.id : ownerId
		for (const [key, value] of Object.entries(obj)) {
			if (key === "extensionElements" && Array.isArray(value)) {
				obj[key] = value.filter((x: { name?: unknown }) => {
					if (typeof x.name !== "string" || !isVendor(x.name)) return true
					dropped.push({ elementId: id, kind: "extensionElement", name: x.name })
					return false
				})
			} else if (key === "unknownAttributes" && value && typeof value === "object") {
				for (const a of Object.keys(value)) {
					if (!isVendor(a)) continue
					delete (value as Record<string, string>)[a]
					dropped.push({ elementId: id, kind: "attribute", name: a })
				}
			}
		}
		for (const value of Object.values(obj)) walk(value, id)
	}
	walk(copy, "definitions")

	// Namespaces last: only drop a declaration nothing left refers to.
	const remaining = JSON.stringify({ ...copy, namespaces: undefined })
	for (const prefix of PREFIXES) {
		if (!(prefix in copy.namespaces) || remaining.includes(`"${prefix}:`)) continue
		delete copy.namespaces[prefix]
		dropped.push({ elementId: "definitions", kind: "namespace", name: `xmlns:${prefix}` })
	}
	return { definitions: copy, dropped }
}
