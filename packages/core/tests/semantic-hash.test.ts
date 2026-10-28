import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { applyAutoLayout } from "../src/bpmn/auto-layout.js"
import { Bpmn } from "../src/bpmn/index.js"
import { diffSemantics, projectSemantics, semanticHash } from "../src/bpmn/semantic-hash.js"

const fixtureDirectory = join(import.meta.dirname, "fixtures", "roundtrip")

function fixtures(): string[] {
	return readdirSync(fixtureDirectory)
		.filter((name) => name.endsWith(".bpmn"))
		.sort()
}

function parseFixture(name: string) {
	return Bpmn.parse(readFileSync(join(fixtureDirectory, name), "utf-8"))
}

const MINIMAL = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="x">
  <bpmn:process id="P" isExecutable="true">
    <bpmn:startEvent id="S"><bpmn:outgoing>F</bpmn:outgoing></bpmn:startEvent>
    <bpmn:endEvent id="E"><bpmn:incoming>F</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="F" sourceRef="S" targetRef="E" />
  </bpmn:process>
</bpmn:definitions>`

describe("semanticHash", () => {
	it("is a sha-256 hex digest", () => {
		expect(semanticHash(Bpmn.parse(MINIMAL))).toMatch(/^[0-9a-f]{64}$/)
	})

	it("is unchanged by auto-layout", () => {
		// The assertion the module exists for: a layout pass moves the picture and
		// must not be able to touch the model.
		for (const name of fixtures()) {
			const definitions = parseFixture(name)
			const before = semanticHash(definitions)
			expect(semanticHash(applyAutoLayout(definitions)), name).toBe(before)
		}
	})

	it("is unchanged by a serialise/parse round trip", () => {
		for (const name of fixtures()) {
			const definitions = parseFixture(name)
			const reparsed = Bpmn.parse(Bpmn.export(definitions))
			expect(semanticHash(reparsed), name).toBe(semanticHash(definitions))
		}
	})

	it("ignores the exporter that wrote the file", () => {
		const definitions = Bpmn.parse(MINIMAL)
		const branded = Bpmn.parse(MINIMAL)
		branded.exporter = "Some Modeler"
		branded.exporterVersion = "9.9.9"
		expect(semanticHash(branded)).toBe(semanticHash(definitions))
	})

	it("ignores a modeler template icon", () => {
		const withIcon = Bpmn.parse(MINIMAL)
		const task = withIcon.processes[0]?.flowElements[0]
		expect(task).toBeDefined()
		if (task) task.unknownAttributes["zeebe:modelerTemplateIcon"] = "data:image/svg+xml;base64,AAAA"
		expect(semanticHash(withIcon)).toBe(semanticHash(Bpmn.parse(MINIMAL)))
	})

	it("ignores the order elements are declared in", () => {
		const definitions = Bpmn.parse(MINIMAL)
		const shuffled = Bpmn.parse(MINIMAL)
		const process = shuffled.processes[0]
		expect(process).toBeDefined()
		if (process) process.flowElements.reverse()
		expect(semanticHash(shuffled)).toBe(semanticHash(definitions))
	})

	it("changes when a name changes", () => {
		const definitions = Bpmn.parse(MINIMAL)
		const renamed = Bpmn.parse(MINIMAL)
		const task = renamed.processes[0]?.flowElements[0]
		if (task) task.name = "Renamed"
		expect(semanticHash(renamed)).not.toBe(semanticHash(definitions))
	})

	it("changes when a Zeebe extension changes", () => {
		const changed = Bpmn.parse(MINIMAL)
		const process = changed.processes[0]
		if (process) {
			process.extensionElements.push({
				name: "zeebe:versionTag",
				attributes: { value: "v2" },
				children: [],
			})
		}
		expect(semanticHash(changed)).not.toBe(semanticHash(Bpmn.parse(MINIMAL)))
	})

	it("keeps the execution platform, which names the target engine", () => {
		const retargeted = Bpmn.parse(MINIMAL)
		retargeted.unknownAttributes["modeler:executionPlatformVersion"] = "8.7.0"
		expect(semanticHash(retargeted)).not.toBe(semanticHash(Bpmn.parse(MINIMAL)))
	})

	it("gives every fixture a distinct hash", () => {
		const hashes = fixtures().map((name) => semanticHash(parseFixture(name)))
		expect(new Set(hashes).size).toBe(hashes.length)
	})

	/**
	 * The invariance tests above are relative — they compare two hashes that
	 * would move together if the projection rules changed. These are absolute,
	 * so quietly dropping a field from the projection fails here.
	 *
	 * Regenerating a value is a reviewed change: it means either a fixture or
	 * what counts as semantics has changed, and one of those should be in the
	 * commit message.
	 *
	 * 2026-10-27: `isExecutable="false"` became semantics. Flowable reads an
	 * absent attribute as executable, so `false` and absent are different models;
	 * the fixtures that say `false` got new values.
	 */
	const GOLDEN: Record<string, string> = {
		"01-root-elements.bpmn": "cb299a10ca6a31810963b5bb48a5ddbf0ebdfdd3ab9e0756d881de3d6e72a097",
		"02-collaboration.bpmn": "c97ef9241690c1ae0372af1e1d860666fc562506997e93c4e70a8f8168b99e12",
		"03-data-elements.bpmn": "4f9e9d0fbd41a55fc260641b2f253b1cddfcd59f4c8529e8cc321ca893c78222",
		"04-artifacts.bpmn": "dc1506d309f7ca7f5dcca3f0efb84d3b00f1bfc2064768bcf83b3633701013b3",
		"05-zeebe-extensions.bpmn": "cc7d33a3c0a5dda3cd7e086689f4e1f8e4132855870181ab066a99845e407aa6",
		"06-events-and-containers.bpmn":
			"89c79344d77e365cabe3d0e257ae8074880e3cf292d3a790dc5a0389ab74177f",
		"07-unmodelled-content.bpmn":
			"950b8ea3610bcce9f8d25162eddc0f5ad2648a884d1a28c3cb2d51bf0af2797e",
		// Flowable Modeler style: no definitions id, nested lanes, a partner pool. Added 2026-10-27.
		"08-flowable-lanes-pools.bpmn":
			"556f9e0189b4b4eb514ce27b91b15b3441df26fa24e63ec630ccbef20bc7c88b",
		// The MIWG reference models, added 2026-09-24.
		"miwg-A.1.0.bpmn": "f267ee5c74bfaefcc2d020811450628c4ae16a764582926d20396ba6c2fa0dc0",
		"miwg-A.2.0.bpmn": "3b2672b2a6ebd7657bbacba2c6b2d0fc91c419cde13aa68cc2da200a43ed41d0",
		"miwg-A.2.1.bpmn": "2a6b1177cbc11cd531a5a2c79909b411e94e96550274923bcde9ea24104f6a78",
		"miwg-A.3.0.bpmn": "26ffa1110de4cef88b75923d7d09d682b52777da75ac59734b04633106639033",
		"miwg-A.4.0.bpmn": "ab0b15d835a7544b784b2a966982e566376bd65de66eded701dd18bee412c611",
		"miwg-A.4.1.bpmn": "fe152cb944197a64ef42cfa666a1971679f9472b016e53832ea6fa74ba7d2a75",
		"miwg-B.1.0.bpmn": "0c0f0bda84afd4a4865b1957117f9b4ee2c35af24d43dca2539bb7aa4aa38207",
		"miwg-B.2.0.bpmn": "dfb21576c28e74cbf5bd385f9f70fbfe974aed2b704ea57bed217fcbd759dd4a",
		"miwg-C.1.0.bpmn": "669535f4bf3759cbc31bfd98649659518babe873ab808e0ff34533efb33684a4",
		"miwg-C.1.1.bpmn": "467e93ab9d4d82139e6dbb10b3721cd159d11980164e18cb091efb4580a05172",
		"miwg-C.10.0.bpmn": "da719f8f328ba69ea1b627ce3c475de4924350cd4010ed2a0a60acaac2bab8fe",
		"miwg-C.2.0.bpmn": "62d9eecf9d58bea1ff379de475f37fc8ab08e9a0bb966263559106ee93a1c924",
		"miwg-C.3.0.bpmn": "9a86bc1ba55fdb19ce8b87ffc2cec0cbc7bd70af45e5702a670b8b53e2c914da",
		"miwg-C.4.0.bpmn": "3496338d073c9b418c230272f6b333dc37b603443ecef2463eba8561723fdae2",
		"miwg-C.5.0.bpmn": "b7f1b6638ba56a0821d1230e5f2f5f995f589358851e0a94dd029198c003550f",
		"miwg-C.6.0.bpmn": "48db82c84648615e9b23061829c6ecb4bb5c9c17dd8ac3d1704f319b72dfa192",
		"miwg-C.7.0.bpmn": "90342bb3600d9df4ddc669f7d330bb50df8ae187e9abbb23b89d2d1439f733fd",
		"miwg-C.8.0.bpmn": "8206b3c865821ec7a253ebd2299be0bb2dfa0c6bfe73af33ee6e24f46265602c",
		"miwg-C.8.1.bpmn": "61c4c6f4ae291db36832fa5144457889c51a8f61ff350dd95851a46156b43856",
		"miwg-C.9.0.bpmn": "56a06e19b6e06095ca7e91368a02d1ef657f94184fb3df85a78dd7e88f9709c2",
		"miwg-C.9.1.bpmn": "ab5ccf901fbadf9c35c39be95460c81875663e338e08b35ebfc023c81e2731e2",
		"miwg-C.9.2.bpmn": "dc4f04f6ebe339bc4994e33120a025e8978a314a5371b13a323c0364f330c535",
	}

	it("has a golden hash for every fixture", () => {
		expect(fixtures().filter((name) => GOLDEN[name] === undefined)).toEqual([])
	})

	it("matches the golden hashes", () => {
		for (const name of fixtures()) {
			expect(semanticHash(parseFixture(name)), name).toBe(GOLDEN[name])
		}
	})
})

/**
 * A hash is only useful if it separates models that differ and joins models that
 * do not. These are the pairs a careless projection gets wrong: sorting arrays
 * without keeping each entry's own content distinct collides the first three,
 * and comparing raw serialised text splits the last three.
 */
describe("semanticHash discrimination", () => {
	const wrap = (body: string) => `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="D" targetNamespace="x">
