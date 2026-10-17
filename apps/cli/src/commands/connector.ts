import { readFile, stat, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { API_SERVICES, loadApiServices } from "@bpmnkit/connector-gen/api-index"
import {
	apiServicesIn,
	applyTemplates,
	findApiOperations,
	findConnectorCards,
	formatApiCard,
	formatConnectorCard,
	getTemplate,
	listConnectors,
	propertyKey,
	readTemplateDocument,
	registerElementTemplates,
	searchConnectors,
} from "@bpmnkit/connectors"
import type { TemplateCondition, TemplateProblem, TemplateProperty } from "@bpmnkit/connectors"
import { collectElementTemplates, discoverElementTemplates } from "@bpmnkit/connectors/node"
import { Bpmn } from "@bpmnkit/core"
import { flagAll } from "../args.js"
import type { Command, CommandGroup, RunContext } from "../types.js"

/** Shared by every command that can be pointed at a project other than the cwd. */
const WORKSPACE_FLAG = {
	name: "workspace",
	description: "Project root to search for .camunda/element-templates (default: current directory)",
	type: "string",
} as const

const CONFIG_FOLDER_FLAG = {
	name: "config-folder",
	description: "Config folder name searched at each level (default: .camunda)",
	type: "string",
} as const

function discoveryOptions(ctx: RunContext): { from: string; root: string; configFolder?: string } {
	const root =
		typeof ctx.flags.workspace === "string" && ctx.flags.workspace !== ""
			? resolve(ctx.flags.workspace)
			: process.cwd()
	const configFolder =
		typeof ctx.flags["config-folder"] === "string" && ctx.flags["config-folder"] !== ""
			? ctx.flags["config-folder"]
			: undefined
	return configFolder === undefined
		? { from: process.cwd(), root }
		: { from: process.cwd(), root, configFolder }
}

/**
 * Pulls the project's own templates into the catalogue before a command reads
 * it, so `list`, `search` and `show` see what the editor would.
 *
 * Problems are surfaced rather than swallowed — a template that silently failed
 * to load is exactly the confusion this convention exists to avoid — but they
 * never stop the command: the bundled catalogue is still worth showing.
 */
async function includeWorkspaceTemplates(ctx: RunContext): Promise<void> {
	const { templates, problems } = await discoverElementTemplates(discoveryOptions(ctx))
	registerElementTemplates(templates)
	if (problems.length > 0) {
		// Count files, not problems: one broken template usually yields several,
		// and "3 problems" reads as three unusable templates.
		const files = new Set(problems.map((p) => p.file)).size
		ctx.output.info(
			`${files} workspace template file${files === 1 ? "" : "s"} could not be loaded — run 'casen connector validate' for details`,
		)
	}
}

const searchCmd: Command = {
	name: "search",
	description:
		"Search the bundled Camunda 8 out-of-the-box connector catalog (Slack, HTTP, AWS, AI Agent, …)",
	args: [
		{ name: "query", description: 'Search terms, e.g. "slack" or "send email"', required: true },
	],
	flags: [WORKSPACE_FLAG, CONFIG_FOLDER_FLAG],
	examples: [{ description: "Find the Slack connector", command: "casen connector search slack" }],
	async run(ctx) {
		await includeWorkspaceTemplates(ctx)
		const query = ctx.positional.join(" ")
		const results = searchConnectors(query)
		if (results.length === 0) {
			ctx.output.info(`No connectors matched "${query}". Try 'casen connector list' to browse all.`)
			return
		}
		ctx.output.printList({ items: results }, [
			{ key: "id", header: "TEMPLATE ID", maxWidth: 48 },
			{ key: "direction", header: "DIRECTION", maxWidth: 18 },
			{ key: "taskType", header: "TASK TYPE", maxWidth: 32 },
			{ key: "description", header: "DESCRIPTION", maxWidth: 50 },
		])
	},
}

const listCatalogCmd: Command = {
	name: "list",
	description:
		"List every connector template — the bundled Camunda 8 catalog plus the project's own",
	flags: [WORKSPACE_FLAG, CONFIG_FOLDER_FLAG],
	async run(ctx) {
		await includeWorkspaceTemplates(ctx)
		ctx.output.printList({ items: listConnectors() }, [
			{ key: "id", header: "TEMPLATE ID", maxWidth: 48 },
			{ key: "direction", header: "DIRECTION", maxWidth: 18 },
			{ key: "taskType", header: "TASK TYPE", maxWidth: 32 },
		])
	},
}

/** `method=GET`, `method in GET|POST`, `x set`, `x empty` — the condition as a reader would say it. */
function describeCondition(condition: TemplateCondition): string {
	if ("allMatch" in condition) {
		return condition.allMatch.map((c) => describeCondition(c as TemplateCondition)).join(" and ")
	}
	if ("equals" in condition) return `${condition.property}=${condition.equals}`
	if ("oneOf" in condition) return `${condition.property} in ${condition.oneOf.join("|")}`
	if ("isActive" in condition)
		return `${condition.property} ${condition.isActive ? "set" : "unset"}`
	return `${condition.property} ${condition.isEmpty ? "empty" : "not empty"}`
}

/** A default on one line: a multi-line value shows its newlines as \\n and is cut short. */
function defaultText(value: TemplateProperty["value"]): string {
	if (value === undefined || value === "") return "-"
	const flat = String(value).replace(/\n/g, "\\n")
	return flat.length > 40 ? `${flat.slice(0, 37)}...` : flat
}

function condensedLine(prop: TemplateProperty): string {
	const parts = [propertyKey(prop), prop.type, defaultText(prop.value)]
	if (prop.constraints?.notEmpty === true) parts.push("required")
	if (prop.condition) parts.push(`when ${describeCondition(prop.condition)}`)
	return parts.join("  ")
}

const showCmd: Command = {
	name: "show",
	description: "Show a connector template's required/optional input keys",
	args: [
		{
			name: "templateId",
			description: "Template id, e.g. io.camunda.connectors.Slack.v1",
			required: true,
		},
	],
	flags: [WORKSPACE_FLAG, CONFIG_FOLDER_FLAG],
	examples: [
		{
			description: "Show the Slack connector's inputs",
			command: "casen connector show io.camunda.connectors.Slack.v1",
		},
	],
	async run(ctx) {
		await includeWorkspaceTemplates(ctx)
		const templateId = ctx.positional[0]
		if (!templateId) throw new Error("Missing required argument: <templateId>")

		const summary =
			searchConnectors(templateId).find((s) => s.id === templateId) ??
			listConnectors().find((s) => s.id === templateId)
		if (!summary || !getTemplate(templateId)) {
			throw new Error(
				`Unknown connector template "${templateId}". Use 'casen connector search <query>' to find one.`,
			)
		}

		const filter =
			ctx.flags.filter === undefined ? undefined : String(ctx.flags.filter).toLowerCase()
		const matches = (i: { key: string; label: string }): boolean =>
			filter === undefined ||
			i.key.toLowerCase().includes(filter) ||
			i.label.toLowerCase().includes(filter)

		if (ctx.flags.condensed === true) {
			const template = getTemplate(templateId)
			const lines = (template?.properties ?? [])
				.filter((p) => p.type !== "Hidden")
				.filter((p) => matches({ key: propertyKey(p), label: p.label ?? propertyKey(p) }))
				.map(condensedLine)
			if (lines.length === 0) {
				ctx.output.info(`No properties of ${summary.id} match "${String(ctx.flags.filter ?? "")}"`)
				return
			}
			for (const line of lines) ctx.output.info(line)
			return
		}

		const required = summary.requiredInputs.filter(matches)
		const optional = summary.optionalInputs.filter(matches)

		ctx.output.info(`${summary.name}  (${summary.id})`)
		if (summary.taskType) ctx.output.info(`Task type: ${summary.taskType}`)
		ctx.output.info(`Direction: ${summary.direction}`)
		if (summary.description) ctx.output.info(summary.description)

		if (required.length > 0) {
			ctx.output.info("\nRequired inputs:")
			for (const i of required) {
				ctx.output.info(`  ${i.key}${i.isSecret ? " (secret)" : ""} — ${i.label}`)
			}
		}
		if (optional.length > 0) {
			ctx.output.info("\nOptional inputs:")
			for (const i of optional) {
				ctx.output.info(`  ${i.key}${i.isSecret ? " (secret)" : ""} — ${i.label}`)
			}
		}
	},
}

/** `key=value` pairs from repeated `--set`; a value starting with `=` is FEEL, kept as written. */
function parseSetFlags(ctx: RunContext): Record<string, string> {
	const values: Record<string, string> = {}
	for (const pair of flagAll(ctx.flags, ctx.repeated, "set")) {
		const eq = pair.indexOf("=")
		if (eq < 1) throw new Error(`--set expects key=value, not "${pair}"`)
		values[pair.slice(0, eq)] = pair.slice(eq + 1)
	}
	return values
}

async function readValuesFile(path: string): Promise<Record<string, string | number | boolean>> {
	let parsed: unknown
	try {
		parsed = JSON.parse(await readFile(resolve(path), "utf-8"))
	} catch (err) {
		throw new Error(
			`--values ${path} is not readable JSON: ${err instanceof Error ? err.message : String(err)}`,
		)
	}
	if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
		throw new Error(`--values ${path} must hold a JSON object of key to value`)
	}
	for (const [key, value] of Object.entries(parsed)) {
		if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
			throw new Error(`--values ${path}: "${key}" must be a string, number or boolean`)
		}
	}
	return parsed as Record<string, string | number | boolean>
}

