#!/usr/bin/env node
/**
 * Records the oracle of the Rust API-index generator (`bpmnkit-connectors::api_service`):
 * for every spec under crates/bpmnkit-connectors/tests/fixtures/specs/, the service
 * `scripts/build-api-index.mjs` would build, minus the license gate, in
 * tests/fixtures/api-index/<spec file name>.json. Specs that do not parse are skipped.
 *
 *   node scripts/record-api-index-fixtures.mjs
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join, parse } from "node:path"
import { fileURLToPath } from "node:url"
import { authOf, baseUrlOf, operationsOf, parseSpec } from "./api-index-ops.mjs"

const FIXTURES = join(
	dirname(fileURLToPath(import.meta.url)),
	"../crates/bpmnkit-connectors/tests/fixtures",
)
const OUT = join(FIXTURES, "api-index")
mkdirSync(OUT, { recursive: true })

for (const file of readdirSync(join(FIXTURES, "specs")).sort()) {
	let doc
	try {
		doc = parseSpec(readFileSync(join(FIXTURES, "specs", file), "utf8"))
	} catch {
		console.warn(`skip ${file}: does not parse`)
		continue
	}
	if (!doc || typeof doc !== "object") continue
	const id = parse(file).name
	const service = { id, name: doc.info?.title ?? id }
	const baseUrl = baseUrlOf(doc)
	if (baseUrl) service.baseUrl = baseUrl
	service.auth = authOf(doc, "noAuth")
	service.operations = operationsOf(doc)
	writeFileSync(join(OUT, `${file}.json`), `${JSON.stringify(service, null, 2)}\n`)
	console.log(`${file}: ${service.operations.length} operations`)
}
