// Pure logic for scripts/zeebe-check.mjs, kept free of I/O so it can be unit-tested.

/** Reads `deployable` / `deployableReason` from a parsed case.json (or `undefined` when absent). */
export function expectationOf(caseJson, where) {
	if (caseJson === undefined || caseJson.deployable === undefined) return { deployable: true }
	if (typeof caseJson.deployable !== "boolean") {
		throw new Error(`${where}: "deployable" must be a boolean`)
	}
	if (caseJson.deployable) return { deployable: true }
	const reason = caseJson.deployableReason
	if (typeof reason !== "string" || reason.trim() === "") {
		throw new Error(`${where}: "deployable": false requires a non-empty "deployableReason"`)
	}
	return { deployable: false, reason }
}

/**
 * Compares Zeebe's verdicts with what the corpus expects.
 * @param {{ cases: { key: string, deployable: boolean }[], results: Map<string, { ok: boolean, errors: string[] }>, allow: Record<string, string> }} input
 * @returns {{ failures: string[], warnings: string[] }}
 */
export function diffExpectations({ cases, results, allow }) {
	const failures = []
	const warnings = []
	const byKey = new Map(cases.map((c) => [c.key, c]))
	for (const c of cases) {
		const r = results.get(c.key)
		if (r === undefined) {
			failures.push(`${c.key}: Zeebe produced no verdict`)
			continue
		}
		const listed = Object.hasOwn(allow, c.key)
		if (!c.deployable) {
			if (r.ok) warnings.push(`${c.key}: marked deployable:false but Zeebe accepts it`)
			continue
		}
		if (!r.ok && !listed) {
			failures.push(
				`${c.key}: rejected by Zeebe and not in the allowlist: ${r.errors[0] ?? "(no message)"}`,
			)
		}
		if (r.ok && listed) {
			failures.push(`${c.key}: now accepted by Zeebe; remove it from known-undeployable.json`)
		}
	}
	for (const key of Object.keys(allow)) {
		const c = byKey.get(key)
		if (c === undefined) failures.push(`${key}: allowlisted but no such case`)
		else if (!c.deployable)
			failures.push(`${key}: allowlisted but the case is marked deployable:false`)
	}
	return { failures, warnings }
}

/** Allowlist keys that the base ref's allowlist did not have: the list may only shrink. */
export function shrinkViolations(allow, baseAllow) {
	return Object.keys(allow)
		.filter((k) => !Object.hasOwn(baseAllow, k))
		.sort()
		.map(
			(k) => `${k}: not in the allowlist at the base ref; known-undeployable.json may only shrink`,
		)
}

/** Differences between recorded repro verdicts and the current ones (error lists compared as sets). */
export function diffVerdicts(expected, actual) {
	const out = []
	const norm = (v) => JSON.stringify({ ok: v.ok, errors: [...v.errors].sort() })
	for (const f of new Set([...Object.keys(expected), ...Object.keys(actual)]).values()) {
		if (!Object.hasOwn(expected, f)) out.push(`${f}: no recorded verdict (run --update-repros)`)
		else if (!Object.hasOwn(actual, f)) out.push(`${f}: recorded but the file is gone`)
		else if (norm(expected[f]) !== norm(actual[f])) {
			out.push(
				`${f}: verdict changed\n    recorded: ${norm(expected[f])}\n    now:      ${norm(actual[f])}`,
			)
		}
	}
	return out.sort()
}

/** Sorts object keys so generated JSON is stable. */
export function sortedObject(o) {
	return Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
}
