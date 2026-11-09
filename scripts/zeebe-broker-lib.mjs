// Pure logic for scripts/zeebe-broker-check.mjs (the nightly real-broker check), kept free of
// I/O so it can be unit-tested against a mock.

/** "8.10.9" / "8.10" / "8.10.0-alpha1" → [8, 10]; undefined when it does not look like one. */
export function minorOf(version) {
	const m = /^(\d+)\.(\d+)/.exec(String(version ?? "").trim())
	return m ? [Number(m[1]), Number(m[2])] : undefined
}

/** a < b → negative, by major.minor only. */
export function compareMinor(a, b) {
	const x = minorOf(a)
	const y = minorOf(b)
	if (!x || !y) throw new Error(`not a version: ${!x ? a : b}`)
	return x[0] - y[0] || x[1] - y[1]
}

/** `modeler:executionPlatformVersion` of a BPMN file, if any. */
export function targetVersionOf(xml) {
	return /executionPlatformVersion\s*=\s*"([^"]+)"/.exec(xml)?.[1]
}

/** The rule a repro file is named after: `z100_script_static.bpmn` → `Z100`. */
export function ruleOfRepro(file) {
	const m = /^z(\d+)_/i.exec(file)
	return m ? `Z${m[1]}` : undefined
}

const squash = (s) => s.replace(/\s+/g, " ").trim()

/**
 * The part of a zeebe-check error that a broker's rejection must contain. zeebe-check prints
 * `<element path>: <message>`; the broker prints `- Element: <path>\n    - ERROR: <message>`.
 * Parse errors (`PARSE: SAXException ... / Error: URI=null Line=4: cvc-...`) are matched from
 * the schema message on, since the wrapper text differs between versions.
 */
export function needlesOf(error) {
	if (error.startsWith("PARSE: ")) {
		const tail = error.replace(/^PARSE: /, "")
		const m = /Line=\d+: (.*)$/s.exec(tail)
		return [squash(m ? m[1] : tail)]
	}
	const i = error.indexOf(": ")
	if (i < 0) return [squash(error)]
	return [squash(error.slice(0, i)), squash(error.slice(i + 2))]
}

/** Whether a broker rejection text contains every expected error. */
export function rejectionMatches(detail, expectedErrors) {
	const hay = squash(detail)
	return expectedErrors.every((e) => needlesOf(e).every((n) => hay.includes(n)))
}

/**
 * Classifies one deployment outcome.
 * @param {{
 *   key: string, kind: "case" | "repro" | "broker-repro",
 *   expect: { ok: boolean, errors?: string[], contains?: string[] },
 *   since?: string, target?: string,
 * }} item  what the corpus expects; `since` is the repro rule's first version, `target` the
 *   file's executionPlatformVersion
 * @param {{ ok: boolean, detail: string }} outcome  what the broker did
 * @param {string} brokerVersion
 * @returns {{ status: "pass" | "fail" | "skip" | "info", why: string }}
 */
export function classify(item, outcome, brokerVersion) {
	if (item.since && compareMinor(item.since, brokerVersion) > 0) {
		return { status: "skip", why: `rule since ${item.since}` }
	}
	const { expect } = item
	if (expect.ok && outcome.ok) return { status: "pass", why: "deployed" }
	if (expect.ok && !outcome.ok) {
		// A file written for a newer Camunda may use what an older broker lacks.
		if (item.target && minorOf(item.target) && compareMinor(item.target, brokerVersion) > 0) {
			return { status: "info", why: `targets ${item.target}: ${firstLine(outcome.detail)}` }
		}
		return { status: "fail", why: `rejected: ${firstLine(outcome.detail)}` }
	}
	if (outcome.ok) {
		// The allowlist and the repro verdicts come from one Zeebe version; older brokers may
		// not have the rule yet, so an unexpected accept on them is reported, not failed.
		return item.kind === "case"
			? { status: "info", why: "expected a rejection, but the broker deployed it" }
			: { status: "fail", why: "expected a rejection, but the broker deployed it" }
	}
	const needles = expect.contains ?? []
	const errors = expect.errors ?? []
	const hay = squash(outcome.detail).toLowerCase()
	if (!needles.every((n) => hay.includes(squash(n).toLowerCase()))) {
		return { status: "fail", why: `rejected for another reason: ${firstLine(outcome.detail)}` }
	}
	if (errors.length > 0 && !rejectionMatches(outcome.detail, errors)) {
		return { status: "fail", why: `rejection differs: ${firstLine(outcome.detail)}` }
	}
	return { status: "pass", why: "rejected as expected" }
}

function firstLine(s) {
	const line = squash(String(s ?? "")).slice(0, 300)
	return line === "" ? "(no detail)" : line
}

/**
 * Reads a /v2/topology body: ready when every partition known to the cluster has a healthy
 * leader. Older versions omit `health`; a leader is then enough.
 */
export function topologyReady(body) {
	const brokers = body?.brokers
	if (!Array.isArray(brokers) || brokers.length === 0) return false
	const count = body.partitionsCount ?? 1
	const leaders = new Set()
	for (const b of brokers) {
		for (const p of b.partitions ?? []) {
			if (p.role === "leader" && (p.health === undefined || p.health === "healthy")) {
				leaders.add(p.partitionId)
			}
		}
	}
	return leaders.size >= count
}

/** Whether an HTTP response or error is worth retrying (not a verdict on the BPMN). */
export function retryable(status) {
	return status === undefined || status === 408 || status === 429 || status >= 500
}

/** The rejection text of a problem+json body (RFC 7807), or the raw body. */
export function problemText(body) {
	if (body && typeof body === "object") {
		return [body.title, body.detail].filter((x) => typeof x === "string").join(": ")
	}
	return String(body ?? "")
}

/** Markdown summary for the job summary and the artifact. */
export function summarize(version, results) {
	const by = (s) => results.filter((r) => r.status === s)
	const lines = [
		`## Zeebe ${version}: real-broker deploy check`,
		"",
		"| pass | fail | info | skip |",
		"| ---: | ---: | ---: | ---: |",
		`| ${by("pass").length} | ${by("fail").length} | ${by("info").length} | ${by("skip").length} |`,
		"",
	]
	for (const [title, s] of [
		["Mismatches", "fail"],
		["Reported (older broker than the file targets, or a rule not in this version yet)", "info"],
	]) {
		const rs = by(s)
		if (rs.length === 0) continue
		lines.push(`### ${title}`, "")
		for (const r of rs.slice(0, 200)) lines.push(`- \`${r.key}\`: ${r.why.replace(/`/g, "'")}`)
		if (rs.length > 200) lines.push(`- … and ${rs.length - 200} more (see the artifact)`)
		lines.push("")
	}
	return lines.join("\n")
}
