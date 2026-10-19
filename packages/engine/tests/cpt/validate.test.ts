import { describe, expect, it } from "vitest"
import { isCptFile, parseCptFile } from "../../src/cpt/validate.js"

const SCHEMA = "https://camunda.com/json-schema/cpt-test-cases/8.10/schema.json"
const file = (...instructions: unknown[]) => ({
	$schema: SCHEMA,
	testCases: [{ name: "c", instructions }],
})
const errorsOf = (...instructions: unknown[]) => {
	const r = parseCptFile(file(...instructions))
	if (!("errors" in r)) throw new Error("expected errors")
	return r.errors
}
const PD = { processDefinitionId: "p" }

describe("isCptFile", () => {
	it("recognises the cpt schema", () => {
		expect(isCptFile({ $schema: SCHEMA })).toBe(true)
		expect(isCptFile([])).toBe(false)
		expect(isCptFile({})).toBe(false)
		expect(isCptFile({ $schema: "https://example.com/other.json" })).toBe(false)
	})
})

describe("parseCptFile", () => {
	it("parses the six supported types with defaults", () => {
		const r = parseCptFile(
			file(
				{ type: "CREATE_PROCESS_INSTANCE", processDefinitionSelector: PD },
				{ type: "COMPLETE_JOB", jobSelector: { jobType: "a" } },
				{ type: "COMPLETE_JOB_AD_HOC_SUB_PROCESS", jobSelector: { elementId: "x" } },
				{ type: "COMPLETE_USER_TASK", userTaskSelector: { elementId: "u" } },
				{
					type: "ASSERT_ELEMENT_INSTANCES",
					processInstanceSelector: PD,
					elementSelectors: [{ elementId: "e" }],
					state: "IS_COMPLETED",
				},
				{ type: "ASSERT_PROCESS_INSTANCE", processInstanceSelector: PD, state: "IS_ACTIVE" },
			),
		)
		if (!("file" in r)) throw new Error(r.errors.join("; "))
		const ins = r.file.testCases[0]?.instructions ?? []
		expect(ins).toHaveLength(6)
		for (const i of ins.slice(0, 4)) expect("variables" in i && i.variables).toEqual({})
		expect(ins[2]).toMatchObject({
			completionConditionFulfilled: false,
			cancelRemainingInstances: false,
			activateElements: [],
		})
	})

	it("names an unsupported type", () => {
		const r = parseCptFile({
			$schema: SCHEMA,
			testCases: [
				{
					name: "c",
					instructions: [
						{ type: "COMPLETE_JOB", jobSelector: { jobType: "a" } },
						{ type: "COMPLETE_JOB", jobSelector: { jobType: "a" } },
						{ type: "PUBLISH_MESSAGE" },
					],
				},
			],
		})
		expect(r).toEqual({
			errors: ['case "c", instruction 2: PUBLISH_MESSAGE is not supported by casen test yet'],
		})
	})

	it("names an unsupported selector field", () => {
		expect(
			errorsOf({ type: "COMPLETE_JOB", jobSelector: { jobType: "a", tenantId: "x" } }),
		).toEqual(['case "c", instruction 0: jobSelector.tenantId is not supported by casen test yet'])
		expect(
			errorsOf({ type: "COMPLETE_USER_TASK", userTaskSelector: { elementId: "a", taskName: "x" } }),
		).toEqual([
			'case "c", instruction 0: userTaskSelector.taskName is not supported by casen test yet',
		])
		expect(
			errorsOf({
				type: "ASSERT_ELEMENT_INSTANCES",
				processInstanceSelector: PD,
				elementSelectors: [{ elementName: "n" }],
				state: "IS_ACTIVE",
			}),
		).toContain(
			'case "c", instruction 0: elementSelectors[0].elementName is not supported by casen test yet',
		)
	})

	it("names an unsupported state", () => {
		expect(
			errorsOf({
				type: "ASSERT_ELEMENT_INSTANCES",
				processInstanceSelector: PD,
				elementSelectors: [{ elementId: "e" }],
				state: "IS_TERMINATED",
			}),
		).toEqual(['case "c", instruction 0: state IS_TERMINATED is not supported by casen test yet'])
	})

	it("names an unsupported instruction field", () => {
		const job = { type: "COMPLETE_JOB", jobSelector: { jobType: "a" } }
		expect(errorsOf({ ...job, useExampleData: true })).toEqual([
			'case "c", instruction 0: COMPLETE_JOB.useExampleData is not supported by casen test yet',
		])
		const create = { type: "CREATE_PROCESS_INSTANCE", processDefinitionSelector: PD }
		expect(errorsOf({ ...create, startInstructions: [] })[0]).toContain(
			"CREATE_PROCESS_INSTANCE.startInstructions is not supported",
		)
		expect(errorsOf({ ...create, runtimeInstructions: [] })[0]).toContain(
			"CREATE_PROCESS_INSTANCE.runtimeInstructions is not supported",
		)
		expect(
			errorsOf({
				type: "ASSERT_PROCESS_INSTANCE",
				processInstanceSelector: PD,
				state: "IS_ACTIVE",
				hasActiveIncidents: true,
			})[0],
		).toContain("ASSERT_PROCESS_INSTANCE.hasActiveIncidents is not supported")
	})

	it("rejects an empty selector", () => {
		expect(errorsOf({ type: "COMPLETE_JOB", jobSelector: {} })).toEqual([
			'case "c", instruction 0: jobSelector needs one of jobType, elementId, processDefinitionId',
		])
	})

	it("rejects non-object variables", () => {
		expect(
			errorsOf({ type: "COMPLETE_JOB", jobSelector: { jobType: "a" }, variables: [1] }),
		).toEqual(['case "c", instruction 0: variables must be an object'])
	})

	it("rejects a CPT file without testCases", () => {
		expect(parseCptFile({ $schema: SCHEMA })).toEqual({
			errors: ["testCases must be a non-empty array"],
		})
	})

	it("collects errors from every instruction", () => {
		expect(errorsOf({ type: "X" }, { type: "Y" })).toHaveLength(2)
	})

	it("accepts a real Camunda-generated file (extra top-level keys ignored)", () => {
		const r = parseCptFile({
			$schema: SCHEMA,
			processId: "p",
			_testNotes: "n",
			testCases: [
				{
					name: "Happy path",
					description: "d",
					instructions: [
						{ type: "CREATE_PROCESS_INSTANCE", processDefinitionSelector: PD, variables: { a: 1 } },
						{
							type: "COMPLETE_JOB_AD_HOC_SUB_PROCESS",
							jobSelector: { jobType: "io.camunda.agenticai:aiagent:subprocess:2" },
							variables: { agent: {} },
							activateElements: [{ elementId: "T", variables: { q: 1 } }],
							completionConditionFulfilled: true,
						},
					],
				},
			],
		})
		expect("file" in r).toBe(true)
	})
})

