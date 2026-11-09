import { describe, expect, it } from "vitest"
import {
	canAttach,
	canConnect,
	canContain,
	canMessageFlow,
	canMorph,
	canResize,
} from "../src/rules.js"

describe("canConnect", () => {
	it("allows a normal task → task flow", () => {
		expect(canConnect("task", "userTask")).toBe(true)
	})

	it("forbids outgoing from an end event and incoming to a start event", () => {
		expect(canConnect("endEvent", "task")).toBe(false)
		expect(canConnect("messageEndEvent", "task")).toBe(false)
		expect(canConnect("task", "startEvent")).toBe(false)
		expect(canConnect("task", "messageStartEvent")).toBe(false)
	})

	it("forbids a sequence flow into a boundary event", () => {
		expect(canConnect("task", "boundaryEvent")).toBe(false)
	})

	it("forbids data elements and annotations as sequence-flow endpoints", () => {
		expect(canConnect("task", "dataObjectReference")).toBe(false)
		expect(canConnect("dataStoreReference", "task")).toBe(false)
		expect(canConnect("task", "textAnnotation")).toBe(false)
	})

	it("restricts event-based gateway targets to catch events / receive tasks", () => {
		expect(canConnect("eventBasedGateway", "intermediateCatchEvent")).toBe(true)
		expect(canConnect("eventBasedGateway", "receiveTask")).toBe(true)
		expect(canConnect("eventBasedGateway", "task")).toBe(false)
		expect(canConnect("eventBasedGateway", "userTask")).toBe(false)
	})
})

describe("canAttach", () => {
	it("attaches a boundary event to an activity", () => {
		expect(canAttach("subProcess")).toBe(true)
		expect(canAttach("serviceTask")).toBe(true)
	})

	it("refuses to attach to a non-activity", () => {
		expect(canAttach("exclusiveGateway")).toBe(false)
		expect(canAttach("startEvent")).toBe(false)
	})
})

describe("canContain", () => {
	it("lets a container hold a flow node", () => {
		expect(canContain("subProcess", "task")).toBe(true)
		expect(canContain("lane", "userTask")).toBe(true)
		expect(canContain("participant", "startEvent")).toBe(true)
	})

	it("refuses non-containers and nested pools", () => {
		expect(canContain("task", "userTask")).toBe(false)
		expect(canContain("participant", "participant")).toBe(false)
	})
})

describe("canResize", () => {
	it("resizes activities and annotations but not events/gateways", () => {
		expect(canResize("subProcess")).toBe(true)
		expect(canResize("textAnnotation")).toBe(true)
		expect(canResize("startEvent")).toBe(false)
		expect(canResize("exclusiveGateway")).toBe(false)
	})
})

describe("canMorph", () => {
	it("morphs within the same category", () => {
		expect(canMorph("exclusiveGateway", "parallelGateway")).toBe(true)
		expect(canMorph("startEvent", "messageStartEvent")).toBe(true)
		expect(canMorph("task", "userTask")).toBe(true)
		expect(canMorph("intermediateCatchEvent", "messageCatchEvent")).toBe(true)
	})

	it("refuses cross-category morphs and no-op morphs", () => {
		expect(canMorph("task", "exclusiveGateway")).toBe(false)
		expect(canMorph("startEvent", "endEvent")).toBe(false)
		expect(canMorph("task", "task")).toBe(false)
	})
})

describe("canMessageFlow", () => {
	const pool = { type: "participant" }

	it("allows activities, pools and events that can send or receive a message", () => {
		expect(canMessageFlow({ type: "serviceTask" }, pool)).toBe(true)
		expect(canMessageFlow(pool, { type: "userTask" })).toBe(true)
		expect(canMessageFlow(pool, pool)).toBe(true)
		expect(canMessageFlow({ type: "endEvent", trigger: "message" }, pool)).toBe(true)
		expect(canMessageFlow(pool, { type: "startEvent" })).toBe(true)
		expect(canMessageFlow(pool, { type: "boundaryEvent", trigger: "message" })).toBe(true)
	})

	it("refuses gateways, data, lanes and annotations at either end", () => {
		expect(canMessageFlow({ type: "exclusiveGateway" }, pool)).toBe(false)
		expect(canMessageFlow(pool, { type: "parallelGateway" })).toBe(false)
		expect(canMessageFlow({ type: "dataObjectReference" }, pool)).toBe(false)
		expect(canMessageFlow({ type: "task" }, { type: "lane" })).toBe(false)
		expect(canMessageFlow({ type: "lane" }, pool)).toBe(false)
		expect(canMessageFlow(pool, { type: "textAnnotation" })).toBe(false)
	})

	it("refuses events that point the wrong way or wait for something else", () => {
		expect(canMessageFlow({ type: "startEvent" }, pool)).toBe(false)
		expect(canMessageFlow({ type: "intermediateCatchEvent", trigger: "message" }, pool)).toBe(false)
		expect(canMessageFlow(pool, { type: "endEvent" })).toBe(false)
		expect(canMessageFlow(pool, { type: "intermediateThrowEvent" })).toBe(false)
		expect(canMessageFlow(pool, { type: "startEvent", trigger: "timer" })).toBe(false)
	})
})
