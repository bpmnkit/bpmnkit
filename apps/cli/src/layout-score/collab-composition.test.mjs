import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"
import { measure } from "../../../../scripts/layout-aesthetics/metrics.mjs"
import {
	corpusDir,
	discover,
	layoutCase,
} from "../../../../scripts/layout-aesthetics/score-lib.mjs"
import { compileTextSpec, keyThrownMessages } from "../commands/build-spec.js"
import { dropRewiredEdges } from "../commands/build.js"

const deps = { compileTextSpec, keyThrownMessages, dropRewiredEdges }
const score = async (name) => {
	const c = discover(fileURLToPath(corpusDir)).find((x) => x.name === name)
	return measure(await layoutCase(c, deps))
}

// Before values: the layout before the collaboration-composition rules (2026-11-19).
it("frames every pool of a collaboration to one width", async () => {
	for (const name of ["collab-festival-permits", "collab-lab-samples", "collab-travel-booking"])
		expect((await score(name)).poolWidthSD, name).toBe(0) // was 73, 119, 302
})

it("drops messages straight where the centres line up and keeps risers off labels", async () => {
	const festival = await score("collab-festival-permits")
	expect(festival.nonVerticalMsgPct).toBeLessThan(85.7)
	expect(festival.msgSeqCrossings).toBe(0) // was 1
	const travel = await score("collab-travel-booking")
	expect(travel.bendsPerMsg).toBeLessThan(1.5)
	expect(travel.nonVerticalMsgPct).toBeLessThan(50)
})

it("moves an event's name off the side its message docks on", async () => {
	expect((await score("collab-lab-samples")).labelCollisions).toBeLessThan(7)
})

// Hub-and-spoke collaborations (11-12 pools, request/reply pairs, black
// boxes): the label nudge and dock snap once added crossings here. Bounds are
// the layout before those rules (5898d579).
// Hub cases are 11-12 pools laid out twice (both pool orders): seconds each
// on a busy CI runner, well past vitest's 5 s default.
const HEAVY = 30_000

it(
	"tidying message docks never adds a crossing on hub-and-spoke collaborations",
	async () => {
		for (const [name, msgMsg, total] of [
			["collab-hub-admissions", 14, 29], // P1 alone: 17, 33
			["collab-hub-wedding", 15, 30], // P1 alone: 15, 33
			["collab-hub-transplant", 9, 33], // P1 alone: 9, 34
		]) {
			const m = await score(name)
			expect(m.msgMsgCrossings, name).toBeLessThanOrEqual(msgMsg)
			expect(m.crossings, name).toBeLessThanOrEqual(total)
		}
	},
	HEAVY,
)

it(
	"stacks hub-and-spoke pools by crossings when that bends and slants no more",
	async () => {
		// Before (message-distance order): crossings 29 and 30, non-vertical 77.8 and 69 %.
		const admissions = await score("collab-hub-admissions")
		expect(admissions.crossings).toBeLessThan(29)
		expect(admissions.nonVerticalMsgPct).toBeLessThan(77.8)
		const wedding = await score("collab-hub-wedding")
		expect(wedding.crossings).toBeLessThan(30)
		expect(wedding.nonVerticalMsgPct).toBeLessThan(69)
	},
	HEAVY,
)

it("the corpus spec files stay invented processes", () => {
	for (const name of [
		"collab-festival-permits",
		"collab-lab-samples",
		"collab-hub-admissions",
		"collab-hub-wedding",
		"collab-hub-transplant",
	])
		expect(readFileSync(new URL(`${name}.txt`, corpusDir), "utf8")).toMatch(/^# /)
})
