#!/usr/bin/env node
// Generates TS and Rust code from the data in spec/ (doc/rust-rewrite-proposal.md §4.3).
//
//   pnpm spec:gen           validate every spec file against its schema, then write the code
//   pnpm spec:gen --check   validate and fail if any generated file is stale; writes nothing
//
// Each area is a module in scripts/spec-gen/ exporting `source`, `schema` and
// `generate(spec) → { "<repo path>": "<content>" }`. Generated TS lives in Biome-ignored
// `src/generated/` folders, and generated Rust in `#[rustfmt::skip]` modules, so this
// script needs neither formatter.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

/** Area modules, in generation order. */
const AREAS = ["feel-builtins"]

const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"))

/**
 * Validates `value` against the subset of JSON Schema the spec schemas use:
 * type, enum, const, properties, required, additionalProperties, items,
 * minItems, uniqueItems, minLength, pattern, anyOf, propertyNames and local `$ref`.
 * Returns a list of "path: problem" strings, empty when valid.
 */
export function validate(value, schema, root = schema, path = "$") {
	if (schema.$ref) {
		const target = schema.$ref
			.replace(/^#\//, "")
			.split("/")
			.reduce((node, key) => node?.[key], root)
		if (!target) return [`${path}: unresolved $ref ${schema.$ref}`]
		return validate(value, target, root, path)
	}
	const errors = []
	const typeOf = (v) =>
		v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v
	if (schema.type) {
		const types = [schema.type].flat()
		const t = typeOf(value)
		if (!types.includes(t) && !(t === "integer" && types.includes("number"))) {
			return [`${path}: expected ${types.join(" | ")}, got ${t}`]
		}
	}
	if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))) {
		errors.push(`${path}: ${JSON.stringify(value)} is not one of ${JSON.stringify(schema.enum)}`)
	}
	if ("const" in schema && JSON.stringify(schema.const) !== JSON.stringify(value)) {
		errors.push(`${path}: expected ${JSON.stringify(schema.const)}`)
	}
	if (typeof value === "string") {
		if (schema.minLength !== undefined && value.length < schema.minLength)
			errors.push(`${path}: too short`)
		if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
			errors.push(`${path}: does not match ${schema.pattern}`)
		}
	}
	if (Array.isArray(value)) {
		if (schema.minItems !== undefined && value.length < schema.minItems)
			errors.push(`${path}: too few items`)
		if (schema.uniqueItems) {
			const seen = new Set(value.map((v) => JSON.stringify(v)))
			if (seen.size !== value.length) errors.push(`${path}: items are not unique`)
		}
		if (schema.items)
			value.forEach((v, i) => errors.push(...validate(v, schema.items, root, `${path}[${i}]`)))
	}
	if (value && typeof value === "object" && !Array.isArray(value)) {
		for (const key of schema.required ?? []) {
			if (!(key in value)) errors.push(`${path}: missing ${key}`)
		}
		for (const [key, v] of Object.entries(value)) {
			const sub = `${path}.${key}`
			if (schema.propertyNames)
				errors.push(...validate(key, schema.propertyNames, root, `${sub} (name)`))
			if (schema.properties?.[key]) errors.push(...validate(v, schema.properties[key], root, sub))
			else if (schema.additionalProperties === false)
				errors.push(`${path}: unexpected property ${key}`)
			else if (typeof schema.additionalProperties === "object") {
				errors.push(...validate(v, schema.additionalProperties, root, sub))
			}
		}
	}
	if (schema.anyOf && !schema.anyOf.some((s) => validate(value, s, root, path).length === 0)) {
		errors.push(`${path}: matches none of anyOf`)
	}
	return errors
}

async function main() {
	const check = process.argv.includes("--check")
	const files = {}
	for (const name of AREAS) {
		const area = await import(`./spec-gen/${name}.mjs`)
		const spec = readJson(area.source)
		const errors = validate(spec, readJson(area.schema))
		if (errors.length > 0) {
			console.error(
				`${area.source} does not match ${area.schema}:\n  ${errors.slice(0, 20).join("\n  ")}`,
			)
			process.exit(1)
		}
		Object.assign(files, area.generate(spec))
	}
	const stale = []
	for (const [path, content] of Object.entries(files)) {
		const abs = join(ROOT, path)
		if (existsSync(abs) && readFileSync(abs, "utf8") === content) continue
		stale.push(path)
		if (!check) {
			mkdirSync(dirname(abs), { recursive: true })
			writeFileSync(abs, content, "utf8")
		}
	}
	if (check && stale.length > 0) {
		console.error(`Stale generated files (run \`pnpm spec:gen\`):\n  ${stale.join("\n  ")}`)
		process.exit(1)
	}
	console.log(
		`spec-gen: ${Object.keys(files).length} files, ${stale.length} ${check ? "stale" : "written"}`,
	)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
