/**
 * File-watcher trigger — watches filesystem paths and starts a process
 * instance when files are created or modified.
 *
 * Convention: service tasks with job type `io.bpmnkit:trigger:file-watch:1`
 * and task header `watchPath` (and optionally `glob`, `events`) are picked up
 * from deployed processes and set up as filesystem watchers.
 *
 * Uses Node's native `fs.watch` — no extra dependencies.
 */
import { existsSync, readFileSync, readdirSync, statSync, watch } from "node:fs"
import type { FSWatcher } from "node:fs"
import { homedir } from "node:os"
import { basename, join, relative } from "node:path"
import { clusterApiUrl, getActiveProfile, getAuthHeader } from "@bpmnkit/profiles"

// ── Types ─────────────────────────────────────────────────────────────────────

interface WatchDef {
	processId: string
	watchPath: string
	/** Glob suffix to filter filenames (e.g. "*.md") — only basename is checked */
	glob?: string
	/** Which events to react to: "add" | "change" | "all" */
	events: "add" | "change" | "all"
}

// ── Active watchers ───────────────────────────────────────────────────────────

const watchers = new Map<string, FSWatcher>()

function stopAll(): void {
	for (const w of watchers.values()) w.close()
	watchers.clear()
}

// ── Glob matcher (basename only) ──────────────────────────────────────────────

function matchesGlob(filename: string, glob: string): boolean {
	const re = new RegExp(
		`^${glob
			.replace(/[.+^${}()|[\]\\]/g, "\\$&")
			.replace(/\*/g, ".*")
			.replace(/\?/g, ".")}$`,
	)
	return re.test(filename)
}

// ── Start a process instance ──────────────────────────────────────────────────

async function fireProcess(processId: string, variables: Record<string, unknown>): Promise<void> {
	const profile = getActiveProfile()
	if (!profile?.config.baseUrl) return
	const baseUrl = profile.config.baseUrl.replace(/\/$/, "")
	if (!baseUrl.startsWith("http")) return

	let authHeader = ""
	try {
		authHeader = await getAuthHeader(profile.config)
	} catch {
		// proceed unauthenticated
	}

	const res = await fetch(clusterApiUrl(baseUrl, "/process-instances"), {
		method: "POST",
		headers: { authorization: authHeader, "content-type": "application/json" },
		body: JSON.stringify({ processDefinitionId: processId, variables }),
	})

	if (res.ok) {
		const data = (await res.json()) as { processInstanceKey?: string }
		console.log(
			`[trigger:file-watch] fired ${processId} for ${String(variables.filePath)} → ${data.processInstanceKey ?? "?"}`,
		)
	} else {
		console.error(`[trigger:file-watch] failed to start ${processId}: ${res.status}`)
	}
}

// ── Path helpers ──────────────────────────────────────────────────────────────

function resolvePath(raw: string): string {
	if (raw === "~" || raw.startsWith("~/")) return homedir() + raw.slice(1)
	return raw
}

// Track file modification times to distinguish add vs change
const mtimeCache = new Map<string, number>()

function startWatcher(def: WatchDef): void {
	const dir = resolvePath(def.watchPath)
	if (!existsSync(dir)) {
		console.warn(`[trigger:file-watch] path not found, skipping: ${dir}`)
		return
	}

	// Seed mtime cache so existing files don't fire as "add" on startup
	try {
		for (const entry of readdirSync(dir)) {
			const full = join(dir, entry)
			try {
				mtimeCache.set(full, statSync(full).mtimeMs)
			} catch {
				// skip
			}
		}
	} catch {
		// skip
	}

	const watcher = watch(dir, { persistent: false }, (event, filename) => {
		if (!filename) return
		const file = basename(filename)
		if (def.glob && !matchesGlob(file, def.glob)) return

		const filePath = join(dir, filename)
		let mtime = 0
		try {
			mtime = statSync(filePath).mtimeMs
		} catch {
			return // file deleted — skip
		}

		const prev = mtimeCache.get(filePath)
		const isAdd = prev === undefined
		const isChange = !isAdd && mtime !== prev
		mtimeCache.set(filePath, mtime)

		if (def.events === "add" && !isAdd) return
		if (def.events === "change" && !isChange) return

		let content = ""
		try {
			if (statSync(filePath).size < 1_000_000) {
				content = readFileSync(filePath, "utf8")
			}
		} catch {
			// ignore read errors
		}

		void fireProcess(def.processId, {
			filePath,
			fileName: file,
			fileContent: content,
			relativePath: relative(dir, filePath),
			eventType: isAdd ? "add" : "change",
		})
	})

	watchers.set(`${def.processId}:${dir}`, watcher)
	console.log(`[trigger:file-watch] watching ${dir} for process ${def.processId}`)
}

