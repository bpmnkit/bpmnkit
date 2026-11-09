import { serializeBpmn } from "../bpmn/bpmn-serializer.js"
import { normalizeCamundaVersion } from "../bpmn/camunda-compat.js"
import { findElement } from "../bpmn/utils.js"
import { validateDeployableXml } from "../bpmn/zeebe-validate/index.js"
import { ZEEBE_LATEST_VERSION } from "../generated/zeebe-rules.js"
import type { BpmnDefinitions } from "../index.js"
import { messageRefOf } from "./apply-element.js"
import type { ApplyOptions } from "./apply.js"

/** Options of the template functions that write onto a model. */
export interface ApplyToModelOptions extends ApplyOptions {
	/**
	 * Check the applied elements with Zeebe's deploy rules and report what Zeebe
	 * would reject as `not-deployable` problems (default `true`). Only the applied
	 * elements (and the message they reference) are checked, so applying a template
	 * to an unfinished diagram does not report the rest of it.
	 */
	validate?: boolean
	/** The Camunda 8 version to check for. Default: the model's `executionPlatformVersion`, else the newest. */
	camundaVersion?: string
}

/** One Zeebe deploy error on an applied element. */
export interface AppliedDeployProblem {
	/** The applied element the error belongs to. */
	elementId: string
	message: string
}

/**
 * Zeebe's deploy errors on the applied elements, one problem per error:
 * `Not deployable on Camunda <version>: <id>: <zeebe message> (<rule>)`, the
 * line `assertDeployable` writes for the same error.
 */
export function appliedDeployProblems(
	definitions: BpmnDefinitions,
	elementIds: readonly string[],
	options: ApplyToModelOptions,
): AppliedDeployProblem[] {
	if (options.validate === false || elementIds.length === 0) return []
	const camundaVersion =
		options.camundaVersion ?? definitions.unknownAttributes["modeler:executionPlatformVersion"]
	const version = normalizeCamundaVersion(camundaVersion) ?? ZEEBE_LATEST_VERSION
	// An error on the message an inbound template writes belongs to the element that uses it.
	const owner = new Map<string, string>()
	for (const id of elementIds) {
		owner.set(id, id)
		const element = findElement(definitions, id)
		const messageId = element === undefined ? undefined : messageRefOf(element)
		if (messageId !== undefined && !owner.has(messageId)) owner.set(messageId, id)
	}
	const problems: AppliedDeployProblem[] = []
	for (const finding of validateDeployableXml(serializeBpmn(definitions), {
		camundaVersion: version,
	})) {
		const id = finding.elementIds[0]
		const elementId = id === undefined ? undefined : owner.get(id)
		if (finding.severity !== "error" || elementId === undefined) continue
		problems.push({
			elementId,
			message: `Not deployable on Camunda ${version}: ${id}: ${finding.message} (${finding.id})`,
		})
	}
	return problems
}
