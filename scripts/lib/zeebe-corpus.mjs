// The BPMN the conformance corpus records, with what each case expects of Zeebe. Shared by
// scripts/zeebe-check.mjs (Zeebe's validator) and scripts/zeebe-broker-check.mjs (a real broker).
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"
import { expectationOf } from "../zeebe-check-lib.mjs"

export const OUTPUTS = {
	builder: ["expected/output.bpmn"],
	text: ["expected/output.bpmn"],
	compact: ["expected/expanded.bpmn", "expected/output.bpmn"],
	bpmn: ["expected/roundtrip.bpmn"],
}

const subdirs = (d) =>
	existsSync(d)
		? readdirSync(d, { withFileTypes: true })
				.filter((e) => e.isDirectory())
				.map((e) => e.name)
				.sort()
		: []

/** Every recorded output: `{ key, gen, abs, deployable, reason? }`, keyed relative to conformance/. */
export function collectCases(root) {
	const conformance = join(root, "conformance")
	const cases = []
	for (const [gen, files] of Object.entries(OUTPUTS)) {
		for (const name of subdirs(join(conformance, gen))) {
			const dir = join(conformance, gen, name)
			const cj = join(dir, "case.json")
			const where = relative(root, cj)
			const exp = expectationOf(
				existsSync(cj) ? JSON.parse(readFileSync(cj, "utf8")) : undefined,
				where,
			)
			for (const f of files) {
				const abs = join(dir, f)
				if (existsSync(abs)) cases.push({ key: relative(conformance, abs), gen, abs, ...exp })
			}
		}
	}
	return cases
}

/** The repro file names under doc/deployability/repro, sorted. */
export function listRepros(root) {
	const dir = join(root, "doc/deployability/repro")
	return existsSync(dir)
		? readdirSync(dir)
				.filter((f) => f.endsWith(".bpmn"))
				.sort()
		: []
}
