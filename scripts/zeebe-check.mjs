#!/usr/bin/env node
// CI oracle: runs Zeebe's real BpmnValidator (tools/zeebe-check) over every BPMN the conformance
// corpus records and compares the verdicts with the expectations in case.json and the shrink-only
// allowlist doc/deployability/known-undeployable.json.
//
//   node scripts/zeebe-check.mjs [--base <git-ref>] [--seed-allowlist] [--update-repros] [--json]
import { execFileSync, spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import {
	diffExpectations,
	diffVerdicts,
	expectationOf,
	shrinkViolations,
	sortedObject,
} from "./zeebe-check-lib.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const conformance = join(root, "conformance")
const tool = join(root, "tools/zeebe-check")
const allowPath = join(root, "doc/deployability/known-undeployable.json")
const allowRel = "doc/deployability/known-undeployable.json"
const reproDir = join(root, "doc/deployability/repro")
const verdictsPath = join(reproDir, "expected-verdicts.json")

const argv = process.argv.slice(2)
const flag = (n) => argv.includes(n)
const baseIdx = argv.indexOf("--base")
const baseRef = baseIdx >= 0 ? argv[baseIdx + 1] : undefined
if (baseIdx >= 0 && (baseRef === undefined || baseRef.startsWith("--"))) {
	console.error("--base needs a git ref")
	process.exit(2)
}

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"))
const writeJson = (p, v) => writeFileSync(p, `${JSON.stringify(v, null, "\t")}\n`)
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex")

function build() {
	for (const bin of ["java", "javac", "mvn"]) {
		const r = spawnSync(bin, [bin === "mvn" ? "-v" : "-version"], { stdio: "ignore" })
		if (r.error) {
			console.error(`zeebe-check needs Java 21 and Maven on PATH; \`${bin}\` was not found.`)
			process.exit(2)
		}
	}
	const pom = join(tool, "pom.xml")
	const stamp = join(tool, "lib/.pom-sha256")
	if (!existsSync(stamp) || readFileSync(stamp, "utf8") !== sha(pom)) {
		console.error("zeebe-check: resolving Zeebe dependencies (first run only)...")
		run("mvn", ["-q", "-B", "dependency:copy-dependencies", "-DoutputDirectory=lib"])
		writeFileSync(stamp, sha(pom))
	}
	const src = join(tool, "src/ZCheck.java")
	const cls = join(tool, "out/ZCheck.class")
	if (!existsSync(cls) || statSync(cls).mtimeMs < statSync(src).mtimeMs) {
		mkdirSync(join(tool, "out"), { recursive: true })
		run("javac", ["-cp", "lib/*", "-d", "out", "src/ZCheck.java"])
	}
}

function run(cmd, args) {
	const r = spawnSync(cmd, args, { cwd: tool, encoding: "utf8" })
	if (r.status !== 0) {
		console.error(`${cmd} failed:\n${r.stdout}${r.stderr}`)
		process.exit(2)
	}
}

/** Zeebe verdicts for absolute paths. Error lists are sorted: Zeebe's order is not stable. */
function validate(paths) {
	const dir = mkdtempSync(join(tmpdir(), "zeebe-check-"))
	try {
		const list = join(dir, "files.txt")
		writeFileSync(list, `${paths.join("\n")}\n`)
		const r = spawnSync("java", ["-cp", "out:lib/*", "ZCheck", "--json", `@${list}`], {
			cwd: tool,
			encoding: "utf8",
			maxBuffer: 1 << 28,
		})
		const out = new Map()
		for (const line of r.stdout.split("\n")) {
			if (!line.startsWith("{")) continue
			const v = JSON.parse(line)
			out.set(v.file, { ok: v.ok, errors: [...v.errors].sort() })
		}
		if (out.size !== paths.length) {
			console.error(`zeebe-check: expected ${paths.length} verdicts, got ${out.size}\n${r.stderr}`)
			process.exit(2)
		}
		return out
	} finally {
		rmSync(dir, { recursive: true, force: true })
	}
}

const subdirs = (d) =>
	existsSync(d)
		? readdirSync(d, { withFileTypes: true })
				.filter((e) => e.isDirectory())
				.map((e) => e.name)
				.sort()
		: []

const OUTPUTS = {
	builder: ["expected/output.bpmn"],
	text: ["expected/output.bpmn"],
	compact: ["expected/expanded.bpmn", "expected/output.bpmn"],
	bpmn: ["expected/roundtrip.bpmn"],
}

function collect() {
	const cases = []
	for (const [gen, files] of Object.entries(OUTPUTS)) {
		for (const name of subdirs(join(conformance, gen))) {
			const dir = join(conformance, gen, name)
			const cj = join(dir, "case.json")
			const where = relative(root, cj)
			const exp = expectationOf(existsSync(cj) ? readJson(cj) : undefined, where)
			for (const f of files) {
				const abs = join(dir, f)
				if (existsSync(abs)) cases.push({ key: relative(conformance, abs), gen, abs, ...exp })
			}
		}
	}
	return cases
}

function repros() {
	return existsSync(reproDir)
		? readdirSync(reproDir)
				.filter((f) => f.endsWith(".bpmn"))
				.sort()
		: []
}

function pomVersion() {
	const m = readFileSync(join(tool, "pom.xml"), "utf8").match(
		/<artifactId>zeebe-workflow-engine<\/artifactId>\s*<version>([^<]+)<\/version>/,
	)
	if (!m) throw new Error("tools/zeebe-check/pom.xml: no zeebe-workflow-engine version")
	return m[1]
}

function git(...args) {
	return execFileSync("git", args, {
		cwd: root,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	})
}

const NOTE =
	"Corpus BPMN that Zeebe's deploy-time validator rejects, with the first error. This list may only shrink: fix the generator, then delete the entry. CI fails on additions (against the base branch), on entries that Zeebe now accepts, and on entries whose case no longer exists. Regenerate with `node scripts/zeebe-check.mjs --seed-allowlist` only after re-recording the corpus."

function main() {
	const version = pomVersion()
	build()
	const cases = collect()
	const files = repros()

	const results = new Map()
	const all = validate([...cases.map((c) => c.abs), ...files.map((f) => join(reproDir, f))])
	for (const c of cases) results.set(c.key, all.get(c.abs))
	const verdicts = {}
	for (const f of files) verdicts[f] = all.get(join(reproDir, f))

	if (flag("--update-repros")) {
		writeJson(verdictsPath, sortedObject(verdicts))
		console.log(`wrote ${relative(root, verdictsPath)} (${files.length} repros)`)
	}
	if (flag("--seed-allowlist")) {
		const cs = {}
		for (const c of cases) {
			const r = results.get(c.key)
			if (c.deployable && !r.ok) cs[c.key] = r.errors[0] ?? "(no message)"
		}
		writeJson(allowPath, { zeebeVersion: version, note: NOTE, cases: sortedObject(cs) })
		console.log(`wrote ${allowRel} (${Object.keys(cs).length} cases)`)
	}

	const failures = []
	const warnings = []
	if (!existsSync(allowPath)) {
		failures.push(`${allowRel} is missing (create it with --seed-allowlist)`)
	}
	const allowFile = existsSync(allowPath)
		? readJson(allowPath)
		: { zeebeVersion: version, cases: {} }
	const allow = allowFile.cases ?? {}
	if (allowFile.zeebeVersion !== version) {
		failures.push(
			`${allowRel}: zeebeVersion ${allowFile.zeebeVersion} != pom.xml ${version}; re-seed after re-recording`,
		)
	}
	const keys = Object.keys(allow)
	if (keys.join("\n") !== [...keys].sort().join("\n"))
		failures.push(`${allowRel}: keys are not sorted`)

	const d = diffExpectations({ cases, results, allow })
	failures.push(...d.failures)
	warnings.push(...d.warnings)

	if (baseRef !== undefined) {
		let known = true
		try {
			git("rev-parse", "--verify", "--quiet", `${baseRef}^{commit}`)
		} catch {
			known = false
			failures.push(`--base ${baseRef}: not a known ref (fetch it, e.g. git fetch origin main)`)
		}
		if (known) {
			let base
			try {
				base = git("show", `${baseRef}:${allowRel}`)
			} catch {
				console.log(`notice: ${allowRel} does not exist at ${baseRef}; shrink check skipped`)
			}
			if (base !== undefined)
				failures.push(...shrinkViolations(allow, JSON.parse(base).cases ?? {}))
		}
	}

	const verdictFile = existsSync(verdictsPath) ? readJson(verdictsPath) : {}
	if (!existsSync(verdictsPath))
		failures.push(`${relative(root, verdictsPath)} is missing (run --update-repros)`)
	else failures.push(...diffVerdicts(verdictFile, verdicts).map((m) => `repro ${m}`))

	const summary = {}
	for (const gen of Object.keys(OUTPUTS)) {
		const own = cases.filter((c) => c.gen === gen)
		summary[gen] = { rejected: own.filter((c) => !results.get(c.key).ok).length, total: own.length }
	}
	if (flag("--json")) {
		console.log(
			JSON.stringify(
				{ zeebeVersion: version, summary, allowlist: keys.length, warnings, failures },
				null,
				2,
			),
		)
	} else {
		console.log(`Zeebe ${version}`)
		for (const [g, s] of Object.entries(summary))
			console.log(`  ${g.padEnd(8)} rejected ${s.rejected} / ${s.total}`)
		console.log(`  repros   ${files.length}, allowlist ${keys.length}`)
		for (const w of warnings) console.log(`warning: ${w}`)
		for (const f of failures) console.log(`FAIL ${f}`)
		console.log(
			failures.length === 0 ? "zeebe-check: ok" : `zeebe-check: ${failures.length} failure(s)`,
		)
	}
	process.exit(failures.length === 0 ? 0 : 1)
}

main()
