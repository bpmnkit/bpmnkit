#!/usr/bin/env node
// Nightly real-broker check: deploys every BPMN the conformance corpus records, the repros and
// the broker-only repros to a running Camunda 8 engine through its REST API (POST /v2/deployments),
// one deployment each, and compares the outcome with the recorded expectations. Unlike
// scripts/zeebe-check.mjs (Zeebe's BpmnValidator in-process), this also covers what only a broker
// decides: the straight-through-loop check, deployment binding and duplicate ids across resources.
//
//   node scripts/zeebe-broker-check.mjs --version 8.8.46 [--url http://localhost:8080]
//     [--out <dir>] [--ready-timeout 300] [--concurrency 4] [--root <repo>]
//
// Basic auth, when the engine needs it: ZEEBE_REST_USER / ZEEBE_REST_PASSWORD.
// Exit 0: no mismatch; 1: mismatches (see <out>/mismatches.json); 2: the engine never got ready.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { collectCases, listRepros } from "./lib/zeebe-corpus.mjs"
import {
	classify,
	problemText,
	retryable,
	ruleOfRepro,
	summarize,
	targetVersionOf,
	topologyReady,
} from "./zeebe-broker-lib.mjs"

const argv = process.argv.slice(2)
const opt = (name, fallback) => {
	const i = argv.indexOf(name)
	if (i < 0) return fallback
	const v = argv[i + 1]
	if (v === undefined || v.startsWith("--")) {
		console.error(`${name} needs a value`)
		process.exit(2)
	}
	return v
}

const root = resolve(opt("--root", join(dirname(fileURLToPath(import.meta.url)), "..")))
const url = opt("--url", "http://localhost:8080").replace(/\/+$/, "")
const version = opt("--version")
const out = resolve(opt("--out", join(root, "zeebe-broker-check")))
const readyTimeout = Number(opt("--ready-timeout", "300")) * 1000
const concurrency = Math.max(1, Number(opt("--concurrency", "4")))
const retryBase = Number(opt("--retry-base-ms", "1000"))
if (!version) {
	console.error("--version <camunda version> is required, e.g. --version 8.8.46")
	process.exit(2)
}

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const headers = {}
if (process.env.ZEEBE_REST_USER) {
	const token = Buffer.from(
		`${process.env.ZEEBE_REST_USER}:${process.env.ZEEBE_REST_PASSWORD ?? ""}`,
	).toString("base64")
	headers.authorization = `Basic ${token}`
}

async function request(path, init = {}) {
	const res = await fetch(`${url}${path}`, {
		...init,
		headers: { ...headers, ...(init.headers ?? {}) },
		signal: AbortSignal.timeout(60_000),
	})
	const text = await res.text()
	let body = text
	try {
		body = JSON.parse(text)
	} catch {}
	return { status: res.status, body }
}

async function waitReady() {
	const until = Date.now() + readyTimeout
	let last = "no answer"
	while (Date.now() < until) {
		try {
			const r = await request("/v2/topology")
			if (r.status === 200 && topologyReady(r.body)) return
			last = `HTTP ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`
		} catch (e) {
			last = e.cause?.code ?? e.message
		}
		await sleep(2000)
	}
	throw new Error(`engine at ${url} not ready after ${readyTimeout / 1000}s (last: ${last})`)
}

/** Deploys resources as one deployment; retries what is not a verdict on the BPMN. */
async function deploy(resources) {
	let last
	for (let attempt = 0; attempt < 6; attempt++) {
		if (attempt > 0) await sleep(retryBase * 2 ** (attempt - 1))
		const form = new FormData()
		for (const r of resources) {
			form.append("resources", new Blob([r.xml], { type: "application/xml" }), r.name)
		}
		try {
			const res = await request("/v2/deployments", { method: "POST", body: form })
			if (res.status >= 200 && res.status < 300) return { ok: true, detail: "" }
			last = { ok: false, detail: problemText(res.body), status: res.status }
			if (!retryable(res.status)) return last
		} catch (e) {
			last = { ok: false, detail: `request failed: ${e.cause?.code ?? e.message}` }
		}
	}
	return { ...last, transient: true }
}