const applyCmd: Command = {
	name: "apply",
	description:
		"Apply a connector template to an element of a .bpmn file, in place — the keys are the ones 'connector show --condensed' lists",
	args: [
		{ name: "file", description: "The .bpmn file to change", required: true },
		{ name: "elementId", description: "Id of the task or event to apply it to", required: true },
		{
			name: "template",
			description: "Template id, id@version, or alias such as http",
			required: true,
		},
	],
	flags: [
		WORKSPACE_FLAG,
		CONFIG_FOLDER_FLAG,
		{
			name: "values",
			description:
				"JSON file holding an object of key to string|number|boolean. Prefer it for multi-line or quoted FEEL",
			type: "string",
		},
		{
			name: "set",
			description:
				"key=value, repeatable; a value starting with = is FEEL as written. Overrides the same key in --values. Omitted properties keep the template default",
			type: "string",
		},
		{
			name: "dry-run",
			description: "Check the values and report problems without writing the file",
			type: "boolean",
		},
	],
	examples: [
		{
			description: "Apply the REST connector with values from a file",
			command: "casen connector apply order.bpmn Call http --values call.json",
		},
		{
			description: "Set single keys inline",
			command: "casen connector apply order.bpmn Call http --set method=GET --set retryCount=5",
		},
	],
	async run(ctx) {
		const [file, elementId, template] = ctx.positional
		if (!file || !elementId || !template) {
			throw new Error("Usage: casen connector apply <file.bpmn> <elementId> <template>")
		}
		await includeWorkspaceTemplates(ctx)

		const fromFile =
			typeof ctx.flags.values === "string" ? await readValuesFile(ctx.flags.values) : {}
		const values = { ...fromFile, ...parseSetFlags(ctx) }

		const path = resolve(file)
		const definitions = Bpmn.parse(await readFile(path, "utf-8"))
		const result = applyTemplates(definitions, [{ elementId, template, values }])

		if (result.problems.length > 0) {
			// Nothing is written: a half-applied element is harder to spot than a refusal.
			const lines = result.problems.map((p) => `  ${p.elementId}: ${p.message}`)
			throw new Error(
				`${result.problems.length} problem${result.problems.length === 1 ? "" : "s"} applying ${template} — ${file} not changed\n${lines.join("\n")}`,
			)
		}
		if (ctx.flags["dry-run"] === true) {
			ctx.output.ok(`Dry run: ${template} would apply to ${elementId} in ${file}`)
			return
		}
		await writeFile(path, Bpmn.export(result.definitions), "utf-8")
		ctx.output.ok(`Applied ${template} to ${elementId} in ${file}`)
	},
}

