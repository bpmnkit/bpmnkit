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

it("the corpus spec files stay invented processes", () => {
	for (const name of ["collab-festival-permits", "collab-lab-samples"])
		expect(readFileSync(new URL(`${name}.txt`, corpusDir), "utf8")).toMatch(/^# /)
})
