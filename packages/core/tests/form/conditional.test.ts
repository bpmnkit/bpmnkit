import { describe, expect, it } from "vitest"
import { FormBuilder } from "../../src/form/form-builder.js"
import { parseForm } from "../../src/form/form-parser.js"
import { exportForm } from "../../src/form/form-serializer.js"

describe("form conditional + unknown props", () => {
	it("builder option reaches the export", () => {
		const json = exportForm(
			new FormBuilder("f").textfield("A", "a", { conditional: { hide: "=b" } }).build(),
		)
		expect(JSON.parse(json).components[0].conditional).toEqual({ hide: "=b" })
	})

	it("round-trips conditional and unmodelled props, inside groups too", () => {
		const src = {
			id: "f",
			type: "default",
			components: [
				{
					type: "group",
					id: "g",
					label: "G",
					layout: { row: "r1", columns: null },
					components: [
						{
							type: "textfield",
							id: "t",
							label: "T",
							key: "t",
							description: "help",
							conditional: { hide: "=x = 1" },
							layout: { row: "r2", columns: null },
						},
					],
				},
			],
		}
		const out = JSON.parse(exportForm(parseForm(JSON.stringify(src))))
		expect(out.components[0].components[0]).toMatchObject({
			description: "help",
			conditional: { hide: "=x = 1" },
		})
	})
})
