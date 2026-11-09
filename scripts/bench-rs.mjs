#!/usr/bin/env node
// Runs the Rust benches (crates/*/benches/*.rs) and compares them with benches/rust-baseline.json.
//
//   node scripts/bench-rs.mjs            compare; exit 1 on a regression above the threshold
//   node scripts/bench-rs.mjs --update   rewrite the baseline from this machine's numbers
//   --runs N (default 3)  --threshold 0.2  --warn (never fail)
//
// Each row keeps the fastest of N runs: the minimum is the least noisy estimate on a shared
// runner. Timings only compare on like hardware, so a baseline recorded on another CPU model
// only warns; record it on the CI runner (the nightly workflow's `update` input) to make
// regressions fail.
import { execFileSync } from "node:child_process"
import { appendFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { cpus } from "node:os"
import { basename, dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const BASELINE = join(ROOT, "benches/rust-baseline.json")

const ROW = /^(\S.*?)\s+([0-9]+(?:\.[0-9]+)?)\s+(µs|ms) per (?:pass|expr|call)$/

/** Rows of one bench's stdout, in µs. */
export function parseRows(stdout) {
	const rows = {}
	for (const line of stdout.split("\n")) {
		const m = ROW.exec(line.trim())
		if (m) rows[m[1]] = Number(m[2]) * (m[3] === "ms" ? 1000 : 1)
	}
	return rows
}

/** Compares current rows with the baseline's; `ratio` is current / baseline. */
export function compare(baseline, current, threshold) {
	const regressions = []
	const improvements = []
	const missing = []
	for (const [key, base] of Object.entries(baseline)) {
		const now = current[key]
		if (now === undefined) {
			missing.push(key)
			continue
		}
		const ratio = now / base
		if (ratio > 1 + threshold) regressions.push({ key, base, now, ratio })
		else if (ratio < 1 / (1 + threshold)) improvements.push({ key, base, now, ratio })
	}
	const added = Object.keys(current).filter((k) => !(k in baseline))
	return { regressions, improvements, missing, added }
}

/** Three significant digits: enough for a 20% gate, and the file stays readable. */
const round = (us) => Number(us.toPrecision(3))

function benches() {
	const out = []
	for (const dir of readdirSync(join(ROOT, "crates")).sort()) {
		let files
		try {
			files = readdirSync(join(ROOT, "crates", dir, "benches"))
		} catch {
			continue
		}
		const manifest = readFileSync(join(ROOT, "crates", dir, "Cargo.toml"), "utf8")
		const crate = /^name\s*=\s*"([^"]+)"/m.exec(manifest)[1]
		for (const f of files.filter((f) => f.endsWith(".rs")).sort()) {
			out.push({ crate, bench: basename(f, ".rs") })
		}
	}
	return out
}

function run(runs) {
	const rows = {}
	for (const { crate, bench } of benches()) {
		for (let i = 0; i < runs; i++) {
			const stdout = execFileSync(
				"cargo",
				["bench", "--locked", "-q", "-p", crate, "--bench", bench],
				{ cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
			)
			for (const [label, us] of Object.entries(parseRows(stdout))) {
				const key = `${crate}/${bench}/${label}`
				rows[key] = Math.min(rows[key] ?? Number.POSITIVE_INFINITY, us)
			}
		}
	}
	return rows
}

function arg(name, fallback) {
	const i = process.argv.indexOf(name)
	return i === -1 ? fallback : process.argv[i + 1]
}

function main() {
	const runs = Number(arg("--runs", 3))
	const threshold = Number(arg("--threshold", 0.2))
	const cpu = cpus()[0]?.model.trim() ?? "unknown"
	const current = run(runs)

	if (process.argv.includes("--update")) {
		const sorted = Object.fromEntries(
			Object.keys(current)
				.sort()
				.map((k) => [k, round(current[k])]),
		)
		writeFileSync(BASELINE, `${JSON.stringify({ cpu, unit: "µs", rows: sorted }, null, "\t")}\n`)
		console.log(`wrote ${Object.keys(sorted).length} rows to benches/rust-baseline.json`)
		return
	}

	const baseline = JSON.parse(readFileSync(BASELINE, "utf8"))
	const result = compare(baseline.rows, current, threshold)
	const sameCpu = baseline.cpu === cpu
	const fail = result.regressions.length > 0 && sameCpu && !process.argv.includes("--warn")
	const gh = process.env.GITHUB_ACTIONS === "true"

	const pct = (r) => `${r.ratio > 1 ? "+" : ""}${((r.ratio - 1) * 100).toFixed(1)}%`
	const lines = [
		"| row | baseline µs | now µs | change |",
		"| --- | ---: | ---: | ---: |",
		...Object.keys(baseline.rows).map((k) => {
			const base = baseline.rows[k]
			const now = current[k]
			return now === undefined
				? `| ${k} | ${base} | missing | |`
				: `| ${k} | ${base} | ${round(now)} | ${pct({ ratio: now / base })} |`
		}),
	]
	console.log(lines.join("\n"))
	if (!sameCpu) {
		const note = `baseline was recorded on "${baseline.cpu}", this is "${cpu}": regressions only warn`
		console.log(gh ? `::warning::${note}` : `note: ${note}`)
	}
	for (const r of result.regressions) {
		const msg = `${r.key}: ${pct(r)} (${r.base} → ${round(r.now)} µs)`
		console.log(
			gh ? `::${fail ? "error" : "warning"}::bench regression ${msg}` : `REGRESSION ${msg}`,
		)
	}
	for (const k of result.missing) console.log(`${gh ? "::warning::" : ""}row missing: ${k}`)
	for (const k of result.added) console.log(`new row (not in baseline): ${k}`)
	if (process.env.GITHUB_STEP_SUMMARY) {
		appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Rust benches\n\n${lines.join("\n")}\n`)
	}
	if (fail) {
		console.error(`${result.regressions.length} row(s) regressed more than ${threshold * 100}%`)
		process.exit(1)
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
