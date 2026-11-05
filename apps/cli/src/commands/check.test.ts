import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import { checkFiles, recoverFiles } from "./check.js"

const bpmn = (body: string, platform = true) => `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="D" targetNamespace="http://bpmn.io/schema/bpmn"${platform ? ' modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.6.0"' : ""}>
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    ${body}
    <bpmn:endEvent id="end"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="task" />
    <bpmn:sequenceFlow id="f2" sourceRef="task" targetRef="end" />
  </bpmn:process>
</bpmn:definitions>`

const userTask = (form = "") =>
	`<bpmn:userTask id="task" name="Review order"><bpmn:extensionElements><zeebe:userTask />${form}</bpmn:extensionElements><bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing></bpmn:userTask>`

const ruleTask = (decisionId: string) =>
	`<bpmn:businessRuleTask id="task" name="Decide discount"><bpmn:extensionElements><zeebe:calledDecision decisionId="${decisionId}" resultVariable="d" /></bpmn:extensionElements><bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing></bpmn:businessRuleTask>`

const FORM = JSON.stringify({
	id: "review-form",
	type: "default",
	components: [{ id: "f1", type: "textfield", key: "note", label: "Note" }],
})

const DMN = `<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="defs" name="d" namespace="x"><decision id="discount"><literalExpression><text>10</text></literalExpression></decision></definitions>`

let dir: string
const path = (name: string) => join(dir, name)

beforeAll(async () => {
	dir = await mkdtemp(join(tmpdir(), "casen-check-"))
	const files: Record<string, string> = {
		"no-form.bpmn": bpmn(userTask()),
		"linked.bpmn": bpmn(userTask('<zeebe:formDefinition formId="review-form" />')),
		"dangling.bpmn": bpmn(userTask('<zeebe:formDefinition formId="missing-form" />')),
		"rule.bpmn": bpmn(ruleTask("nope")),
		"neutral.bpmn": bpmn(
			ruleTask("nope").replace(/<bpmn:extensionElements>.*<\/bpmn:extensionElements>/, ""),
			false,
		),
		"broken.bpmn": "<bpmn:definitions><bpmn:process></bpmn:definitions>",
		"review.form": FORM,
		"bad.form": "{",
		"discount.dmn": DMN,
		"bad.dmn": DMN.replace("<text>10</text>", "<text>1 +</text>"),
		"notes.txt": "hi",
	}
	for (const [name, text] of Object.entries(files)) await writeFile(path(name), text)
})

const opts = { bpmnlintrc: false } as const

describe("checkFiles", () => {
	it("dispatches by extension and tags each finding with its file and kind", async () => {
		const rows = await checkFiles([path("bad.dmn"), path("bad.form")], opts)
		expect(rows.map((r) => [r.kind, r.rule])).toEqual([
			["dmn", "dmn/feel-syntax"],
			["form", "form/invalid-json"],
		])
		for (const r of rows) expect(r.fix).not.toBe("")
	})

	it("reports malformed BPMN XML as one finding", async () => {
		const rows = await checkFiles([path("broken.bpmn")], opts)
		expect(rows.map((r) => r.rule)).toEqual(["bpmn/malformed-xml"])
	})

	it("reports unsupported and unreadable files", async () => {
		const rows = await checkFiles([path("notes.txt"), path("gone.bpmn")], opts)
		expect(rows.map((r) => r.rule)).toEqual(["check/unsupported-file", "check/unreadable"])
	})

	it("does not ask for a user task form unless required", async () => {
		const plain = await checkFiles([path("no-form.bpmn")], opts)
		expect(plain.map((r) => r.rule)).not.toContain("compat/user-task-definition")
		const required = await checkFiles([path("no-form.bpmn")], { ...opts, userTaskForms: "require" })
		expect(required.map((r) => r.rule)).toContain("compat/user-task-definition")
	})

	it("resolves a user task's formId against the checked forms", async () => {
		const ok = await checkFiles([path("linked.bpmn"), path("review.form")], opts)
		expect(ok.map((r) => r.rule)).not.toContain("check/unresolved-form")

		const dangling = await checkFiles([path("dangling.bpmn"), path("review.form")], opts)
		const row = dangling.find((r) => r.rule === "check/unresolved-form")
		expect(row).toMatchObject({ severity: "warning", elementId: "task", kind: "bpmn" })
		expect(row?.fix).toContain('"review-form"')

		// Without any form given, the form is presumably deployed on its own.
		const alone = await checkFiles([path("dangling.bpmn")], opts)
		expect(alone.map((r) => r.rule)).not.toContain("check/unresolved-form")
	})

	it("resolves a calledDecision against the checked DMN, as an error under --deploy", async () => {
		const rows = await checkFiles([path("rule.bpmn"), path("discount.dmn")], {
			...opts,
			deploy: true,
		})
		expect(rows.find((r) => r.rule === "check/unresolved-decision")).toMatchObject({
			severity: "error",
			elementId: "task",
		})
		expect(rows.every((r) => r.severity === "error")).toBe(true)
	})

	it("sketch skips Camunda 8 deployability rules even on a model naming a platform", async () => {
		const deploy = await checkFiles([path("neutral.bpmn")], { ...opts, deploy: true })
		expect(deploy.map((r) => r.rule)).toContain("deploy/service-task-no-type")
		const sketch = await checkFiles([path("rule.bpmn")], { ...opts, sketch: true })
		expect(
			sketch.filter((r) => r.rule.startsWith("deploy/") || r.rule.startsWith("compat/")),
		).toEqual([])
	})
})

describe("recoverFiles", () => {
	it("gives back a file the parser read as a boolean flag's value", () => {
		const { files, flags } = recoverFiles(["a.bpmn"], { json: "b.form", deploy: true })
		expect(files).toEqual(["a.bpmn", "b.form"])
		expect(flags).toEqual({ deploy: true, sketch: false, json: true })
	})
})