// ── BPMN scanning ─────────────────────────────────────────────────────────────

interface DeployedProcess {
	processDefinitionId: string
	processDefinitionKey: string
}

/** The latest version of every deployed process definition. */
export async function fetchDeployedProcesses(
	baseUrl: string,
	authHeader: string,
): Promise<DeployedProcess[]> {
	const res = await fetch(clusterApiUrl(baseUrl, "/process-definitions/search"), {
		method: "POST",
		headers: { authorization: authHeader, "content-type": "application/json" },
		body: JSON.stringify({ page: { limit: 100 } }),
	})
	if (!res.ok) return []
	const data = (await res.json()) as {
		items?: { processDefinitionId?: string; processDefinitionKey?: string; version?: number }[]
	}
	const latest = new Map<string, { key: string; version: number }>()
	for (const item of data.items ?? []) {
		if (!item.processDefinitionId || !item.processDefinitionKey) continue
		const version = item.version ?? 0
		const seen = latest.get(item.processDefinitionId)
		if (!seen || version > seen.version) {
			latest.set(item.processDefinitionId, { key: item.processDefinitionKey, version })
		}
	}
	return [...latest].map(([processDefinitionId, { key }]) => ({
		processDefinitionId,
		processDefinitionKey: key,
	}))
}

/** The BPMN XML of a process definition. The endpoint takes the key and answers XML, not JSON. */
export async function fetchProcessXml(
	baseUrl: string,
	authHeader: string,
	processDefinitionKey: string,
): Promise<string | null> {
	const res = await fetch(
		clusterApiUrl(baseUrl, `/process-definitions/${encodeURIComponent(processDefinitionKey)}/xml`),
		{ headers: { authorization: authHeader, accept: "text/xml" } },
	)
	// 204: the definition has no XML
	if (!res.ok || res.status === 204) return null
	return await res.text()
}

/**
 * Extract file-watch trigger definitions from BPMN XML.
 * Looks for service tasks with job type `io.bpmnkit:trigger:file-watch:1`
 * and task headers `watchPath`, `glob?`, `events?`.
 */
function extractWatchDefs(processId: string, xml: string): WatchDef[] {
	const defs: WatchDef[] = []

	const taskRe =
		/<serviceTask[^>]*>[\s\S]*?<zeebe:taskDefinition[^>]*type="io\.bpmnkit:trigger:file-watch:1"[\s\S]*?<\/serviceTask>/g

	let m: RegExpExecArray | null
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop
	while ((m = taskRe.exec(xml)) !== null) {
		const block = m[0]

		const watchPath = /zeebe:header key="watchPath"\s+value="([^"]+)"/.exec(block)?.[1]
		if (!watchPath) continue

		const glob = /zeebe:header key="glob"\s+value="([^"]+)"/.exec(block)?.[1]
		const eventsRaw = /zeebe:header key="events"\s+value="(add|change|all)"/.exec(block)?.[1]
		const events = (eventsRaw ?? "all") as "add" | "change" | "all"

		defs.push({ processId, watchPath, glob, events })
	}

	return defs
}

// ── Scan and (re)apply watchers ───────────────────────────────────────────────

async function scanAndApply(): Promise<void> {
	const profile = getActiveProfile()
	if (!profile?.config.baseUrl) return
	const baseUrl = profile.config.baseUrl.replace(/\/$/, "")
	if (!baseUrl.startsWith("http")) return

	let authHeader = ""
	try {
		authHeader = await getAuthHeader(profile.config)
	} catch {
		// proceed unauthenticated
	}

	let processes: DeployedProcess[]
	try {
		processes = await fetchDeployedProcesses(baseUrl, authHeader)
	} catch {
		return
	}

	const newDefs: WatchDef[] = []
	for (const proc of processes) {
		const xml = await fetchProcessXml(baseUrl, authHeader, proc.processDefinitionKey).catch(
			() => null,
		)
		if (xml) {
			newDefs.push(...extractWatchDefs(proc.processDefinitionId, xml))
		}
	}

	if (newDefs.length === 0) return

	// Restart all watchers with the fresh set
	stopAll()
	for (const def of newDefs) {
		startWatcher(def)
	}
}

// ── Public API ────────────────────────────────────────────────────────────────

const SCAN_INTERVAL_MS = 60_000

export function startFileWatchTrigger(): void {
	void scanAndApply()

	setInterval(() => {
		void scanAndApply()
	}, SCAN_INTERVAL_MS)
}
