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
import {
	BUILD_SPEC_GUIDE,
	compileTextSpec,
	dropThrowOnlyMessages,
	splitMixedGateways,
} from "./build-spec.js"
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
	const hint = key === undefined ? undefined : HINTS[key]
	return `${symbol} ${basename(r.file)} ${at}${r.message}${hint ? `; ${hint}` : ""} [${rule}]`
}

/**
 * The rules `bpmnlint:recommended` (what c8ctl and Modeler lint extend) sets to
 * "error": the kit reports some of them as warnings, but c8ctl fails on them.
 */
const RECOMMENDED_ERRORS = new Set([
	"ad-hoc-sub-process",
	"conditional-flows",
	"end-event-required",
	"event-based-gateway",
	"event-sub-process-typed-start-event",
	"label-required",
	"link-event",
	"no-bpmndi",
	"no-complex-gateway",
	"no-disconnected",
	"no-duplicate-sequence-flows",
	"no-gateway-join-fork",
	"no-implicit-split",
	"no-implicit-end",
	"no-implicit-start",
	"single-blank-start-event",
	"single-event-definition",
	"start-event-required",
	"sub-process-blank-start-event",
])

/** Extra words for a finding whose fix is not in its message. */
const HINTS: Record<string, string> = {
	"no-gateway-join-fork":
		"put a merge gateway in front: connect the incoming paths to an exclusiveGateway that leads to it",
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
	for (const w of warnings)
		if (RECOMMENDED_ERRORS.has(bpmnlintrcKey(w.rule) ?? "")) w.severity = "error"
	return [...errors, ...warnings]
}

function elementIds(defs: BpmnDefinitions): Set<string> {
	const ids = new Set<string>()
	const visit = (elements: readonly core.BpmnFlowElement[]) => {
		for (const el of elements) {
			ids.add(el.id)
			if ("flowElements" in el && Array.isArray(el.flowElements)) visit(el.flowElements)
		}
	}
	for (const p of defs.processes) visit(p.flowElements)
	return ids
}

/** `8.10` → `modeler:executionPlatformVersion="8.10.0"`, Camunda Cloud; other attributes kept. */
function setPlatformVersion(defs: BpmnDefinitions, camunda: string): void {
	if (!/^\d+\.\d+(?:\.\d+)?$/.test(camunda))
		throw new Error(`--camunda takes a version like 8.10, not "${camunda}"`)
	const version = /^\d+\.\d+$/.test(camunda) ? `${camunda}.0` : camunda
	defs.unknownAttributes["modeler:executionPlatform"] = "Camunda Cloud"
	defs.unknownAttributes["modeler:executionPlatformVersion"] = version
	defs.namespaces.modeler ??= "http://camunda.org/schema/modeler/1.0"
}

/**
 * An insertion rewires an existing flow (`a > b` becomes `a > new`); its old
 * route still runs to `b` and would block the spot the new node belongs in.
 * Drops those routes so placeNewShapes draws them again.
 */
function dropRewiredEdges(defs: BpmnDefinitions, before: BpmnDefinitions): void {
	const ends = new Map<string, string>()
	const visit = (flows: readonly core.BpmnSequenceFlow[], into: Map<string, string>) => {
		for (const f of flows) into.set(f.id, `${f.sourceRef}>${f.targetRef}`)
	}
	const all = (d: BpmnDefinitions, into: Map<string, string>) => {
		for (const p of d.processes) {
			visit(p.sequenceFlows, into)
			const inner = (elements: readonly core.BpmnFlowElement[]) => {
				for (const el of elements)
					if ("sequenceFlows" in el && Array.isArray(el.sequenceFlows)) {
						visit(el.sequenceFlows, into)
						inner(el.flowElements)
					}
			}
			inner(p.flowElements)
		}
	}
	all(before, ends)
	const now = new Map<string, string>()
	all(defs, now)
	const rewired = new Set(
		[...now].filter(([id, e]) => ends.has(id) && ends.get(id) !== e).map(([id]) => id),
	)
	if (rewired.size === 0) return
	for (const d of defs.diagrams)
		d.plane.edges = d.plane.edges.filter((e) => !rewired.has(e.bpmnElement))
}

/** Writes `defs`' platform attributes into the `<definitions>` start tag of `xml`. */
function withPlatformVersion(xml: string, defs: BpmnDefinitions): string {
	return xml.replace(/<([\w]+:)?definitions\b[^>]*>/, (tag) => {
		let out = tag
		const set = (name: string, value: string | undefined) => {
			if (value === undefined) return
			const attr = new RegExp(`\\s${name}="[^"]*"`)
			out = attr.test(out)
				? out.replace(attr, ` ${name}="${value}"`)
				: out.replace(/\s*(\/?)>$/, ` ${name}="${value}"$1>`)
		}
		set("xmlns:modeler", defs.namespaces.modeler)
		set("modeler:executionPlatform", defs.unknownAttributes["modeler:executionPlatform"])
		set(
			"modeler:executionPlatformVersion",
			defs.unknownAttributes["modeler:executionPlatformVersion"],
		)
		return out
	})
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
			name: "camunda",
			description:
				"Target Camunda version, e.g. 8.10: sets the file's executionPlatformVersion (over a text spec's \"camunda=\")",
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
		{
			description: "Edit and move the file to Camunda 8.10",
			command: "casen build edit.mjs --edit order.bpmn --camunda 8.10",
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
				throw new Error(
					`${built.problems.length} problem(s) in the spec; nothing written. Fix the lines above and run again`,
				)
			}
			defs = built.definitions
			fields = built.fields
		}

		if (MODULE_EXT.has(ext) && original === undefined && splitMixedGateways(defs).length > 0)
			// A merge gateway was added: lay the new file out again.
			defs.diagrams = []
		const camunda =
			ctx.flags.camunda === undefined || ctx.flags.camunda === true
				? undefined
				: String(ctx.flags.camunda)
		if (camunda !== undefined) setPlatformVersion(defs, camunda)

		const existingForms = await formsIn(outDir)
		// An edit gives forms to the user tasks it adds; the ones already there stay as they are.
		const before = original === undefined ? undefined : Bpmn.parse(original)
		const skip = before === undefined ? undefined : elementIds(before)
		const { forms } =
			ctx.flags.forms === false
				? { forms: [] }
				: attachUserTaskForms(defs, { fields, existing: new Set(existingForms.keys()), skip })

		let xml: string
		let unplaced: { id: string; reason: string }[] = []
		try {
			if (original !== undefined) {
				if (before) dropRewiredEdges(defs, before)
				// Room first: placeNewShapes never moves a shape, so an insertion would land on the next one.
				const placed = placeNewShapes(makeRoom(defs).definitions)
				unplaced = placed.unplaced
				// Gate the model before writing over the user's file.
				Bpmn.export(placed.definitions)
				xml = exportPreserving(original, placed.definitions)
				// The preserving writer keeps the root tag as it was.
				if (camunda !== undefined) xml = withPlatformVersion(xml, defs)
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
			const rows = (await lintBuilt(files)).filter(
				// A form an existing task links was missing before the edit too; deploying it is not this edit's job.
				(r) => !(r.rule === "check/unresolved-form" && skip?.has(r.elementId ?? "")),
			)
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
