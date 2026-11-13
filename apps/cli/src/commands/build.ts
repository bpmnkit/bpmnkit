import { readFile, readdir, writeFile } from "node:fs/promises"
import { basename, dirname, extname, join, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import * as core from "@bpmnkit/core"
import {
	Bpmn,
	type BpmnDefinitions,
	type CompactDiagram,
	DeployabilityError,
	Form,
	applyAutoLayout,
	attachUserTaskForms,
	expand,
	exportPreserving,
	makeRoom,
	placeNewShapes,
} from "@bpmnkit/core"
import type { Command, CommandGroup } from "../types.js"
import { BUILD_SPEC_GUIDE, compileTextSpec, dropThrowOnlyMessages } from "./build-spec.js"
import { type CheckRow, checkFiles } from "./check.js"
import { deployResources } from "./deploy.js"
import { bpmnlintrcKey } from "./lint.js"

const MODULE_EXT = new Set([".mjs", ".js", ".cjs", ".ts", ".mts", ".cts"])

/** What a spec module may export: a model, a builder, or a function returning either. */
type SpecValue = BpmnDefinitions | { build(): BpmnDefinitions }
type SpecModule = { default?: SpecValue | ((kit: typeof core, input?: BpmnDefinitions) => unknown) }

function isDefinitions(value: unknown): value is BpmnDefinitions {
	return (
		typeof value === "object" &&
		value !== null &&
		Array.isArray((value as BpmnDefinitions).processes)
	)
}

async function loadModule(
	path: string,
	input: BpmnDefinitions | undefined,
): Promise<BpmnDefinitions> {
	const mod = (await import(pathToFileURL(path).href)) as SpecModule
	let value: unknown = mod.default
	if (typeof value === "function") value = await value(core, input)
	if (
		typeof value === "object" &&
		value !== null &&
		"build" in value &&
		typeof value.build === "function"
	)
		value = (value as { build(): unknown }).build()
	if (!isDefinitions(value)) {
		throw new Error(
			`${basename(path)}: export default a model, a builder, or (kit, model) => one of them`,
		)
	}
	return value
}

/** Form ids of the `.form` files in `dir`: those are deployed as they are, not generated. */
async function formsIn(dir: string): Promise<Map<string, string>> {
	const found = new Map<string, string>()
	for (const name of await readdir(dir).catch(() => [] as string[])) {
		if (!name.endsWith(".form")) continue
		try {
			const id = (JSON.parse(await readFile(join(dir, name), "utf8")) as { id?: unknown }).id
			if (typeof id === "string") found.set(id, join(dir, name))
		} catch {
			// A broken form is the lint's to report once it is referenced.
		}
	}
	return found
}

function linkedFormIds(defs: BpmnDefinitions): Set<string> {
	const ids = new Set<string>()
	const visit = (elements: readonly core.BpmnFlowElement[]) => {
		for (const el of elements) {
			for (const x of el.extensionElements) {
				const id = x.name === "zeebe:formDefinition" ? x.attributes.formId : undefined
				if (id && !id.startsWith("=")) ids.add(id)
			}
			if ("flowElements" in el && Array.isArray(el.flowElements)) visit(el.flowElements)
		}
	}
	for (const p of defs.processes) visit(p.flowElements)
	return ids
}

function findingLine(r: CheckRow): string {
	const symbol = r.severity === "error" ? "✖" : "⚠"
	const at = r.elementId ? `${r.elementId}: ` : ""
	const key = bpmnlintrcKey(r.rule)
	const rule = key === undefined ? r.rule : `${r.rule}, .bpmnlintrc "${key}"`
	return `${symbol} ${basename(r.file)} ${at}${r.message} [${rule}]`
}

/**
 * Errors of the deploy gate, plus the warnings a bpmnlint rule reports (the ones
 * c8ctl / Modeler lint would show). Advice without a bpmnlint rule stays quiet.
 */
async function lintBuilt(files: string[]): Promise<CheckRow[]> {
	const errors = await checkFiles(files, { deploy: true })
	const seen = new Set(errors.map((r) => `${r.rule} ${r.elementId ?? ""}`))
	const warnings = (await checkFiles(files, { userTaskForms: "require" })).filter(
		(r) =>
			r.severity === "warning" &&
			bpmnlintrcKey(r.rule) !== undefined &&
			!seen.has(`${r.rule} ${r.elementId ?? ""}`),
	)
	return [...errors, ...warnings]
}

const buildCmd: Command = {
	name: "build",
	description:
		"Spec → .bpmn (+ .form) → lint → deploy in one call. Spec: text (.txt), compact JSON (.json) or a builder module (.mjs/.ts)",
	args: [
		{
			name: "spec",
			description: `Text spec, CompactDiagram JSON, or a module exporting a model/builder/(kit, model) => …\n${BUILD_SPEC_GUIDE}`,
			required: true,
		},
		{ name: "resources...", description: "Extra .dmn/.form files to lint and deploy with it" },
	],
	flags: [
		{
			name: "out",
			short: "o",
			description: "Output .bpmn (default: <spec>.bpmn, or the --edit file)",
			type: "string",
		},
		{
			name: "edit",
			description: "Existing .bpmn: the module gets (kit, model); existing shapes keep their place",
			type: "string",
		},
		{
			name: "deploy",
			description: "Deploy the .bpmn with its forms and resources",
			type: "boolean",
		},
		{
			name: "target",
			description: 'Deploy target: "auto" (ZEEBE_REST_ADDRESS env, else profile, else local Reebe)',
			type: "string",
			default: "auto",
			enum: ["auto", "local", "camunda8"],
		},
		{
			name: "lint",
			description: "Lint after building (default); --no-lint skips it",
			type: "boolean",
			default: true,
		},
		{
			name: "forms",
			description: "Give form-less user tasks a generated form (default); --no-forms leaves them",
			type: "boolean",
			default: true,
		},
		{
			name: "verbose",
			description: "Also list what the text spec reader completed",
			type: "boolean",
		},
	],
	examples: [
		{
			description: "Build, lint and deploy a text spec",
			command: "casen build expense.txt --deploy",
		},
		{
			description: "Insert a task into an existing file, layout kept",
			command: "casen build edit.mjs --edit order.bpmn",
		},
	],
	async run(ctx) {
		// The parser cannot know these take no value: `--deploy x.dmn` reads x.dmn as its value.
		const positional = [...ctx.positional]
		for (const name of ["deploy", "verbose"]) {
			const value = ctx.flags[name]
			if (typeof value === "string") {
				positional.push(value)
				ctx.flags[name] = true
			}
		}
		const spec = positional[0]
		if (!spec) throw new Error("Missing required argument: <spec>")
		const specPath = resolve(spec)
		const ext = extname(specPath).toLowerCase()
		const editPath = typeof ctx.flags.edit === "string" ? resolve(ctx.flags.edit) : undefined
		const outFlag =
			typeof ctx.flags.out === "string" ? ctx.flags.out : (ctx.flags.o as string | undefined)
		const out = resolve(
			typeof outFlag === "string"
				? outFlag
				: (editPath ?? join(dirname(specPath), `${basename(specPath, extname(specPath))}.bpmn`)),
		)
		const outDir = dirname(out)
		const extra = positional.slice(1).map((f) => resolve(f))

		let defs: BpmnDefinitions
		let fields: Record<string, string> = {}
		const original = editPath === undefined ? undefined : await readFile(editPath, "utf8")
		if (MODULE_EXT.has(ext)) {
			defs = await loadModule(specPath, original === undefined ? undefined : Bpmn.parse(original))
		} else if (original !== undefined) {
			throw new Error("--edit takes a module spec (.mjs/.ts) exporting (kit, model) => …")
		} else if (ext === ".json") {
			defs = expand(JSON.parse(await readFile(specPath, "utf8")) as CompactDiagram, {
				validate: false,
			})
		} else {
			const built = compileTextSpec(await readFile(specPath, "utf8"))
			if (ctx.flags.verbose === true) for (const f of built.fixes) ctx.output.info(f)
			if (built.problems.length > 0) {
				for (const p of built.problems) process.stdout.write(`✖ ${basename(specPath)} ${p}\n`)
				throw new Error(`${built.problems.length} problem(s) in the spec; nothing written`)
			}
			defs = built.definitions
			fields = built.fields
		}

		const existingForms = await formsIn(outDir)
		const { forms } =
			ctx.flags.forms === false
				? { forms: [] }
				: attachUserTaskForms(defs, { fields, existing: new Set(existingForms.keys()) })

		let xml: string
		let unplaced: { id: string; reason: string }[] = []
		try {
			if (original !== undefined) {
				// Room first: placeNewShapes never moves a shape, so an insertion would land on the next one.
				const placed = placeNewShapes(makeRoom(defs).definitions)
				unplaced = placed.unplaced
				// Gate the model before writing over the user's file.
				Bpmn.export(placed.definitions)
				xml = exportPreserving(original, placed.definitions)
			} else {
				dropThrowOnlyMessages(defs)
				if (defs.diagrams.length === 0) defs = applyAutoLayout(defs)
				xml = Bpmn.export(defs)
			}
		} catch (err) {
			if (err instanceof DeployabilityError) {
				process.stdout.write(`${err.message}\n`)
				throw new Error("Not deployable; nothing written")
			}
			throw err
		}

		await writeFile(out, xml, "utf8")
		for (const form of forms) {
			const path = join(outDir, `${form.id}.form`)
			await writeFile(path, Form.export(form), "utf8")
			existingForms.set(form.id, path)
		}
		const formFiles = [...linkedFormIds(defs)]
			.map((id) => existingForms.get(id))
			.filter((p): p is string => p !== undefined)
		const files = [out, ...formFiles, ...extra.filter((f) => !formFiles.includes(f))]
		for (const u of unplaced) process.stdout.write(`⚠ ${u.id}: ${u.reason}\n`)

		const parts = [
			`${basename(out)}${forms.length > 0 ? ` + ${forms.length} form${forms.length === 1 ? "" : "s"} (${forms.map((f) => `${f.id}.form`).join(", ")})` : ""}`,
		]
		if (ctx.flags.lint !== false) {
			const rows = await lintBuilt(files)
			for (const r of rows) process.stdout.write(`${findingLine(r)}\n`)
			const errors = rows.filter((r) => r.severity === "error").length
			if (errors > 0)
				throw new Error(`Lint: ${errors} error${errors === 1 ? "" : "s"} (file written)`)
			parts.push(rows.length === 0 ? "lint clean" : `${rows.length} warning(s)`)
		}
		if (ctx.flags.deploy === true) {
			const resources = await Promise.all(
				files.map(async (f) => ({ name: basename(f), content: await readFile(f, "utf8") })),
			)
			const target = typeof ctx.flags.target === "string" ? ctx.flags.target : "auto"
			const deployed = await deployResources(resources, target)
			const key = (deployed.result as { deploymentKey?: unknown } | undefined)?.deploymentKey
			parts.push(
				`deployed ${resources.length} to ${deployed.target}${key ? ` (key ${String(key)})` : ""}`,
			)
		}
		ctx.output.ok(parts.join(" · "))
	},
}

export const buildGroup: CommandGroup = {
	name: "build",
	description: "Build a .bpmn (+ forms) from a short spec, lint and deploy it — casen build <spec>",
	commands: [buildCmd],
}
