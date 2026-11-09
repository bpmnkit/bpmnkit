import { DeployabilityError, assertDeployableXml, optimize } from "@bpmnkit/core"
import type { BpmnDefinitions } from "@bpmnkit/core"

/** What the deploy pane shows before it lets a model be deployed. */
export type DeployVerdict =
	| { ok: true; warnings: string[] }
	/** `message` is the gate's (`DeployabilityError.message`); `lines` are its per-error lines. */
	| { ok: false; message: string; lines: string[] }

/**
 * The deploy gate on the XML that would be sent: Zeebe's own rules, nothing else, so
 * the pane refuses exactly what the engine would. Optimizer warnings are advice and
 * never block a deploy.
 */
export function deployVerdict(xml: string, defs: BpmnDefinitions | null): DeployVerdict {
	try {
		assertDeployableXml(xml)
	} catch (err) {
		if (!(err instanceof DeployabilityError)) {
			const message = err instanceof Error ? err.message : String(err)
			return { ok: false, message, lines: [message] }
		}
		const lines = err.message
			.split("\n")
			.slice(1)
			.map((line) => line.replace(/^- /, ""))
		return { ok: false, message: err.message, lines }
	}
	const warnings = defs
		? optimize(defs)
				.findings.filter((f) => f.severity === "warning")
				.map((f) => f.message)
		: []
	return { ok: true, warnings }
}
