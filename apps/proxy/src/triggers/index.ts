/**
 * Trigger orchestrator — starts all trigger types on proxy startup.
 *
 * Respects `BPMNKIT_TRIGGERS=false` to opt out of all triggers.
 */
import { startFileWatchTrigger } from "./file-watcher.js"

export { matchWebhookRoute, handleWebhook } from "./webhook.js"

export function startTriggers(): void {
	if (process.env.BPMNKIT_TRIGGERS === "false") {
		console.log("[triggers] disabled via BPMNKIT_TRIGGERS=false")
		return
	}

	// No timer trigger: every engine the proxy talks to (Camunda 8 SaaS, Self-Managed, Reebe)
	// fires timer start events itself, so one here would start each instance twice
	startFileWatchTrigger()
	console.log("[triggers] file-watch trigger started")
}