describe("parseCptFile: instruction validation", () => {
	const W = 'case "c", instruction 0'
	const CREATE = { type: "CREATE_PROCESS_INSTANCE", processDefinitionSelector: PD }
	const adhoc = (extra: object) => ({
		type: "COMPLETE_JOB_AD_HOC_SUB_PROCESS",
		jobSelector: { jobType: "a" },
		...extra,
	})
	const assertEls = (extra: object) => ({
		type: "ASSERT_ELEMENT_INSTANCES",
		processInstanceSelector: PD,
		elementSelectors: [{ elementId: "e" }],
		state: "IS_ACTIVE",
		...extra,
	})

	it.each<[string, unknown, string]>([
		[
			"missing processDefinitionId",
			{ type: "CREATE_PROCESS_INSTANCE", processDefinitionSelector: {} },
			"processDefinitionSelector.processDefinitionId is required",
		],
		[
			"missing elementId in activateElements",
			adhoc({ activateElements: [{}] }),
			"activateElements[0].elementId is required",
		],
		[
			"missing state",
			{ type: "ASSERT_PROCESS_INSTANCE", processInstanceSelector: PD },
			"state is required",
		],
		[
			"unsupported state",
			{ type: "ASSERT_PROCESS_INSTANCE", processInstanceSelector: PD, state: "IS_GONE" },
			"state IS_GONE is not supported by casen test yet",
		],
		[
			"non-string selector value",
			{ type: "COMPLETE_JOB", jobSelector: { jobType: 1 } },
			"jobSelector.jobType must be a string",
		],
		[
			"boolean given as string",
			adhoc({ completionConditionFulfilled: "yes" }),
			"completionConditionFulfilled must be a boolean",
		],
		[
			"cancelRemainingInstances not boolean",
			adhoc({ cancelRemainingInstances: 1 }),
			"cancelRemainingInstances must be a boolean",
		],
		[
			"variables not an object",
			{ type: "COMPLETE_JOB", jobSelector: { jobType: "a" }, variables: [] },
			"variables must be an object",
		],
		[
			"empty elementSelectors",
			assertEls({ elementSelectors: [] }),
			"elementSelectors must be a non-empty array",
		],
		[
			"bad elementSelectors entry",
			assertEls({ elementSelectors: [{}] }),
			"elementSelectors[0].elementId is required",
		],
		[
			"activateElements not an array",
			adhoc({ activateElements: "x" }),
			"activateElements must be an array",
		],
		[
			"activateElements entry not an object",
			adhoc({ activateElements: ["x"] }),
			"activateElements[0] must be an object",
		],
		[
			"activateElements unknown key",
			adhoc({ activateElements: [{ elementId: "e", foo: 1 }] }),
			"activateElements[0].foo is not supported by casen test yet",
		],
		[
			"activateElements variables not an object",
			adhoc({ activateElements: [{ elementId: "e", variables: "x" }] }),
			"activateElements[0].variables must be an object",
		],
		[
			"type that is a built-in key",
			{ type: "constructor" },
			"constructor is not supported by casen test yet",
		],
		["type __proto__", { type: "__proto__" }, "__proto__ is not supported by casen test yet"],
		["type toString", { type: "toString" }, "toString is not supported by casen test yet"],
	])("%s", (_name, ins, message) => {
		expect(errorsOf(ins)).toEqual([`${W}: ${message}`])
	})

	it("rejects empty instructions", () => {
		const r = parseCptFile({ $schema: SCHEMA, testCases: [{ name: "c", instructions: [] }] })
		expect(r).toEqual({ errors: ['case "c": instructions must be a non-empty array'] })
	})

	it("still accepts a plain create instruction", () => {
		expect("file" in parseCptFile(file(CREATE))).toBe(true)
	})
})
