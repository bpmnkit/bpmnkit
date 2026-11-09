// Runs scripts/zeebe-broker-check.mjs against a mock engine: a slow start, a transient 503 on
// deploy, and Zeebe-formatted rejections driven by markers in the fixture BPMN.
import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { after, before, test } from "node:test"
import { fileURLToPath } from "node:url"

const script = join(dirname(fileURLToPath(import.meta.url)), "zeebe-broker-check.mjs")

const bpmn = (body, version = "8.6.0") =>
	`<?xml version="1.0"?><definitions xmlns:modeler="m" modeler:executionPlatformVersion="${version}">${body}</definitions>`
const reject = (msg) => `<!-- reject: ${msg} -->`

const Z100 =
	"t > extensionElements > script: Expected expression but found static value 'a + 1'. An expression must start with '=' (e.g. '=a + 1')."

let dir
let server
let port
let state

function write(rel, text) {
	mkdirSync(dirname(join(dir, rel)), { recursive: true })
	writeFileSync(join(dir, rel), text)
}

function fixture({ goodRejected = false } = {}) {
	write("conformance/builder/good/expected/output.bpmn", bpmn(goodRejected ? reject("no") : ""))
	write("conformance/builder/listed/expected/output.bpmn", bpmn(reject("bill: Must have")))
	write("conformance/builder/newer/expected/output.bpmn", bpmn(reject("no zeebe:adHoc"), "8.10.0"))
	write(
		"doc/deployability/known-undeployable.json",
		JSON.stringify({ cases: { "builder/listed/expected/output.bpmn": "bill: Must have" } }),
	)
	write(
		"doc/deployability/repro/z100_script_static.bpmn",
		bpmn(
			reject(
				"'z100_script_static.bpmn': - Element: t > extensionElements > script\n    - ERROR: Expected expression but found static value 'a + 1'. An expression must start with '=' (e.g. '=a + 1').",
			),
		),
	)
	write(
		"doc/deployability/repro/expected-verdicts.json",
		JSON.stringify({ "z100_script_static.bpmn": { ok: false, errors: [Z100] } }),
	)
	write("spec/zeebe-rules.json", JSON.stringify({ rules: [{ id: "Z100", since: "8.0" }] }))
	write("doc/deployability/broker-repro/caller.bpmn", bpmn("<call/>"))
	write("doc/deployability/broker-repro/callee.bpmn", bpmn(""))
	write(
		"doc/deployability/broker-repro/deployments.json",
		JSON.stringify({
			deployments: {
				missing: {
					resources: ["caller.bpmn"],
					ok: false,
					contains: ["in current deployment, but not found"],
				},
				together: { resources: ["caller.bpmn", "callee.bpmn"], ok: true },
			},
		}),
	)
}

before(async () => {
	dir = mkdtempSync(join(tmpdir(), "zeebe-broker-"))
	server = createServer((req, res) => {
		let body = ""
		req.on("data", (d) => {
			body += d
		})
		req.on("end", () => {
			const send = (status, json) => {
				res.writeHead(status, { "content-type": "application/json" })
				res.end(JSON.stringify(json))
			}
			if (req.url === "/v2/topology") {
				state.topology++
				if (!state.ready || state.topology < 3) return send(503, { title: "UNAVAILABLE" })
				return send(200, {
					partitionsCount: 1,
					brokers: [{ partitions: [{ partitionId: 1, role: "leader", health: "healthy" }] }],
				})
			}
			if (req.url === "/v2/deployments" && req.method === "POST") {
				state.deploys++
				if (state.deploys === 1) return send(503, { title: "UNAVAILABLE", detail: "warming up" })
				const files = [...body.matchAll(/filename="([^"]+)"/g)].map((m) => m[1])
				const marker = /<!-- reject: ([\s\S]*?) -->/.exec(body)
				if (body.includes("<call/>") && !files.includes("callee.bpmn")) {
					return send(400, {
						title: "INVALID_ARGUMENT",
						detail:
							"Expected to find process with id 'callee' in current deployment, but not found.",
					})
				}
				if (marker) {
					return send(400, {
						title: "INVALID_ARGUMENT",
						detail: `Command 'CREATE' rejected with code 'INVALID_ARGUMENT': Expected to deploy new resources, but encountered the following errors:\n${marker[1]}`,
					})
				}
				return send(200, { deploymentKey: "1", deployments: [] })
			}
			send(404, {})
		})
	})
	await new Promise((r) => server.listen(0, "127.0.0.1", r))
	port = server.address().port
})

after(() => {
	server.close()
	rmSync(dir, { recursive: true, force: true })
})

function run(extra = []) {
	return new Promise((resolve) => {
		execFile(
			process.execPath,
			[
				script,
				"--root",
				dir,
				"--url",
				`http://127.0.0.1:${port}`,
				"--version",
				"8.6.42",
				"--out",
				join(dir, "out"),
				"--retry-base-ms",
				"10",
				...extra,
			],
			{ env: { ...process.env, GITHUB_STEP_SUMMARY: "" } },
			(err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr }),
		)
	})
}

test("waits for readiness, retries a 503, and matches every expectation", async () => {
	fixture()
	state = { ready: true, topology: 0, deploys: 0 }
	const r = await run()
	assert.equal(r.code, 0, r.stdout + r.stderr)
	assert.ok(state.topology >= 3)
	const { results } = JSON.parse(readFileSync(join(dir, "out/results.json"), "utf8"))
	const by = Object.fromEntries(results.map((x) => [x.key, x.status]))
	assert.deepEqual(by, {
		"builder/good/expected/output.bpmn": "pass",
		"builder/listed/expected/output.bpmn": "pass",
		"builder/newer/expected/output.bpmn": "info",
		"repro/z100_script_static.bpmn": "pass",
		"broker-repro/missing": "pass",
		"broker-repro/together": "pass",
	})
})

test("a deployable case the broker rejects is a mismatch", async () => {
	fixture({ goodRejected: true })
	state = { ready: true, topology: 0, deploys: 0 }
	const r = await run()
	assert.equal(r.code, 1, r.stdout + r.stderr)
	const fails = JSON.parse(readFileSync(join(dir, "out/mismatches.json"), "utf8"))
	assert.deepEqual(
		fails.map((f) => f.key),
		["builder/good/expected/output.bpmn"],
	)
	assert.match(readFileSync(join(dir, "out/summary.md"), "utf8"), /### Mismatches/)
})

test("an engine that never gets ready exits 2", async () => {
	fixture()
	state = { ready: false, topology: 0, deploys: 0 }
	const r = await run(["--ready-timeout", "3"])
	assert.equal(r.code, 2, r.stdout + r.stderr)
	assert.match(r.stderr, /not ready after 3s/)
})