const cardsCmd: Command = {
	name: "cards",
	description:
		"Show connector cards — one operation each, with only the inputs it needs — for a request",
	args: [
		{
			name: "query",
			description: 'What the step should do, e.g. "post a message to slack"',
			required: true,
		},
	],
	flags: [
		WORKSPACE_FLAG,
		CONFIG_FOLDER_FLAG,
		{ name: "limit", description: "How many cards to show (default: 5)", type: "string" },
		{
			name: "advanced",
			description: "Include retries, timeouts, TLS and other plumbing inputs",
			type: "boolean",
		},
	],
	examples: [
		{
			description: "Find how to post to Slack",
			command: 'casen connector cards "post a message to slack"',
		},
		{
			description: "As JSON, for a tool",
			command: 'casen connector cards "create github issue" -o json',
		},
	],
	async run(ctx) {
		await includeWorkspaceTemplates(ctx)
		const query = ctx.positional.join(" ")
		const limit = Number.parseInt(String(ctx.flags.limit ?? "5"), 10)
		if (!Number.isInteger(limit) || limit < 1) {
			throw new Error(`--limit must be a positive whole number, not "${String(ctx.flags.limit)}"`)
		}
		const cards = findConnectorCards(query, { limit })
		if (cards.length === 0) {
			ctx.output.info(`No connector matched "${query}". Try 'casen connector list' to browse all.`)
			return
		}
		if (ctx.output.format === "json") {
			ctx.output.print(cards)
			return
		}
		ctx.output.info("A * marks a required input. Pass the card's values with yours.\n")
		for (const card of cards) {
			ctx.output.info(formatConnectorCard(card, { advanced: ctx.flags.advanced === true }))
			if (Object.keys(card.values).length > 0) {
				ctx.output.info(`  values: ${JSON.stringify(card.values)}\n`)
			}
		}
	},
}