function items() {
	const list = []
	const allowPath = join(root, "doc/deployability/known-undeployable.json")
	const allow = existsSync(allowPath) ? (readJson(allowPath).cases ?? {}) : {}
	for (const c of collectCases(root)) {
		const xml = readFileSync(c.abs, "utf8")
		list.push({
			key: c.key,
			kind: "case",
			resources: [{ name: c.key.replaceAll("/", "__"), xml }],
			expect: { ok: c.deployable && !Object.hasOwn(allow, c.key) },
			target: targetVersionOf(xml),
		})
	}
	const rules = existsSync(join(root, "spec/zeebe-rules.json"))
		? new Map(readJson(join(root, "spec/zeebe-rules.json")).rules.map((r) => [r.id, r]))
		: new Map()
	const reproDir = join(root, "doc/deployability/repro")
	const verdictsPath = join(reproDir, "expected-verdicts.json")
	const verdicts = existsSync(verdictsPath) ? readJson(verdictsPath) : {}
	for (const f of listRepros(root)) {
		const v = verdicts[f]
		if (v === undefined) continue
		list.push({
			key: `repro/${f}`,
			kind: "repro",
			resources: [{ name: f, xml: readFileSync(join(reproDir, f), "utf8") }],
			expect: { ok: v.ok, errors: v.errors },
			since: rules.get(ruleOfRepro(f))?.since,
		})
	}
	const brokerDir = join(root, "doc/deployability/broker-repro")
	const brokerPath = join(brokerDir, "deployments.json")
	if (existsSync(brokerPath)) {
		for (const [name, d] of Object.entries(readJson(brokerPath).deployments)) {
			list.push({
				key: `broker-repro/${name}`,
				kind: "broker-repro",
				resources: d.resources.map((f) => ({
					name: f,
					xml: readFileSync(join(brokerDir, f), "utf8"),
				})),
				expect: { ok: d.ok, contains: d.contains },
				since: d.since,
			})
		}
	}
	return list
}

async function pool(list, n, fn) {
	const results = new Array(list.length)
	let next = 0
	await Promise.all(
		Array.from({ length: Math.min(n, list.length) }, async () => {
			while (next < list.length) {
				const i = next++
				results[i] = await fn(list[i])
			}
		}),
	)
	return results
}

async function main() {
	const list = items()
	console.log(`Camunda ${version} at ${url}: ${list.length} deployments to check`)
	try {
		await waitReady()
	} catch (e) {
		console.error(e.message)
		process.exit(2)
	}
	const results = await pool(list, concurrency, async (item) => {
		const outcome = await deploy(item.resources)
		const verdict = outcome.transient
			? { status: "fail", why: `no verdict (engine kept failing): ${outcome.detail}` }
			: classify(item, outcome, version)
		return { key: item.key, kind: item.kind, ...verdict, detail: outcome.detail }
	})

	mkdirSync(out, { recursive: true })
	const fails = results.filter((r) => r.status === "fail")
	const md = summarize(version, results)
	writeFileSync(join(out, "results.json"), `${JSON.stringify({ version, results }, null, "\t")}\n`)
	writeFileSync(join(out, "mismatches.json"), `${JSON.stringify(fails, null, "\t")}\n`)
	writeFileSync(join(out, "summary.md"), md)
	if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`)
	console.log(md)
	console.log(
		fails.length === 0
			? `zeebe-broker-check: ok (${relative(process.cwd(), out) || "."})`
			: `zeebe-broker-check: ${fails.length} mismatch(es); see ${join(out, "mismatches.json")}`,
	)
	process.exit(fails.length === 0 ? 0 : 1)
}

await main()
