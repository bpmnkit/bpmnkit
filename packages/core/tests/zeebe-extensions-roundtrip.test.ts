import { describe, expect, it } from "vitest"
import { getZeebeExtensions, zeebeExtensionsToXmlElements } from "../src/index.js"
import type { ZeebeExtensions } from "../src/index.js"

// `satisfies Record<keyof ZeebeExtensions, ...>` makes a new ZeebeExtensions field
// fail typecheck until it gets a fixture here, so the writer can't outgrow the reader.
const FIXTURES = {
	taskDefinition: { taskDefinition: { type: "work", retries: "3" } },
	ioMapping: {
		ioMapping: {
			inputs: [{ source: "=a", target: "b" }],
			outputs: [{ source: "=c", target: "d" }],
		},
	},
	taskHeaders: { taskHeaders: { headers: [{ key: "k", value: "v" }] } },
	properties: { properties: { properties: [{ name: "n", value: "v" }] } },
	adHoc: {
		adHoc: { outputCollection: "res", outputElement: "=x", activeElementsCollection: "=ids" },
	},
	agentDefinition: { agentDefinition: { agentType: "aiAgentTask" } },
	formDefinition: { formDefinition: { formId: "form1" } },
	calledDecision: { calledDecision: { decisionId: "dec", resultVariable: "out" } },
	calledElement: {
		calledElement: {
			processId: "child",
			propagateAllChildVariables: false,
			propagateAllParentVariables: true,
			bindingType: "versionTag",
			versionTag: "v1",
		},
	},
	userTask: { userTask: true },
	assignmentDefinition: {
		assignmentDefinition: { assignee: "me", candidateGroups: "g", candidateUsers: "u" },
	},
	taskSchedule: { taskSchedule: { dueDate: "2030-01-01", followUpDate: "2030-02-01" } },
	priorityDefinition: { priorityDefinition: { priority: "75" } },
	subscription: { subscription: { correlationKey: "=key" } },
	unknownElements: {
		unknownElements: [{ name: "zeebe:future", attributes: { a: "1" }, children: [] }],
	},
} satisfies Record<keyof ZeebeExtensions, ZeebeExtensions>

const ALL_KEYS = Object.keys(FIXTURES) as (keyof ZeebeExtensions)[]

describe("getZeebeExtensions is the inverse of zeebeExtensionsToXmlElements", () => {
	it.each(ALL_KEYS)("roundtrips %s", (key) => {
		const ext: ZeebeExtensions = FIXTURES[key]
		expect(getZeebeExtensions(zeebeExtensionsToXmlElements(ext))).toEqual(ext)
	})

	it("roundtrips every field populated at once", () => {
		const ext: ZeebeExtensions = Object.assign({}, ...Object.values(FIXTURES))
		expect(getZeebeExtensions(zeebeExtensionsToXmlElements(ext))).toEqual(ext)
	})

	it("writes only defined calledElement attributes", () => {
		const [el] = zeebeExtensionsToXmlElements({ calledElement: { processId: "p" } })
		expect(el).toEqual({
			name: "zeebe:calledElement",
			attributes: { processId: "p" },
			children: [],
		})
	})

	it("tolerates missing attributes", () => {
		const bare = (name: string) => [{ name, attributes: {}, children: [] }]
		expect(getZeebeExtensions(bare("zeebe:calledElement")).calledElement).toEqual({ processId: "" })
		expect(getZeebeExtensions(bare("zeebe:adHoc")).adHoc).toEqual({})
		expect(getZeebeExtensions(bare("zeebe:priorityDefinition")).priorityDefinition).toEqual({
			priority: "",
		})
	})
})
