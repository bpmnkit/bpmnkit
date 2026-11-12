import { readFile, writeFile } from "node:fs/promises"
import { toHtml } from "@bpmnkit/viewer-lite/html"
import { flagStr } from "../args.js"
import type { Command, CommandGroup } from "../types.js"

const exportHtmlCmd: Command = {
	name: "html",
	description:
		"Write one self-contained HTML file that shows a BPMN diagram — pan/zoom, dark mode, no network or other files",
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
	],
	examples: [
		{ description: "order.html next to the file", command: "casen export html order.bpmn" },
		{
			description: "Choose the path and title",
			command: 'casen export html order.bpmn -o site/order.html --title "Order process"',
		},
	],
	async run(ctx) {
		const [file] = ctx.positional
		if (!file) throw new Error("Missing required argument: <file>")
		const out = flagStr(ctx.flags, "out", "o") || `${file.replace(/\.bpmn$/i, "")}.html`
		const title = flagStr(ctx.flags, "title")
		await writeFile(out, toHtml(await readFile(file, "utf-8"), { title }), "utf-8")
		ctx.output.ok(`HTML written to ${out}`)
	},
}

export const exportGroup: CommandGroup = {
	name: "export",
	description: "Export a BPMN file as a single self-contained HTML viewer",
	commands: [exportHtmlCmd],
}