<bpmn:process id="P" isExecutable="true">${body}</bpmn:process></bpmn:definitions>`
	const hash = (body: string) => semanticHash(Bpmn.parse(wrap(body)))

	const differs: Array<[string, string, string]> = [
		[
			"two tasks swapping names",
			'<bpmn:task id="A" name="one"/><bpmn:task id="B" name="two"/>',
			'<bpmn:task id="A" name="two"/><bpmn:task id="B" name="one"/>',
		],
		[
			"a sequence flow rewired",
			'<bpmn:task id="A"/><bpmn:task id="B"/><bpmn:sequenceFlow id="F" sourceRef="A" targetRef="B"/>',
			'<bpmn:task id="A"/><bpmn:task id="B"/><bpmn:sequenceFlow id="F" sourceRef="B" targetRef="A"/>',
		],
		["an element type", '<bpmn:task id="A"/>', '<bpmn:userTask id="A"/>'],
		[
			"a nested ioMapping source",
			'<bpmn:serviceTask id="T"><bpmn:extensionElements><zeebe:ioMapping><zeebe:input source="=a" target="x"/></zeebe:ioMapping></bpmn:extensionElements></bpmn:serviceTask>',
			'<bpmn:serviceTask id="T"><bpmn:extensionElements><zeebe:ioMapping><zeebe:input source="=b" target="x"/></zeebe:ioMapping></bpmn:extensionElements></bpmn:serviceTask>',
		],
		[
			"a gateway default flow",
			'<bpmn:exclusiveGateway id="G" default="F1"/>',
			'<bpmn:exclusiveGateway id="G" default="F2"/>',
		],
		[
			"a condition expression",
			'<bpmn:sequenceFlow id="F" sourceRef="A" targetRef="B"><bpmn:conditionExpression>=x</bpmn:conditionExpression></bpmn:sequenceFlow>',
			'<bpmn:sequenceFlow id="F" sourceRef="A" targetRef="B"><bpmn:conditionExpression>=y</bpmn:conditionExpression></bpmn:sequenceFlow>',
		],
	]

	for (const [label, left, right] of differs) {
		it(`separates models differing by ${label}`, () => {
			expect(hash(left)).not.toBe(hash(right))
		})
	}

	const matches: Array<[string, string, string]> = [
		[
			"declaration order",
			'<bpmn:task id="A" name="one"/><bpmn:task id="B" name="two"/>',
			'<bpmn:task id="B" name="two"/><bpmn:task id="A" name="one"/>',
		],
		[
			"attribute order",
			'<bpmn:task id="A" name="one" isForCompensation="true"/>',
			'<bpmn:task id="A" isForCompensation="true" name="one"/>',
		],
		[
			"task header order",
			'<bpmn:serviceTask id="T"><bpmn:extensionElements><zeebe:taskHeaders><zeebe:header key="a" value="1"/><zeebe:header key="b" value="2"/></zeebe:taskHeaders></bpmn:extensionElements></bpmn:serviceTask>',
			'<bpmn:serviceTask id="T"><bpmn:extensionElements><zeebe:taskHeaders><zeebe:header key="b" value="2"/><zeebe:header key="a" value="1"/></zeebe:taskHeaders></bpmn:extensionElements></bpmn:serviceTask>',
		],
	]

	for (const [label, left, right] of matches) {
		it(`joins models differing only by ${label}`, () => {
			expect(hash(left)).toBe(hash(right))
		})
	}
})

describe("projectSemantics", () => {
	it("drops diagram interchange from the projection", () => {
		const projected = JSON.stringify(
			projectSemantics(parseFixture("06-events-and-containers.bpmn")),
		)
		expect(projected).not.toContain("BPMNShape")
		expect(projected).not.toContain("waypoint")
		expect(projected).toContain("Sub_work")
	})

	it("indexes every element that carries an id", () => {
		const { elements } = projectSemantics(Bpmn.parse(MINIMAL))
		expect([...elements.keys()].sort()).toEqual(["D", "E", "F", "P", "S"])
	})

	it("projects an element without inlining its id-bearing children", () => {
		const { elements } = projectSemantics(Bpmn.parse(MINIMAL))
		const process = JSON.stringify(elements.get("P"))
		// The process names its children rather than embedding them, so a change
		// inside a task is not reported as a change to the process too.
		expect(process).toContain('"S"')
		expect(process).not.toContain("sourceRef")
	})
})

describe("diffSemantics", () => {
	it("reports nothing for an unchanged model", () => {
		expect(diffSemantics(Bpmn.parse(MINIMAL), Bpmn.parse(MINIMAL))).toEqual({
			added: [],
			removed: [],
			changed: [],
		})
	})

	it("attributes a change to the element that changed, not its ancestors", () => {
		const after = Bpmn.parse(MINIMAL)
		const event = after.processes[0]?.flowElements[0]
		if (event) event.name = "Kicked off"

		const diff = diffSemantics(Bpmn.parse(MINIMAL), after)
		expect(diff.added).toEqual([])
		expect(diff.removed).toEqual([])
		expect(diff.changed.map((entry) => entry.id)).toEqual(["S"])
	})

	it("reports an added and a removed element", () => {
		const after = Bpmn.parse(MINIMAL)
		const process = after.processes[0]
		if (process) {
			process.flowElements = process.flowElements.filter((element) => element.id !== "E")
			process.flowElements.push({
				type: "endEvent",
				id: "E2",
				incoming: [],
				outgoing: [],
				extensionElements: [],
				unknownAttributes: {},
				eventDefinitions: [],
			})
		}

		const diff = diffSemantics(Bpmn.parse(MINIMAL), after)
		expect(diff.added).toEqual(["E2"])
		expect(diff.removed).toEqual(["E"])
	})

	it("reports nothing after auto-layout", () => {
		const definitions = parseFixture("06-events-and-containers.bpmn")
		const laidOut = applyAutoLayout(parseFixture("06-events-and-containers.bpmn"))
		expect(diffSemantics(definitions, laidOut)).toEqual({ added: [], removed: [], changed: [] })
	})
})