const apiCmd: Command = {
	name: "api",
	description:
		"Show real endpoints of an HTTP API — base URL, auth, path, parameters — from the offline API index, for the REST connector",
	args: [
		{
			name: "query",
			description: 'What the step should do, naming the service, e.g. "create a stripe customer"',
			required: true,
		},
	],
	flags: [
		{
			name: "service",
			description: "Service id to search when the query does not name one, e.g. notion",
			type: "string",
		},
		{ name: "limit", description: "Operations per service (default: 5)", type: "string" },
	],
	examples: [
		{
			description: "Find the endpoint that creates a Stripe customer",
			command: 'casen connector api "create a stripe customer"',
		},
		{
			description: "As JSON, for a tool",
			command: 'casen connector api "create page" --service notion -o json',
		},
	],
	async run(ctx) {
		const query = ctx.positional.join(" ")
		const limit = Number.parseInt(String(ctx.flags.limit ?? "5"), 10)
		if (!Number.isInteger(limit) || limit < 1) {
			throw new Error(`--limit must be a positive whole number, not "${String(ctx.flags.limit)}"`)
		}
		const wanted =
			typeof ctx.flags.service === "string" ? ctx.flags.service.toLowerCase() : undefined
		if (wanted !== undefined && !API_SERVICES.some((s) => s.id === wanted)) {
			throw new Error(
				`No API "${wanted}" is in the index. Indexed: ${API_SERVICES.map((s) => s.id).join(", ")}`,
			)
		}
		const services = await loadApiServices(
			wanted !== undefined ? [wanted] : apiServicesIn(query, API_SERVICES).slice(0, 3),
		)
		if (services.length === 0) {
			ctx.output.info(
				`"${query}" names no indexed API. Name one, or pass --service. Indexed: ${API_SERVICES.map((s) => s.id).join(", ")}`,
			)
			return
		}
		const cards = services.map((service) => ({
			service,
			operations: findApiOperations(service, query, { limit }),
		}))
		if (ctx.output.format === "json") {
			ctx.output.print(
				cards.map(({ service: { operations: _all, ...service }, operations }) => ({
					service,
					operations,
				})),
			)
			return
		}
		ctx.output.info(
			"For the REST connector: with <id>: http <METHOD> <path> | api=<service> — base URL, auth and {path} parameters are added.\n",
		)
		for (const card of cards) {
			ctx.output.info(`${formatApiCard(card)}\n`)
			if (card.operations.length === 0) {
				ctx.output.info("  No operation matched; describe the step in other words.\n")
			}
		}
	},
}

