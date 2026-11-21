#!/usr/bin/env node
/**
 * Records the `expected` command of every conformance/connectors fixture from a real Camunda 8.8
 * connector runtime (plan doc/plans/c8-workers-and-rust-cli.md §7, P5 step 1). Manual, once, not
 * in CI: the Rust replay test (`cargo test -p bpmnkit-connector-runtime --test replay`) then
 * keeps the runner in step with what was recorded. See conformance/connectors/README.md.
 *
 *   node scripts/record-connectors.mjs [--camunda http://localhost:8080]
 *     [--mock-port 18089] [--mock-host host.docker.internal] [--only name,name] [--prefix P]
 *
 * For each fixture it serves the recorded responses from a local mock (and checks the requests
 * the runtime sends), deploys a one-task process whose REST connector task gets the fixture's
 * job variables as input mappings and its headers as task headers, starts one instance and
 * reads back what the engine recorded: completion variables, a thrown error (caught by a
 * catch-all boundary event) or the failed job. The connector runtime must see the fixture
 * secrets as environment variables (the script prints them) and, for fixtures with
 * `secretPrefix`, run with that CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PREFIX (`--prefix`).
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const DIR = join(ROOT, "conformance/connectors")
const PLACEHOLDER = "http://mock.local"

const args = process.argv.slice(2)
const option = (name, fallback) => {
	const i = args.indexOf(name)
	return i < 0 ? fallback : args[i + 1]
}
const camunda = option("--camunda", "http://localhost:8080")
const mockPort = Number(option("--mock-port", "18089"))
const mockHost = option("--mock-host", "host.docker.internal")
const only = option("--only")?.split(",")
const prefix = option("--prefix", "")

const files = readdirSync(DIR)
	.filter((f) => f.endsWith(".json"))
	.sort()
	.filter((f) => !only || only.includes(f.replace(/\.json$/, "")))

const env = {}
for (const f of files) Object.assign(env, JSON.parse(readFileSync(join(DIR, f), "utf8")).env ?? {})
console.log("Connector runtime environment needed (secrets):")
for (const [k, v] of Object.entries(env)) console.log(`  ${k}=${v}`)

// ── mock API ─────────────────────────────────────────────────────────────────

let current = { name: "", responses: [], seen: [] }
const server = createServer((req, res) => {
	const chunks = []
	req.on("data", (c) => chunks.push(c))
	req.on("end", () => {
		const url = new URL(req.url ?? "/", "http://x")
		const path = url.pathname.replace(`/${current.name}`, "") || "/"
		current.seen.push({ method: req.method, path, query: Object.fromEntries(url.searchParams) })
		const r = current.responses[current.seen.length - 1]
		if (!r) {
			res.writeHead(599).end("unexpected request")
			return
		}
		const headers = { ...(r.headers ?? {}) }
		for (const [k, v] of Object.entries(headers)) headers[k] = v.replaceAll(PLACEHOLDER, base())
		let body = ""
		if (r.bodyText !== undefined) body = r.bodyText
		else if (r.body !== undefined) {
			body = JSON.stringify(r.body)
			headers["content-type"] = "application/json"
		}
		res.writeHead(r.status, headers).end(body)
	})
})
await new Promise((ok) => server.listen(mockPort, "0.0.0.0", ok))
const base = () => `http://${mockHost}:${mockPort}/${current.name}`

// ── engine ───────────────────────────────────────────────────────────────────

const api = async (method, path, body, headers = { "content-type": "application/json" }) => {
	const r = await fetch(`${camunda}${path}`, {
		method,
		headers,
		body: typeof body === "string" ? body : body && JSON.stringify(body),
	})
	const text = await r.text()
	if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${text}`)
	return text ? JSON.parse(text) : {}
}

const xml = (s) =>
	String(s).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;")

/** A JSON value as FEEL source. */
const feel = (v) => {
	if (v === null) return "null"
	if (Array.isArray(v)) return `[${v.map(feel).join(", ")}]`
	if (typeof v === "object")
		return `{${Object.entries(v)
			.map(([k, x]) => `${JSON.stringify(k)}: ${feel(x)}`)
			.join(", ")}}`
	return JSON.stringify(v)
}

