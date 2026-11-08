import { describe, expect, it } from "vitest"
import {
	applyTemplates,
	clearRegisteredTemplates,
	getTemplate,
	registerElementTemplates,
} from "../../src/connectors/index.js"
import type { TemplateApplicationProblem } from "../../src/connectors/index.js"
import { Bpmn, lintDiagram } from "../../src/index.js"
import type { BpmnDefinitions } from "../../src/index.js"

const FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
  xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn"
  modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.10.0">
  <bpmn:process id="bakeoff" isExecutable="true">
    <bpmn:adHocSubProcess id="AI_Agent" name="AI Agent">
      <bpmn:serviceTask id="LookupSampleUsers" name="Find sample users" />
      <bpmn:serviceTask id="SearchRecipes" name="Search recipes" />
    </bpmn:adHocSubProcess>
    <bpmn:adHocSubProcess id="Plain" name="Plain" />
  </bpmn:process>
</bpmn:definitions>`

const HTTP = "io.camunda.connectors.HttpJson.v2"
const AGENT = "io.camunda.connectors.agenticai.ai-agent-subprocess.v2"

function fixture(): BpmnDefinitions {
	return Bpmn.parse(FIXTURE)
}

const PROMPT =
	"You are **TaskAgent**, a helpful agent.\n\nIf tools are provided, you should prefer them instead of guessing an answer."

const RESULT = `=if count(response.body.recipes) > 0 then response.body.recipes else "No result found, it's a 'miss' & more"`

/** Required-value reminders are expected while a test sets only what it examines. */
const unexpected = (problems: TemplateApplicationProblem[]) =>
	problems.filter((p) => !p.message.startsWith("Missing required"))

describe("applyTemplates", () => {
	it("applies id@version values to an element nested in an ad-hoc sub-process", () => {
		const { definitions, problems } = applyTemplates(fixture(), [
			{
				elementId: "LookupSampleUsers",
				template: `${HTTP}@18`,
				values: {
					retryCount: 3,
					retryBackoff: "PT0S",
					url: "https://jsonplaceholder.typicode.com/users",
				},
			},
		])
		expect(unexpected(problems)).toEqual([])
		const xml = Bpmn.export(definitions)
		expect(xml).toContain('zeebe:modelerTemplateVersion="18"')
		expect(xml).toContain('<zeebe:taskDefinition type="io.camunda:http-json:1" retries="3"')
	})

	it("keeps a real paragraph break in a FEEL string and round-trips quotes and operators", () => {
		const { definitions, problems } = applyTemplates(fixture(), [
			{
				elementId: "AI_Agent",
				template: AGENT,
				values: { "data.systemPrompt.prompt": PROMPT },
			},
			{
				elementId: "SearchRecipes",
				template: HTTP,
				values: { resultExpression: RESULT },
			},
		])
		expect(unexpected(problems)).toEqual([])
		const xml = Bpmn.export(definitions)
		expect(xml).not.toContain("\\n")
		const back = Bpmn.parse(xml)
		const input = (id: string, target: string) => {
			const el = back.processes[0]?.flowElements
				.flatMap((e) => [e, ...("flowElements" in e ? e.flowElements : [])])
				.find((e) => e.id === id)
			const io = el?.extensionElements?.find((x) => x.name === "zeebe:ioMapping")
			return io?.children.find((c) => c.attributes.target === target)?.attributes.source
		}
		expect(input("AI_Agent", "data.systemPrompt.prompt")).toContain("\n\n")
		const header = back.processes[0]?.flowElements
			.flatMap((e) => ("flowElements" in e ? e.flowElements : []))
			.find((e) => e.id === "SearchRecipes")
			?.extensionElements?.find((x) => x.name === "zeebe:taskHeaders")
		const expression = header?.children.find((c) => c.attributes.key === "resultExpression")
		expect(expression?.attributes.value).toBe(RESULT)
	})

	it("suggests the property id for a key that is a binding name", () => {
		const before = fixture()
		const { problems } = applyTemplates(before, [
			{ elementId: "LookupSampleUsers", template: HTTP, values: { retries: 3 } },
		])
		expect(unexpected(problems)).toHaveLength(1)
		expect(problems[0]).toMatchObject({
			elementId: "LookupSampleUsers",
			key: "retries",
			suggestion: "retryCount",
		})
	})

	it("suggests the nearest property id for a typo", () => {
		const { problems } = applyTemplates(fixture(), [
			{ elementId: "LookupSampleUsers", template: HTTP, values: { urll: "x" } },
		])
		expect(problems[0]).toMatchObject({ key: "urll", suggestion: "url" })
	})

	it("offers no suggestion for a key nothing resembles", () => {
		const { problems } = applyTemplates(fixture(), [
			{ elementId: "LookupSampleUsers", template: HTTP, values: { zzzzzzzzzzzz: "x" } },
		])
		expect(problems[0]?.key).toBe("zzzzzzzzzzzz")
		expect(problems[0]?.suggestion).toBeUndefined()
	})

	it("refuses a version the bundle does not hold and names the one it has", () => {
		const before = fixture()
		const { definitions, problems } = applyTemplates(before, [
			{ elementId: "LookupSampleUsers", template: `${HTTP}@17`, values: { retryCount: 3 } },
		])
		expect(problems).toHaveLength(1)
		expect(problems[0]?.elementId).toBe("LookupSampleUsers")
		expect(problems[0]?.message).toContain("18")
		expect(Bpmn.export(definitions)).toBe(Bpmn.export(before))
	})

	it("stringifies numbers and booleans", () => {
		const { definitions, problems } = applyTemplates(fixture(), [
			{
				elementId: "LookupSampleUsers",
				template: HTTP,
				values: { retryCount: 5, method: "POST", ignoreNullValues: true },
			},
		])
		expect(unexpected(problems)).toEqual([])
		const xml = Bpmn.export(definitions)
		expect(xml).toContain('retries="5"')
		expect(xml).toMatch(
			/target="ignoreNullValues"[^>]*source="true"|source="true"[^>]*target="ignoreNullValues"/,
		)
	})

	it("reports a value its property's condition leaves unwritten", () => {
		const { definitions, problems } = applyTemplates(fixture(), [
			{
				elementId: "LookupSampleUsers",
				template: HTTP,
				values: { method: "GET", ignoreNullValues: false },
			},
		])
		expect(unexpected(problems)).toEqual([
			{
				elementId: "LookupSampleUsers",
				key: "ignoreNullValues",
				message:
					'Value for "ignoreNullValues" was not written: the template only uses it when method is one of POST, PUT, PATCH',
			},
		])
		expect(Bpmn.export(definitions)).not.toContain("ignoreNullValues")
	})

	it("resolves an alias and accepts a template object", () => {
		const viaAlias = applyTemplates(fixture(), [
			{ elementId: "LookupSampleUsers", template: "http", values: { retryCount: 2 } },
		])
		expect(unexpected(viaAlias.problems)).toEqual([])
		expect(Bpmn.export(viaAlias.definitions)).toContain('retries="2"')
		const tpl = getTemplate(HTTP)
		if (!tpl) throw new Error("missing template")
		const viaObject = applyTemplates(fixture(), [
			{ elementId: "LookupSampleUsers", template: tpl, values: { retryCount: 2 } },
		])
		expect(Bpmn.export(viaObject.definitions)).toBe(Bpmn.export(viaAlias.definitions))
	})

	it("reports an unknown template and an unknown element, each with its elementId", () => {
		const { problems } = applyTemplates(fixture(), [
			{ elementId: "LookupSampleUsers", template: "no-such-connector", values: {} },
			{ elementId: "Ghost", template: HTTP, values: {} },
		])
		expect(problems.map((p) => p.elementId)).toEqual(["LookupSampleUsers", "Ghost"])
	})

	it("gives a refused entry one problem, not a second about its switched-off values", () => {
		const { problems } = applyTemplates(fixture(), [
			{
				elementId: "Ghost",
				template: HTTP,
				values: { method: "GET", ignoreNullValues: false },
			},
		])
		expect(problems).toHaveLength(1)
		expect(problems[0]?.message).toContain('No flow element "Ghost"')
	})

	it("resolves an alias case-insensitively and through registered templates", () => {
		const viaAlias = applyTemplates(fixture(), [
			{ elementId: "LookupSampleUsers", template: "HTTP", values: {} },
		])
		expect(unexpected(viaAlias.problems)).toEqual([])
		expect(Bpmn.export(viaAlias.definitions)).toContain('zeebe:modelerTemplate="')

		const base = getTemplate(HTTP)
		if (!base) throw new Error("bundled template missing")
		registerElementTemplates([{ ...base, id: "acme.Custom.v1", version: 3 }])
		try {
			const custom = applyTemplates(fixture(), [
				{ elementId: "LookupSampleUsers", template: "acme.Custom.v1@3", values: {} },
			])
			expect(unexpected(custom.problems)).toEqual([])
		} finally {
			clearRegisteredTemplates()
		}
	})

	it("says so for an empty version after @", () => {
		const { problems } = applyTemplates(fixture(), [
			{ elementId: "LookupSampleUsers", template: "http@", values: {} },
		])
		expect(problems).toHaveLength(1)
		expect(problems[0]?.message).toContain('empty version after "@"')
	})

	it("does not print undefined for a template without a version", () => {
		const base = getTemplate(HTTP)
		if (!base) throw new Error("bundled template missing")
		const { version: _version, ...unversioned } = base
		registerElementTemplates([{ ...unversioned, id: "acme.NoVersion" }])
		try {
			const { problems } = applyTemplates(fixture(), [
				{ elementId: "LookupSampleUsers", template: "acme.NoVersion@5", values: {} },
			])
			expect(problems).toHaveLength(1)
			expect(problems[0]?.message).not.toContain("undefined")
		} finally {
			clearRegisteredTemplates()
		}
	})

	it("makes the ad-hoc sub-process agentic for the lint rules", () => {
		const lint = (defs: BpmnDefinitions) =>
			lintDiagram(defs, { forceEngineRules: true }).diagnostics.filter(
				(d) =>
					d.id === "compat/agent-tool-output-key" && d.elementIds.includes("LookupSampleUsers"),
			)
		expect(lint(fixture())).toEqual([])
		const { definitions } = applyTemplates(fixture(), [
			{ elementId: "AI_Agent", template: AGENT, values: {} },
		])
		expect(lint(definitions).length).toBeGreaterThan(0)
	})
	describe("omitDefaults", () => {
		const OPENAI = { "provider.type": "openai", "provider.openai.api.type": "responses" }
		const EFFORT = 'target="provider.openai.api.responses.effort"'
		const applyHttp = (omitDefaults: boolean | undefined, base = fixture()) =>
			Bpmn.export(
				applyTemplates(
					base,
					[{ elementId: "LookupSampleUsers", template: HTTP, values: { url: "https://x.test" } }],
					omitDefaults === undefined ? undefined : { omitDefaults },
				).definitions,
			)
		const applyAgent = (extra: Record<string, string>, omitDefaults: boolean) =>
			Bpmn.export(
				applyTemplates(
					fixture(),
					[{ elementId: "AI_Agent", template: AGENT, values: { ...OPENAI, ...extra } }],
					{ omitDefaults },
				).definitions,
			)

		it("writes template defaults unless asked not to", () => {
			const xml = applyHttp(undefined)
			expect(xml).toContain('target="followRedirects"')
			expect(xml).toContain('target="documentReturnFormat.choice"')
		})

		it("leaves out defaults the caller did not supply", () => {
			const xml = applyHttp(true)
			expect(xml).not.toContain('target="followRedirects"')
			expect(xml).not.toContain('target="documentReturnFormat.choice"')
			expect(xml).toContain('target="url"')
		})

		it("keeps hidden bindings and the template stamp", () => {
			const xml = applyHttp(true)
			expect(xml).toContain('zeebe:modelerTemplate="io.camunda.connectors.HttpJson.v2"')
			expect(xml).toContain('<zeebe:taskDefinition type="io.camunda:http-json:1"')
		})

		it("still writes a value the caller gave, even when it equals the default", () => {
			const { definitions } = applyTemplates(
				fixture(),
				[{ elementId: "LookupSampleUsers", template: HTTP, values: { followRedirects: false } }],
				{ omitDefaults: true },
			)
			expect(Bpmn.export(definitions)).toContain('target="followRedirects"')
		})

		it("leaves out the OpenAI effort default but not what the caller set", () => {
			expect(applyAgent({}, false)).toContain(EFFORT)
			expect(applyAgent({}, true)).not.toContain(EFFORT)
			expect(applyAgent({ "provider.openai.api.responses.effort": "minimal" }, true)).toContain(
				EFFORT,
			)
		})

		it("leaves no stale default when re-applied with omitDefaults", () => {
			const first = applyTemplates(fixture(), [
				{ elementId: "LookupSampleUsers", template: HTTP, values: { url: "https://x.test" } },
			]).definitions
			expect(Bpmn.export(first)).toContain('target="followRedirects"')
			expect(applyHttp(true, first)).not.toContain('target="followRedirects"')
		})
	})
})
