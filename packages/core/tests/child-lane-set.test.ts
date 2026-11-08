import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { serializeBpmn } from "../src/bpmn/bpmn-serializer.js"

// A lane's nested set is <childLaneSet>; writing it as <laneSet> lost the nested lanes on re-parse.
describe("childLaneSet", () => {
	it("survives a second round trip", () => {
		const xml = `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="t">
  <bpmn:process id="p">
    <bpmn:laneSet id="ls">
      <bpmn:lane id="outer">
        <bpmn:childLaneSet id="cls">
          <bpmn:lane id="inner"/>
        </bpmn:childLaneSet>
      </bpmn:lane>
    </bpmn:laneSet>
  </bpmn:process>
</bpmn:definitions>`
		const once = serializeBpmn(parseBpmn(xml))
		expect(once).toContain('<bpmn:childLaneSet id="cls">')
		const lane = parseBpmn(once).processes[0]?.laneSet?.lanes[0]
		expect(lane?.childLaneSet?.lanes[0]?.id).toBe("inner")
		expect(serializeBpmn(parseBpmn(once))).toBe(once)
	})
})