/**
 * The argument as a template file, or `undefined` when it names a project.
 *
 * A `.json` path that does not exist falls through to the directory branch,
 * where discovery reports it rather than this branch throwing on a read.
 */
async function resolveJsonFile(target: string | undefined): Promise<string | undefined> {
	if (target === undefined || !target.toLowerCase().endsWith(".json")) return undefined
	const path = resolve(target)
	const isFile = await stat(path)
		.then((s) => s.isFile())
		.catch(() => false)
	return isFile ? path : undefined
}

/** One file's findings, in the shape `--format json` emits. */
interface FileReport {
	file: string
	templates: string[]
	problems: Array<TemplateProblem & { id?: string; index?: number }>
	warnings: Array<TemplateProblem & { id?: string; index?: number }>
}

function describe(entry: TemplateProblem & { id?: string; index?: number }): string {
	const where = entry.path === "" ? "" : ` ${entry.path}`
	const which = entry.id === undefined ? "" : ` [${entry.id}]`
	return `${which}${where}: ${entry.message}`.trim()
}

const validateCmd: Command = {
	name: "validate",
	description:
		"Validate element templates against the Camunda schema — a .json file, or every template a project holds",
	args: [
		{
			name: "path",
			description: "A template .json file, or a project directory (default: the current directory)",
		},
	],
	flags: [
		CONFIG_FOLDER_FLAG,
		{ name: "format", description: "Output format: text (default) or json", type: "string" },
	],
	examples: [
		{ description: "Validate this project's templates", command: "casen connector validate" },
		{
			description: "Validate one file",
			command: "casen connector validate .camunda/element-templates/my-connector.json",
		},
		{
			description: "Gate a pipeline",
			command: "casen connector validate --format json",
		},
	],
	async run(ctx) {
		const target = ctx.positional[0]
		const reports: FileReport[] = []
		const file = await resolveJsonFile(target)

		if (file !== undefined) {
			let parsed: unknown
			try {
				parsed = JSON.parse(await readFile(file, "utf-8"))
			} catch (err) {
				throw new Error(
					`${file} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
				)
			}
			const result = readTemplateDocument(parsed)
			reports.push({
				file,
				templates: result.templates.map((t) => t.id),
				problems: result.problems,
				warnings: result.warnings,
			})
		} else {
			// A directory (or nothing) means "this whole project". The downward scan,
			// not the upward one an editor uses: a CI check that only looked at the
			// root would pass a project whose broken template sits beside a
			// sub-folder's diagrams.
			const root = target === undefined ? process.cwd() : resolve(target)
			const configFolder =
				typeof ctx.flags["config-folder"] === "string" && ctx.flags["config-folder"] !== ""
					? ctx.flags["config-folder"]
					: undefined
			const { templates, problems, warnings, directories } = await collectElementTemplates(
				configFolder === undefined ? { root } : { root, configFolder },
			)

			if (directories.length === 0) {
				ctx.output.info(
					`No element-template folders found under ${root}. Templates live in <configFolder>/element-templates/.`,
				)
				return
			}

			const byFile = new Map<string, FileReport>()
			const report = (file: string): FileReport => {
				const existing = byFile.get(file)
				if (existing) return existing
				const created: FileReport = { file, templates: [], problems: [], warnings: [] }
				byFile.set(file, created)
				return created
			}
			for (const { file, ...rest } of problems) report(file).problems.push(rest)
			for (const { file, ...rest } of warnings) report(file).warnings.push(rest)

			// The valid templates carry no file of their own, so they are counted
			// against the run: the per-file entries exist to hold findings.
			const summary: FileReport = {
				file: root,
				templates: templates.map((t) => t.id),
				problems: [],
				warnings: [],
			}
			reports.push(summary, ...byFile.values())
		}

		const problemCount = reports.reduce((n, r) => n + r.problems.length, 0)
		const warningCount = reports.reduce((n, r) => n + r.warnings.length, 0)
		const templateCount = reports.reduce((n, r) => n + r.templates.length, 0)

		if (ctx.flags.format === "json") {
			ctx.output.print({ reports, problemCount, warningCount, templateCount })
			if (problemCount > 0) throw new Error(`${problemCount} template problem(s)`)
			return
		}

		const lines: string[] = []
		for (const r of reports) {
			if (r.problems.length === 0 && r.warnings.length === 0) continue
			lines.push(r.file)
			for (const problem of r.problems) lines.push(`  ✖${describe(problem)}`)
			for (const warning of r.warnings) lines.push(`  ⚠${describe(warning)}`)
		}
		if (lines.length > 0) ctx.output.print(lines.join("\n"))

		if (problemCount === 0) {
			ctx.output.ok(
				`${templateCount} template${templateCount === 1 ? "" : "s"} valid${warningCount > 0 ? `, ${warningCount} warning${warningCount === 1 ? "" : "s"}` : ""}.`,
			)
			return
		}
		throw new Error(
			`${problemCount} problem${problemCount === 1 ? "" : "s"} across ${reports.filter((r) => r.problems.length > 0).length} file(s)`,
		)
	},
}

export const connectorGroup: CommandGroup = {
	name: "connector",
	description:
		"Connector element templates — generate from OpenAPI, browse the catalog, validate a project's own",
	commands: [
		{
			name: "generate",
			description: "Generate connector templates from a local OpenAPI spec or catalog entry",
			flags: [
				{
					name: "swagger",
					short: "s",
					description: "Path to a local OpenAPI/Swagger file (YAML or JSON)",
					type: "string",
				},
				{
					name: "api",
					description: "Catalog API id (e.g. github, stripe). Use 'connector catalog' to list.",
					type: "string",
				},
				{
					name: "output",
					short: "o",
					description: "Output directory (default: ./connector-templates)",
					type: "string",
				},
				{ name: "base-url", description: "Override the base URL from the spec", type: "string" },
				{
					name: "id-prefix",
					description: "Reverse-DNS id prefix (default: io.generated)",
					type: "string",
				},
				{
					name: "filter",
					description: "Regex filter on operationId/summary (case-insensitive)",
					type: "string",
				},
				{
					name: "expand-body",
					description: "Decompose top-level request body properties into individual fields",
					type: "boolean",
					default: false,
				},
				{
					name: "auth",
					description:
						"Default auth type: noAuth, apiKey, basic, bearer, oauth-client-credentials-flow",
					type: "string",
				},
				{
					name: "format",
					description: "Output format: one-per-op (default) or array (single file)",
					type: "string",
				},
				{
					name: "dry-run",
					description: "Print templates to stdout without writing files",
					type: "boolean",
					default: false,
				},
			],
			examples: [
				{
					description: "Generate from a local file",
					command: "casen connector generate --swagger ./petstore.yaml --output ./out",
				},
				{
					description: "Generate from the GitHub catalog entry",
					command: "casen connector generate --api github --output ./out --filter issues",
				},
				{
					description: "Dry run (print to stdout)",
					command: "casen connector generate --swagger ./spec.yaml --dry-run",
				},
			],
			async run(ctx) {
				// Lazy import so the CLI doesn't load yaml on startup
				const { generate, generateFromUrl, CATALOG, getCatalogEntry } = await import(
					"@bpmnkit/connector-gen"
				)

				const swaggerPath = ctx.flags.swagger as string | undefined
				const apiId = ctx.flags.api as string | undefined
				const outputDir = (ctx.flags.output as string | undefined) ?? "./connector-templates"
				const baseUrl = ctx.flags["base-url"] as string | undefined
				const idPrefix = (ctx.flags["id-prefix"] as string | undefined) ?? "io.generated"
				const filter = ctx.flags.filter as string | undefined
				const expandBody = ctx.flags["expand-body"] === true
				const authFlag = ctx.flags.auth as string | undefined
				const format = (ctx.flags.format as "one-per-op" | "array" | undefined) ?? "one-per-op"
				const dryRun = ctx.flags["dry-run"] === true

				const validAuth = [
					"noAuth",
					"apiKey",
					"basic",
					"bearer",
					"oauth-client-credentials-flow",
				] as const
				type AuthHint = (typeof validAuth)[number]
				if (authFlag && !validAuth.includes(authFlag as AuthHint)) {
					throw new Error(`Unknown --auth value "${authFlag}". Valid: ${validAuth.join(", ")}`)
				}
				const defaultAuthType = authFlag as AuthHint | undefined

				if (!swaggerPath && !apiId) {
					throw new Error(
						"Provide either --swagger <file> or --api <id>. Use 'casen connector catalog' to list catalog entries.",
					)
				}
				if (swaggerPath && apiId) {
					throw new Error("Use either --swagger or --api, not both.")
				}

				const opts = { idPrefix, baseUrl, expandBody, filter, defaultAuthType }

				if (swaggerPath) {
					const absPath = resolve(swaggerPath)
					const text = await readFile(absPath, "utf8")
					const templates = generate(text, opts)

					if (dryRun) {
						ctx.output.print(templates)
						ctx.output.info(`Would generate ${templates.length} template(s)`)
						return
					}

					const { writeTemplates } = await import("@bpmnkit/connector-gen")
					const files = await writeTemplates(templates, { outputDir: resolve(outputDir), format })
					ctx.output.ok(`Generated ${files.length} template(s) → ${resolve(outputDir)}`)
					for (const f of files) ctx.output.info(`  ${f}`)
					return
				}

				// API catalog path
				if (!apiId) return
				const entry = getCatalogEntry(apiId)
				if (!entry) {
					const ids = CATALOG.map((e) => e.id).join(", ")
					throw new Error(`Unknown catalog entry "${apiId}". Available: ${ids}`)
				}

				ctx.output.info(`Downloading spec for "${entry.name}" …`)
				const { generateFromUrl: _gfu } = { generateFromUrl }
				const { templates, files } = await generateFromUrl(entry.url, {
					...opts,
					idPrefix: opts.idPrefix === "io.generated" ? entry.idPrefix : opts.idPrefix,
					defaultAuthType: opts.defaultAuthType ?? entry.defaultAuth,
					...(dryRun ? {} : { outputDir: resolve(outputDir), format }),
				})

				if (dryRun) {
					ctx.output.print(templates)
					ctx.output.info(`Would generate ${templates.length} template(s)`)
					return
				}

				ctx.output.ok(`Generated ${files.length} template(s) → ${resolve(outputDir)}`)
				for (const f of files) ctx.output.info(`  ${f}`)
			},
		},
		{
			name: "catalog",
			description: "List available API catalog entries",
			examples: [{ description: "Show all catalog entries", command: "casen connector catalog" }],
			async run(ctx) {
				const { CATALOG } = await import("@bpmnkit/connector-gen")
				ctx.output.printList(
					{
						items: CATALOG.map((e) => ({
							id: e.id,
							name: e.name,
							auth: e.defaultAuth,
							description: e.description,
						})),
					},
					[
						{ key: "id", header: "ID", maxWidth: 16 },
						{ key: "name", header: "NAME", maxWidth: 30 },
						{ key: "auth", header: "AUTH", maxWidth: 32 },
						{ key: "description", header: "DESCRIPTION", maxWidth: 60 },
					],
				)
			},
		},
		searchCmd,
		listCatalogCmd,
		showCmd,
		applyCmd,
		cardsCmd,
		apiCmd,
		validateCmd,
	],
}
