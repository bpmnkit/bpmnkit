import assert from "node:assert/strict"
import { test } from "node:test"
import {
	TRUSTED_PUBLISHER,
	buildReleaseNotes,
	changelogSection,
	facadeProblems,
	hasTrustedPublisher,
	indexPath,
	packageJsonProblems,
	publishOrder,
} from "./crates-publish.mjs"

const crate = (name, deps = []) => ({
	name,
	internal: deps.map((d) => ({ name: d })),
	internalAll: deps.map((d) => ({ name: d })),
})

test("publishOrder puts dependencies first and the facade last", () => {
	const crates = [
		crate("bpmnkit", ["bpmnkit-bpmn", "bpmnkit-xml"]),
		crate("bpmnkit-bpmn", ["bpmnkit-xml"]),
		crate("bpmnkit-xml"),
	]
	assert.deepEqual(publishOrder(crates), ["bpmnkit-xml", "bpmnkit-bpmn", "bpmnkit"])
})

test("facadeProblems wants the facade to depend on every other published crate", () => {
	const xml = crate("bpmnkit-xml")
	const bpmn = crate("bpmnkit-bpmn", ["bpmnkit-xml"])
	assert.deepEqual(
		facadeProblems([xml, bpmn, crate("bpmnkit", ["bpmnkit-xml", "bpmnkit-bpmn"])]),
		[],
	)
	assert.deepEqual(facadeProblems([xml, bpmn, crate("bpmnkit", ["bpmnkit-xml"])]), [
		"bpmnkit: the facade does not re-export bpmnkit-bpmn",
	])
	assert.deepEqual(facadeProblems([xml, bpmn]), ["bpmnkit: the facade crate is missing"])
})

test("indexPath follows the sparse index layout", () => {
	assert.equal(indexPath("ab"), "2/ab")
	assert.equal(indexPath("abc"), "3/a/abc")
	assert.equal(indexPath("bpmnkit-XML"), "bp/mn/bpmnkit-xml")
})

test("hasTrustedPublisher matches only our workflow and environment", () => {
	const ours = { ...TRUSTED_PUBLISHER, repository_owner: "BpmnKit" }
	assert.equal(hasTrustedPublisher([]), false)
	assert.equal(hasTrustedPublisher([ours]), true)
	assert.equal(hasTrustedPublisher([{ ...ours, environment: null }]), false)
	assert.equal(hasTrustedPublisher([{ ...ours, workflow_filename: "ci.yml" }]), false)
})

const log = (v, body) => `# x\n\n## ${v}\n\n${body}\n\n## 0.1.0\n\n- old\n`

test("changelogSection takes one version's body", () => {
	const body = "### Minor Changes\n\n- a"
	assert.equal(changelogSection(log("0.2.0", body), "0.2.0"), body)
	assert.equal(changelogSection(log("0.2.0", "- a"), "0.1.0"), "- old")
	assert.equal(changelogSection(log("0.2.0", "- a"), "9.9.9"), "")
})

test("buildReleaseNotes puts the facade first, skips empty sections, ends with provenance", () => {
	const notes = buildReleaseNotes({
		version: "0.2.0",
		changelogs: [
			{ name: "bpmnkit-xml", text: log("0.2.0", "- xml thing") },
			{ name: "bpmnkit-lint", text: "# x\n\n## 0.1.0\n\n- old\n" },
			{ name: "bpmnkit", text: log("0.2.0", "- facade thing") },
		],
		corpus: { core: "1.9.0", feel: "1.1.1" },
	})
	assert.ok(notes.indexOf("### bpmnkit\n") < notes.indexOf("### bpmnkit-xml"))
	assert.ok(!notes.includes("bpmnkit-lint"))
	assert.ok(notes.includes("`@bpmnkit/core` 1.9.0 and `@bpmnkit/feel` 1.1.1"))
	assert.ok(!notes.includes("old"))
})

test("packageJsonProblems wants a matching private package.json for published crates only", () => {
	const pkgs = [
		{ name: "bpmnkit-xml", version: "0.2.0", manifest_path: "/c/bpmnkit-xml/Cargo.toml" },
		{
			name: "bpmnkit-fuzz",
			version: "0.2.0",
			publish: [],
			manifest_path: "/c/bpmnkit-fuzz/Cargo.toml",
		},
	]
	const good = { name: "@crates/bpmnkit-xml", version: "0.2.0", private: true }
	assert.deepEqual(
		packageJsonProblems(pkgs, (d) => (d.endsWith("xml") ? good : null)),
		[],
	)
	assert.deepEqual(
		packageJsonProblems(pkgs, () => null),
		["bpmnkit-xml: package.json missing (changesets versions the crate)"],
	)
	const bad = { name: "x", version: "0.1.0" }
	assert.equal(packageJsonProblems(pkgs, (d) => (d.endsWith("xml") ? bad : null)).length, 3)
	assert.deepEqual(
		packageJsonProblems(pkgs, (d) => (d.endsWith("fuzz") ? good : good)),
		["bpmnkit-fuzz: publish = false, so package.json must not exist"],
	)
})
