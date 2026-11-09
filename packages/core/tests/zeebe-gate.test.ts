import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
	Bpmn,
	DeployabilityError,
	PLACEHOLDERS,
	type PlaceholderField,
	assertDeployable,
	assertDeployableXml,
	isDeployable,
	validateDeployableXml,
} from "../src/index.js"

// The fixtures are the gate's conformance inputs, which the Rust twin's tests read too.
const gate = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/gate")
const fixture = (name: string): string =>
	fs.readFileSync(path.join(gate, name, "input.bpmn"), "utf8")

const TWO_ERRORS = [
	"Not deployable on Camunda 8.8: 2 error(s)",
	"- charge: Must have exactly one 'zeebe:taskDefinition' extension element (zeebe/service-task-definition)",
	"- notify: Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element (zeebe/send-task-implementation)",
].join("\n")

function thrown(fn: () => unknown): DeployabilityError {
	try {
		fn()
	} catch (err) {
		if (err instanceof DeployabilityError) return err
		throw err
	}
	throw new Error("expected a DeployabilityError")
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe("assertDeployable", () => {
	it("returns a deployable model as it is", () => {
		const defs = Bpmn.parse(fixture("deployable"))
		const result = assertDeployable(defs)
		expect(result.definitions).toBe(defs)
		expect(result.placeholders).toEqual([])
		expect(result.warnings).toEqual([])
	})

	it("refuses a model with two errors, naming both", () => {
		const err = thrown(() =>
			assertDeployable(Bpmn.parse(fixture("two-errors")), { camundaVersion: "8.8" }),
		)
		expect(err.message).toBe(TWO_ERRORS)
		expect(err.code).toBe("deployability-error")
		expect(err.name).toBe("DeployabilityError")
		expect(err.camundaVersion).toBe("8.8")
		expect(err.findings.map((f) => [f.id, f.elementIds, f.severity])).toEqual([
			["zeebe/service-task-definition", ["charge"], "error"],
			["zeebe/send-task-implementation", ["notify"], "error"],
		])
	})

	it("checks the newest version unless told otherwise", () => {
		const err = thrown(() => assertDeployable(Bpmn.parse(fixture("two-errors"))))
		expect(err.camundaVersion).toBe("8.10")
		expect(err.message.split("\n")[0]).toBe("Not deployable on Camunda 8.10: 2 error(s)")
	})

	it("fills every placeholder field, reports it, and the result deploys", () => {
		const fields = new Set<PlaceholderField>()
		for (const name of ["every-placeholder", "every-placeholder-attribute", "two-errors"]) {
			const result = assertDeployable(Bpmn.parse(fixture(name)), { placeholders: true })
			for (const p of result.placeholders) {
				fields.add(p.field)
				const template = PLACEHOLDERS[p.field].value
				expect(p.value).toBe(template.replace("<elementId>", p.elementId))
				expect(p.rule).toMatch(/^zeebe\//)
			}
			expect(isDeployable(validateDeployableXml(Bpmn.export(result.definitions)))).toBe(true)
		}
		expect([...fields].sort()).toEqual(Object.keys(PLACEHOLDERS).sort())
	})

	it("fills job types for the two-error model", () => {
		const result = assertDeployable(Bpmn.parse(fixture("two-errors")), { placeholders: true })
		expect(result.placeholders).toEqual([
			{
				elementId: "charge",
				field: "jobType",
				value: "placeholder-charge",
				rule: "zeebe/service-task-definition",
			},
			{
				elementId: "notify",
				field: "jobType",
				value: "placeholder-notify",
				rule: "zeebe/send-task-implementation",
			},
		])
		const xml = Bpmn.export(result.definitions)
		expect(xml).toContain('<zeebe:taskDefinition type="placeholder-charge"')
	})

	it("never mutates the input", () => {
		const defs = Bpmn.parse(fixture("every-placeholder"))
		const before = JSON.stringify(defs)
		const result = assertDeployable(defs, { placeholders: true })
		expect(result.definitions).not.toBe(defs)
		expect(JSON.stringify(defs)).toBe(before)
	})

	it("still refuses what no placeholder can fix", () => {
		const err = thrown(() =>
			assertDeployable(Bpmn.parse(fixture("not-fillable")), { placeholders: true }),
		)
		expect(err.message).toBe(
			"Not deployable on Camunda 8.10: 1 error(s)\n- order: Multiple none start events are not allowed (zeebe/multiple-none-start)",
		)
	})
})

describe("Bpmn.export validate", () => {
	const broken = () => Bpmn.parse(fixture("two-errors"))
	const engineNeutral = () => {
		const defs = broken()
		const {
			"modeler:executionPlatform": _platform,
			"modeler:executionPlatformVersion": _version,
			...rest
		} = defs.unknownAttributes
		defs.unknownAttributes = rest
		return defs
	}

	it("auto (default) refuses a Camunda 8 model Zeebe rejects, for its target version", () => {
		expect(() => Bpmn.export(broken())).toThrow(TWO_ERRORS)
		expect(() => Bpmn.export(broken(), { validate: "auto" })).toThrow(DeployabilityError)
	})

	it("auto leaves a model for no Camunda 8 platform alone", () => {
		expect(Bpmn.export(engineNeutral())).toContain('id="charge"')
		const c7 = broken()
		c7.unknownAttributes["modeler:executionPlatform"] = "Camunda Platform"
		expect(Bpmn.export(c7)).toContain('id="charge"')
	})

	it("auto checks the newest version when executionPlatformVersion does not parse", () => {
		const defs = broken()
		defs.unknownAttributes["modeler:executionPlatformVersion"] = "next"
		expect(() => Bpmn.export(defs)).toThrow("Not deployable on Camunda 8.10: 2 error(s)")
	})

	it("error refuses whatever the platform", () => {
		expect(() => Bpmn.export(engineNeutral(), { validate: "error" })).toThrow(
			"Not deployable on Camunda 8.10: 2 error(s)",
		)
	})

	it("warn logs the message and exports", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
		const xml = Bpmn.export(broken(), { validate: "warn" })
		expect(xml).toContain('id="charge"')
		expect(warn).toHaveBeenCalledWith(TWO_ERRORS)
	})

	it("false skips the check", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
		expect(Bpmn.export(broken(), { validate: false })).toContain('id="charge"')
		expect(warn).not.toHaveBeenCalled()
	})

	it("exports a deployable model under every mode", () => {
		const defs = Bpmn.parse(fixture("deployable"))
		for (const validate of ["auto", "error", "warn", false] as const) {
			expect(Bpmn.export(defs, { validate })).toContain('id="charge"')
		}
	})
})