const bpmn = (id, job) => `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="http://bpmnkit.com/record">
  <bpmn:process id="${id}" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="rest">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="io.camunda:http-json:1" retries="${job.retries ?? 3}" />
        <zeebe:ioMapping>
${Object.entries(job.variables)
	.map(([k, v]) => `          <zeebe:input source="${xml(`=${feel(v)}`)}" target="${xml(k)}" />`)
	.join("\n")}
        </zeebe:ioMapping>
        <zeebe:taskHeaders>
${Object.entries(job.headers ?? {})
	.map(([k, v]) => `          <zeebe:header key="${xml(k)}" value="${xml(v)}" />`)
	.join("\n")}
        </zeebe:taskHeaders>
      </bpmn:extensionElements>
      <bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:boundaryEvent id="caught" attachedToRef="rest">
      <bpmn:extensionElements><zeebe:errorEventDefinition errorCodeVariable="__errorCode" errorMessageVariable="__errorMessage" /></bpmn:extensionElements>
      <bpmn:outgoing>f3</bpmn:outgoing><bpmn:errorEventDefinition />
    </bpmn:boundaryEvent>
    <bpmn:endEvent id="end"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="endError"><bpmn:incoming>f3</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="rest" />
    <bpmn:sequenceFlow id="f2" sourceRef="rest" targetRef="end" />
    <bpmn:sequenceFlow id="f3" sourceRef="caught" targetRef="endError" />
  </bpmn:process>
</bpmn:definitions>`

const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms))

async function record(file) {
	const name = file.replace(/\.json$/, "")
	const fixture = JSON.parse(readFileSync(join(DIR, file), "utf8"))
	if ((fixture.secretPrefix ?? "") !== prefix) {
		console.log(`  skip ${name}: needs --prefix ${fixture.secretPrefix ?? '""'}`)
		return
	}
	current = { name, responses: fixture.exchanges.map((e) => e.response), seen: [] }
	const job = JSON.parse(JSON.stringify(fixture.job).replaceAll(PLACEHOLDER, base()))
	const id = `record_${name.replaceAll("-", "_")}`
	const boundary = "bpmnkit-record"
	await api(
		"POST",
		"/v2/deployments",
		`--${boundary}\r\nContent-Disposition: form-data; name="resources"; filename="${id}.bpmn"\r\nContent-Type: application/xml\r\n\r\n${bpmn(id, job)}\r\n--${boundary}--\r\n`,
		{ "content-type": `multipart/form-data; boundary=${boundary}` },
	)
	const { processInstanceKey: key } = await api("POST", "/v2/process-instances", {
		processDefinitionId: id,
	})
	let expected
	for (let i = 0; i < 60 && !expected; i++) {
		await sleep(1000)
		const instance = (
			await api("POST", "/v2/process-instances/search", { filter: { processInstanceKey: key } })
		).items?.[0]
		const jobs = (await api("POST", "/v2/jobs/search", { filter: { processInstanceKey: key } }))
			.items
		const failed = jobs?.find((j) => j.state === "FAILED" || j.state === "ERROR_THROWN")
		if (instance?.state === "COMPLETED") {
			const vars = (
				await api("POST", "/v2/variables/search", {
					filter: { processInstanceKey: key, scopeKey: key },
				})
			).items
			const variables = Object.fromEntries(vars.map((v) => [v.name, JSON.parse(v.value)]))
			const { __errorCode: code, __errorMessage: message, ...rest } = variables
			expected =
				code !== undefined
					? {
							throwError: {
								errorCode: code,
								...(message ? { errorMessage: message } : {}),
								...(Object.keys(rest).length ? { variables: rest } : {}),
							},
						}
					: { complete: { variables } }
		} else if (failed?.state === "FAILED" && current.seen.length >= current.responses.length) {
			// The REST API does not expose the requested backoff: keep the replayed value.
			expected = {
				fail: {
					errorMessage: failed.errorMessage,
					retries: failed.retries,
					retryBackOff: fixture.expected?.fail?.retryBackOff ?? 0,
				},
			}
		}
	}
	if (!expected) throw new Error(`${name}: no outcome after 60 s`)
	for (const [i, want] of fixture.exchanges.entries()) {
		const got = current.seen[i]
		if (!got || got.method !== want.request.method || got.path !== want.request.path)
			console.warn(
				`  ! ${name} request ${i}: ${JSON.stringify(got)} vs ${JSON.stringify(want.request)}`,
			)
	}
	const changed = JSON.stringify(expected) !== JSON.stringify(fixture.expected)
	fixture.expected = expected
	fixture.recorded = true
	writeFileSync(join(DIR, file), `${JSON.stringify(fixture, null, 2)}\n`)
	console.log(`  ${changed ? "≠" : "✓"} ${name}`)
}

for (const f of files) {
	try {
		await record(f)
	} catch (err) {
		console.error(`  ✗ ${f}: ${err.message}`)
	}
}
server.close()
