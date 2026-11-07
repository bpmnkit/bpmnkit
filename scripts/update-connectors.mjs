#!/usr/bin/env node
// Source: https://marketplace.cloud.camunda.io/api/v1/ootb-connectors
// Run: pnpm update-connectors                       — fetch the registry and update the spec
//      pnpm update-connectors --from-file <a.json>  — update it from a saved array of templates
//
// Writes spec/templates/connectors.json (+ catalog-meta.json), then runs spec-gen, which splits each
// template into the core and panel TS files (see scripts/spec-gen/connector-templates.mjs).
import { spawnSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { REGISTRY_URL, source } from "./spec-gen/connector-templates.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SPEC_FILE = join(ROOT, source)
const META_FILE = join(ROOT, "packages/connectors/src/templates/catalog-meta.json")

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

function writeSpec(templates) {
	writeFileSync(SPEC_FILE, `${JSON.stringify(templates, null, 2)}\n`, "utf8")
	const r = spawnSync(process.execPath, [join(ROOT, "scripts/spec-gen.mjs")], { stdio: "inherit" })
	if (r.status !== 0) process.exit(r.status ?? 1)
	console.log(`Wrote ${templates.length} templates → ${SPEC_FILE}`)
}

const fromFile = process.argv.indexOf("--from-file")
if (fromFile >= 0) {
	writeSpec(JSON.parse(readFileSync(process.argv[fromFile + 1], "utf8")))
} else {
	const templates = await fetchTemplates()
	const committed = JSON.parse(readFileSync(SPEC_FILE, "utf8"))
	// Unchanged upstream writes nothing, so the freshness stamp does not make a weekly diff of its own
	if (JSON.stringify(canonical(templates)) === JSON.stringify(canonical(committed))) {
		console.log(`Registry unchanged (${templates.length} templates); nothing written.`)
		process.exit(0)
	}
	writeSpec(templates)
	const meta = {
		fetchedAt: new Date().toISOString(),
		count: templates.length,
		source: REGISTRY_URL,
	}
	writeFileSync(META_FILE, `${JSON.stringify(meta, null, "\t")}\n`, "utf8")
	console.log(`Wrote catalog freshness metadata → ${META_FILE}`)
}
