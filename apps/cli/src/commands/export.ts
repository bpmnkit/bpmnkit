import { readFile, writeFile } from "node:fs/promises"
import { type HtmlOptions, toHtml } from "@bpmnkit/viewer-lite/html"
import { flagAll, flagStr } from "../args.js"
import type { Command, CommandGroup } from "../types.js"

// `--color` names -> `toHtml` colour keys.
const COLOR_KEYS: Record<string, keyof NonNullable<HtmlOptions["colors"]>> = {
	bg: "bg",
	fill: "shapeFill",
	stroke: "shapeStroke",
	flow: "flowStroke",
	text: "text",
	"pool-header": "poolHeader",
	halo: "textHalo",
}

function parseColors(pairs: string[]): NonNullable<HtmlOptions["colors"]> {
	const colors: NonNullable<HtmlOptions["colors"]> = {}
	for (const pair of pairs) {
		const at = pair.indexOf("=")
		const key = COLOR_KEYS[pair.slice(0, at)]
		if (at < 0 || !key) {
			throw new Error(
				`Invalid --color "${pair}": expected key=value, key one of ${Object.keys(COLOR_KEYS).join(", ")}`,
			)
		}
		colors[key] = pair.slice(at + 1)
	}
	return colors
}

const exportHtmlCmd: Command = {
	name: "html",
	description:
		"Write one self-contained HTML file that shows a BPMN diagram — pan/zoom, light, dark or auto theme, brand colours, no network or other files",
	args: [{ name: "file", description: "Path to the .bpmn file", required: true }],
	flags: [
		{
			name: "out",
			description: "Output path, also -o (default: <file>.html next to the input)",
			type: "string",
		},
		{
			name: "title",
			description: "Page title (default: BPMN diagram)",
			type: "string",
		},
		{
			name: "theme",
			description: "light (default), dark, or auto (follow the reader's OS)",
			type: "string",
		},
		{
			name: "color",
			description:
				"Brand colour key=value, repeatable (keys: bg, fill, stroke, flow, text, pool-header, halo)",
			type: "string",
		},
	],
	examples: [
		{ description: "order.html next to the file", command: "casen export html order.bpmn" },
		{
			description: "Choose the path and title",
			command: 'casen export html order.bpmn -o site/order.html --title "Order process"',
		},
		{
			description: "Dark page with a brand stroke colour",
			command:
				"casen export html order.bpmn --theme dark --color stroke=#0b5fff --color bg=#101820",
		},
	],
	async run(ctx) {
		const [file] = ctx.positional
		if (!file) throw new Error("Missing required argument: <file>")
		const out = flagStr(ctx.flags, "out", "o") || `${file.replace(/\.bpmn$/i, "")}.html`
		const title = flagStr(ctx.flags, "title")
		const theme = flagStr(ctx.flags, "theme")
		if (theme !== undefined && theme !== "light" && theme !== "dark" && theme !== "auto") {
			throw new Error(`Invalid --theme "${theme}": use light, dark or auto`)
		}
		const colors = parseColors(flagAll(ctx.flags, ctx.repeated, "color"))
		const html = toHtml(await readFile(file, "utf-8"), { title, theme, colors })
		await writeFile(out, html, "utf-8")
		ctx.output.ok(`HTML written to ${out}`)
	},
}

export const exportGroup: CommandGroup = {
	name: "export",
	description: "Export a BPMN file as a single self-contained HTML viewer",
	commands: [exportHtmlCmd],
}