const DEFINITIONS_DOCUMENTATION = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:documentation>About these models</bpmn:documentation>
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"/>
  </bpmn:process>
</bpmn:definitions>`

describe("definitions-level documentation", () => {
	it("is refused by the XSD stage, as Zeebe refuses it (repro z00)", () => {
		const findings = validateDeployableXml(DEFINITIONS_DOCUMENTATION)
		expect(isDeployable(findings)).toBe(false)
		expect(findings[0]?.message).toContain("documentation")
	})

	it("is written inside a bpmn:extension, which deploys and reads back", () => {
		const xml = Bpmn.export(Bpmn.parse(DEFINITIONS_DOCUMENTATION), { validate: false })
		expect(xml).toContain("<bpmn:extension>")
		expect(isDeployable(validateDeployableXml(xml))).toBe(true)
		const back = Bpmn.parse(xml)
		expect(back.documentation).toBe("About these models")
		expect(back.unknownChildren).toBeUndefined()
		expect(Bpmn.export(back, { validate: false })).toBe(xml)
	})
})

describe("assertDeployableXml", () => {
	it("returns the warnings of XML that deploys", () => {
		expect(assertDeployableXml(fixture("deployable"))).toEqual(
			validateDeployableXml(fixture("deployable")),
		)
	})

	it("throws the gate's message for the bytes as they are", () => {
		// The fixture declares 8.8.0, which is what is checked.
		const err = thrown(() => assertDeployableXml(fixture("two-errors")))
		expect(err.message).toBe(TWO_ERRORS)
		expect(err.camundaVersion).toBe("8.8")
	})

	it("checks the document's own executionPlatformVersion by default", () => {
		const xml = fixture("two-errors").replace(
			'executionPlatformVersion="8.8.0"',
			'executionPlatformVersion="8.7.0"',
		)
		expect(thrown(() => assertDeployableXml(xml)).camundaVersion).toBe("8.7")
	})
})
