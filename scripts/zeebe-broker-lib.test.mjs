import assert from "node:assert/strict"
import { test } from "node:test"
import {
	classify,
	compareMinor,
	needlesOf,
	problemText,
	rejectionMatches,
	retryable,
	ruleOfRepro,
	summarize,
	targetVersionOf,
	topologyReady,
} from "./zeebe-broker-lib.mjs"

// The rejection text a broker gives for a deploy (Zeebe's DeploymentRejection + formatter).
const BROKER_DETAIL =
	"Command 'CREATE' rejected with code 'INVALID_ARGUMENT': Expected to deploy new resources, but encountered the following errors:\n'z100_script_static.bpmn': - Element: t > extensionElements > script\n    - ERROR: Expected expression but found static value 'a + 1'. An expression must start with '=' (e.g. '=a + 1').\n"

test("versions compare by major.minor", () => {
	assert.ok(compareMinor("8.10.9", "8.9.28") > 0)
	assert.ok(compareMinor("8.6", "8.6.42") === 0)
	assert.ok(compareMinor("8.6.0", "8.7.45") < 0)
	assert.throws(() => compareMinor("latest", "8.6"))
})

test("reads the target version and the repro's rule", () => {
	assert.equal(targetVersionOf('<d modeler:executionPlatformVersion="8.6.0">'), "8.6.0")
	assert.equal(targetVersionOf("<d>"), undefined)
	assert.equal(ruleOfRepro("z100_script_static.bpmn"), "Z100")
	assert.equal(ruleOfRepro("other.bpmn"), undefined)
})

test("a zeebe-check error matches the broker's formatted rejection", () => {
	const err =
		"t > extensionElements > script: Expected expression but found static value 'a + 1'. An expression must start with '=' (e.g. '=a + 1')."
	assert.deepEqual(needlesOf(err)[0], "t > extensionElements > script")
	assert.ok(rejectionMatches(BROKER_DETAIL, [err]))
	assert.ok(!rejectionMatches(BROKER_DETAIL, ["t: Must have a condition"]))
})

test("parse errors match from the schema message on", () => {
	const err =
		"PARSE: SAXException while parsing input stream / Error: URI=null Line=4: cvc-datatype-valid.1.2.1: 'g 1' is not a valid value for 'QName'."
	assert.deepEqual(needlesOf(err), [
		"cvc-datatype-valid.1.2.1: 'g 1' is not a valid value for 'QName'.",
	])
	assert.ok(
		rejectionMatches(
			"Expected to deploy new resources ...: 'x.bpmn': SAXException while parsing input stream\n  Error: URI=null Line=4: cvc-datatype-valid.1.2.1: 'g 1' is not a valid value for 'QName'.",
			[err],
		),
	)
})

test("classify: deployable cases", () => {
	const item = { key: "builder/a", kind: "case", expect: { ok: true } }
	assert.equal(classify(item, { ok: true, detail: "" }, "8.8.46").status, "pass")
	assert.equal(classify(item, { ok: false, detail: "nope" }, "8.8.46").status, "fail")
	// Written for 8.10, refused by 8.6: reported, not failed.
	const newer = { ...item, target: "8.10.0" }
	assert.equal(classify(newer, { ok: false, detail: "nope" }, "8.6.42").status, "info")
	assert.equal(classify(newer, { ok: false, detail: "nope" }, "8.10.9").status, "fail")
})

test("classify: expected rejections", () => {
	const repro = {
		key: "repro/z100_script_static.bpmn",
		kind: "repro",
		since: "8.0",
		expect: {
			ok: false,
			errors: [
				"t > extensionElements > script: Expected expression but found static value 'a + 1'. An expression must start with '=' (e.g. '=a + 1').",
			],
		},
	}
	assert.equal(classify(repro, { ok: false, detail: BROKER_DETAIL }, "8.6.42").status, "pass")
	assert.equal(classify(repro, { ok: false, detail: "other" }, "8.6.42").status, "fail")
	assert.equal(classify(repro, { ok: true, detail: "" }, "8.6.42").status, "fail")
	assert.equal(classify({ ...repro, since: "8.10" }, { ok: true }, "8.8.46").status, "skip")
	const listed = { key: "builder/b", kind: "case", expect: { ok: false } }
	assert.equal(classify(listed, { ok: true, detail: "" }, "8.6.42").status, "info")
	const loop = {
		key: "broker/z35",
		kind: "broker-repro",
		expect: { ok: false, contains: ["straight-through processing loop"] },
	}
	assert.equal(
		classify(
			loop,
			{
				ok: false,
				detail:
					"Processes are not allowed to contain a straight-through processing loop: a > b > a",
			},
			"8.6.42",
		).status,
		"pass",
	)
})

test("topology is ready once every partition has a healthy leader", () => {
	assert.equal(topologyReady(undefined), false)
	assert.equal(topologyReady({ brokers: [] }), false)
	const leader = { partitionId: 1, role: "leader", health: "healthy" }
	assert.equal(topologyReady({ partitionsCount: 1, brokers: [{ partitions: [leader] }] }), true)
	assert.equal(
		topologyReady({
			partitionsCount: 1,
			brokers: [{ partitions: [{ ...leader, health: "unhealthy" }] }],
		}),
		false,
	)
	assert.equal(topologyReady({ partitionsCount: 2, brokers: [{ partitions: [leader] }] }), false)
	assert.equal(
		topologyReady({ brokers: [{ partitions: [{ partitionId: 1, role: "leader" }] }] }),
		true,
	)
})

test("retries only what is not a verdict", () => {
	assert.ok(retryable(undefined))
	assert.ok(retryable(503))
	assert.ok(retryable(429))
	assert.ok(!retryable(400))
	assert.ok(!retryable(200))
})

test("problem+json and the summary", () => {
	assert.equal(problemText({ title: "INVALID_ARGUMENT", detail: "x" }), "INVALID_ARGUMENT: x")
	assert.equal(problemText("plain"), "plain")
	const md = summarize("8.6.42", [
		{ key: "a", status: "pass", why: "deployed" },
		{ key: "b", status: "fail", why: "rejected: `x`" },
	])
	assert.match(md, /\| 1 \| 1 \| 0 \| 0 \|/)
	assert.match(md, /- `b`: rejected: 'x'/)
})
