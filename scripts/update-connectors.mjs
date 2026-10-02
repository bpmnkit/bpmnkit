#!/usr/bin/env node
// Source: https://marketplace.cloud.camunda.io/api/v1/ootb-connectors
// Run: pnpm update-connectors                       — fetch the registry and write both files
//      pnpm update-connectors --from-file <a.json>  — write them from a saved array of templates
//
// Each template is split in two, so no consumer ships the catalog twice:
// - @bpmnkit/core/connectors gets what binds, conditions, validates or describes a value;
// - @bpmnkit/connectors gets the rest, which only a property panel draws (icons, groups,
//   tooltips, placeholders), and puts the full template back together at load time.
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const REGISTRY_URL = "https://marketplace.cloud.camunda.io/api/v1/ootb-connectors"
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const CORE_FILE = join(ROOT, "packages/core/src/connectors/templates/generated.ts")
const PANEL_FILE = join(ROOT, "packages/connectors/src/templates/generated.ts")
const META_FILE = join(ROOT, "packages/connectors/src/templates/catalog-meta.json")

const CORE_START = "export const BUNDLED_CONNECTOR_TEMPLATES: readonly ElementTemplate[] = "
const CORE_END = " as unknown as ElementTemplate[];"
const PANEL_START = "export const TEMPLATE_PANEL_PARTS: Record<string, TemplatePanelParts> = "
const PANEL_END = ";"

/** Template-level keys only a panel uses. */
const PANEL_KEYS = ["$schema", "category", "groups", "icon", "metadata"]
/** Property-level keys only a panel uses. */
const PANEL_PROPERTY_KEYS = ["group", "placeholder", "tooltip"]

async function fetchTemplates() {
	const registry = await fetch(REGISTRY_URL).then((r) => r.json())
	const templates = []
	for (const [, versions] of Object.entries(registry)) {
		// The newest version only. The registry lists versions newest first, but the order is not
		// promised, so pick the highest number rather than a position.
		const latest = versions.reduce((a, b) => (b.version > a.version ? b : a), versions[0])
		if (!latest?.ref) continue
		const tpl = await fetch(latest.ref)
			.then((r) => r.json())
			.catch(() => null)
		if (!tpl) continue
		templates.push(tpl)
	}
	return templates
}

function pick(object, keys, wanted) {
	return Object.fromEntries(Object.entries(object).filter(([k]) => keys.includes(k) === wanted))
}

function split(template) {
	const core = {
		...pick(template, PANEL_KEYS, false),
		properties: template.properties.map((p) => pick(p, PANEL_PROPERTY_KEYS, false)),
	}
	const properties = template.properties.map((p) => pick(p, PANEL_PROPERTY_KEYS, true))
	const panel = {
		template: pick(template, PANEL_KEYS, true),
		// Positional, like the core template's properties; trailing empties are dropped
		properties: properties.slice(0, properties.findLastIndex((p) => Object.keys(p).length > 0) + 1),
	}
	return { core, panel }
}

function readArray(file, start, end) {
	const text = readFileSync(file, "utf8")
	return JSON.parse(text.slice(text.indexOf(start) + start.length, text.lastIndexOf(end)))
}

/** The templates as the committed files hold them, joined back together. */
function readCommitted() {
	const panel = readArray(PANEL_FILE, PANEL_START, PANEL_END)
	return readArray(CORE_FILE, CORE_START, CORE_END).map((core) => {
		const parts = panel[core.id] ?? { template: {}, properties: [] }
		return {
			...parts.template,
			...core,
			properties: core.properties.map((p, i) => ({ ...p, ...parts.properties[i] })),
		}
	})
}

/** Key order differs between a fetched template and a joined one; compare the content. */
function canonical(value) {
	if (Array.isArray(value)) return value.map(canonical)
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.keys(value)
				.sort()
				.map((k) => [k, canonical(value[k])]),
		)
	}
	return value
}

const HEADER = `// AUTO-GENERATED — DO NOT EDIT. Run \`pnpm update-connectors\` to regenerate.
// Source: ${REGISTRY_URL}`

function write(templates) {
	const parts = templates.map(split)
	const core = JSON.stringify(
		parts.map((p) => p.core),
		null,
		2,
	)
	writeFileSync(
		CORE_FILE,
		`${HEADER}
// Without icons, groups, tooltips and placeholders: @bpmnkit/connectors adds them back.
import type { ElementTemplate } from "../template-types.js";

${CORE_START}${core}${CORE_END}
`,
		"utf8",
	)
	const panel = JSON.stringify(
		Object.fromEntries(templates.map((t, i) => [t.id, parts[i].panel])),
		null,
		2,
	)
	writeFileSync(
		PANEL_FILE,
		`${HEADER}
// What @bpmnkit/core/connectors leaves out of each template, by template id.
import type { TemplatePanelParts } from "../panel-parts.js";

${PANEL_START}${panel}${PANEL_END}
`,
		"utf8",
	)
	console.log(`Wrote ${templates.length} templates → ${CORE_FILE} and ${PANEL_FILE}`)
}

const fromFile = process.argv.indexOf("--from-file")
if (fromFile >= 0) {
	write(JSON.parse(readFileSync(process.argv[fromFile + 1], "utf8")))
} else {
	const templates = await fetchTemplates()
	// Unchanged upstream writes nothing, so the freshness stamp does not make a weekly diff of its own
	if (JSON.stringify(canonical(templates)) === JSON.stringify(canonical(readCommitted()))) {
		console.log(`Registry unchanged (${templates.length} templates); nothing written.`)
		process.exit(0)
	}
	write(templates)
	const meta = {
		fetchedAt: new Date().toISOString(),
		count: templates.length,
		source: REGISTRY_URL,
	}
	writeFileSync(META_FILE, `${JSON.stringify(meta, null, "\t")}\n`, "utf8")
	console.log(`Wrote catalog freshness metadata → ${META_FILE}`)
}
