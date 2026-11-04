#!/usr/bin/env node
/**
 * generate-builder-reference — compact `ProcessBuilder` reference for LLM prompts
 *
 * Usage:  node scripts/generate-builder-reference.mjs [--check]
 *
 * Writes `packages/core/builder-reference.md`. `apps/demo/server/system-prompt.ts`
 * embeds it instead of the 20 KB package README, so the model sees the real
 * method signatures and option names (about 3,000 tokens) and not prose.
 *
 * The method list and option tables are read from `bpmn-builder.ts` with the
 * TypeScript compiler API, so a new builder method or option shows up after a
 * rerun with no edit here. `--check` exits 1 when the committed file is stale
 * (`packages/core/tests/builder-reference.test.ts` does the same).
 *
 * Written by hand in this file, deliberately:
 *   - SKIP_FIELDS: option fields that are noise for a model writing a process
 *   - FAMILIES: method-name patterns for grouping (anything else lands in "other")
 *   - RULES and EXAMPLES: what the README teaches that models get wrong
 */

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const BUILDER = join(ROOT, "packages/core/src/bpmn/bpmn-builder.ts")
const OUT = join(ROOT, "packages/core/builder-reference.md")

/** Longest option description printed; keeps the whole file inside its token budget. */
const DOC_CAP = 34

/**
 * Option fields left out. They configure Modeler bookkeeping, listeners or layout
 * hints that a model has no reason to set, and each costs tokens on every prompt.
 */
const SKIP_FIELDS = new Set([
	"modelerTemplate",
	"modelerTemplateVersion",
	"modelerTemplateIcon",
	"executionListeners",
	"taskListeners",
	"zeebeProperties",
	"zeebeUserTask",
	"toolGrid",
	"loopCharacteristics",
	"agentDefinition",
	"retryBackoff",
	// Aliases and niche knobs; the default behaviour is right for generated processes.
	"isForCompensation",
	"errorRef",
	"activityRef",
	"cancelRemainingInstances",
	"queryParameters",
	"connectionTimeoutInSeconds",
	"readTimeoutInSeconds",
	// Deployment pinning; the defaults (latest form, any variable change) suit generated processes.
	"formKey",
	"formBindingType",
	"formVersionTag",
	"conditionVariableEvents",
])

/**
 * Public methods left out: \`from\` edits an existing model (not the generate-from-prompt path) and
 * \`addDisconnected\` takes a hand-built model element, which a model writing builder calls never has.
 */
const SKIP_METHODS = new Set([
	"from",
	"addDisconnected",
	// Variants of startEvent for multi-start layouts; the plain call covers generation.
	"addStartEvent",
	"disconnectedStartEvent",
])

/** Method families, first match wins. A method that matches none is listed under "other". */
const FAMILIES = [
	["Events", /Event$|^withBoundary$/],
	["Tasks and connectors", /Task$|^callActivity$|Connector$|^task$/],
	["Gateways", /Gateway$/],
	["Containers (sub-processes)", /[sS]ubProcess$|^transaction$/],
	[
		"Flow control",
		/^(branch|connectTo|at|insertAfter|element|condition|defaultFlow|label|flowId)$/,
	],
	[
		"Process settings and misc",
		/^(from|name|executable|versionTag|defaults|executionPlatformVersion|withAutoLayout|annotate|textAnnotation|message|error|signal|escalation|build)$/,
	],
]
const OTHER = "Other"

/** Hand-written teaching text: the mistakes recordings show models making. */
const RULES = [
	"Start with `Bpmn.createProcess(id)`, end with `.build()`, then `Bpmn.export(definitions)` for the XML. Call `.withAutoLayout()` before `.build()`, or the diagram has no shapes.",
	"Element ids are unique. Each element connects to the previous one automatically; there are no manual flows.",
	"`subProcess`, `transaction`, `eventSubProcess` and `adHocSubProcess` take the callback as the SECOND argument and options THIRD: `.subProcess(id, (sub) => sub.startEvent()..., { name })`. Swapped order is tolerated.",
	"Gateways fork with `.branch(name, (b) => b...)`. Inside, `b.condition(feelExpr)` sets the flow condition and `b.defaultFlow()` marks the default flow. To merge, end a branch with `.connectTo(targetId)` and declare that target after the last branch.",
	"Event definitions are named options, not nested objects: `timerDuration`, `timerDate`, `timerCycle`, `messageName` + `correlationKey`, `signalName`, `errorCode`, `escalationCode`, `linkName`. Unknown options are silently dropped: `timer: { duration }` does nothing.",
	"`withBoundary(id, options, (b) => ...)` attaches a boundary event to the PRECEDING activity; the callback builds the path leaving it, and the main chain continues from the activity.",
	"FEEL expressions start with `=`. Options without `?` are required.",
]

/** One runnable example per element family. A test builds each and checks the diagram. */
export const EXAMPLES = [
	`import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("order")
	.withAutoLayout()
	.startEvent("start")
	.serviceTask("charge", { name: "Charge card", taskType: "payments", retries: "3" })
	.userTask("review", { name: "Review", assignee: "=reviewer" })
	.scriptTask("total", { expression: "=price * qty", resultVariable: "total" })
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)`,
	`import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("approval")
	.withAutoLayout()
	.startEvent("start")
	.exclusiveGateway("ok", { name: "Approved?" })
	.branch("yes", (b) =>
		b.condition("=approved").serviceTask("ship", { name: "Ship", taskType: "shipping" }).connectTo("end"),
	)
	.branch("no", (b) => b.defaultFlow().label("Rejected").endEvent("rejected"))
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)`,
	`import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("batch")
	.withAutoLayout()
	.startEvent("start")
	.subProcess(
		"each",
		(sub) =>
			sub
				.startEvent("subStart")
				.serviceTask("handle", { name: "Handle item", taskType: "handler" })
				.endEvent("subEnd"),
		{ name: "Per item", multiInstance: { collection: "=items", elementVariable: "item" } },
	)
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)`,
	`import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("sla")
	.withAutoLayout()
	.startEvent("start")
	.serviceTask("work", { name: "Work", taskType: "worker" })
	.withBoundary("late", { timerDuration: "PT1H", cancelActivity: false }, (b) =>
		b.serviceTask("remind", { name: "Remind", taskType: "mailer" }).endEvent("reminded"),
	)
	.withBoundary("failed", { errorCode: "WORK_FAILED" }, (b) => b.endEvent("aborted"))
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)`,
	`import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("payment")
	.withAutoLayout()
	.startEvent("start", { messageName: "order-placed" })
	.eventBasedGateway("wait")
	.branch("paid", (b) =>
		b
			.intermediateCatchEvent("gotPayment", { messageName: "payment", correlationKey: "=orderId" })
			.endEvent("done"),
	)
	.branch("late", (b) =>
		b.intermediateCatchEvent("expired", { timerDuration: "P3D" }).endEvent("cancelled"),
	)
	.build()
const xml = Bpmn.export(definitions)`,
	`import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("onboarding")
	.withAutoLayout()
	.startEvent("start")
	.restConnector("lookup", {
		name: "Look up customer",
		method: "GET",
		url: '="https://api.example.com/customers/" + customerId',
		resultVariable: "customer",
	})
	.callActivity("kyc", { name: "KYC check", processId: "kyc-check", propagateAllChildVariables: true })
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)`,
]

// ---------------------------------------------------------------------------
// Source reading
// ---------------------------------------------------------------------------

function parse(file) {
	return ts.createSourceFile(file, readFileSync(file, "utf-8"), ts.ScriptTarget.Latest, true)
}

/** The builder file plus the relative modules it imports, so option types from there resolve too. */
function loadSources() {
	const main = parse(BUILDER)
	const files = [main]
	for (const stmt of main.statements) {
		if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
			const spec = stmt.moduleSpecifier.text
			if (spec.startsWith(".")) {
				files.push(parse(join(dirname(BUILDER), spec.replace(/\.js$/, ".ts"))))
			}
		}
	}
	return { main, files }
}

function collectTypes(files) {
	const interfaces = new Map()
	const aliases = new Map()
	for (const sf of files) {
		for (const stmt of sf.statements) {
			if (ts.isInterfaceDeclaration(stmt)) interfaces.set(stmt.name.text, stmt)
			else if (ts.isTypeAliasDeclaration(stmt)) aliases.set(stmt.name.text, stmt)
		}
	}
	return { interfaces, aliases }
}

const squash = (text) =>
	text
		// Members of a multi-line type literal have no semicolons in this codebase.
		.replace(/([^\s;,{(<|&])\n\s*(?=[A-Za-z]+\??:)/g, "$1; ")
		.replace(/\s+/g, " ")
		.replace(/([{(\[]) /g, "$1")
		.replace(/ ([})\]])/g, "$1")
		.replace(/;\s*([})])/g, "$1")
		.trim()

/** First sentence of a node's JSDoc, shortened; "" when undocumented. */
function firstSentence(node) {
	const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc)
	const raw = docs.map((d) => (typeof d.comment === "string" ? d.comment : "")).join(" ")
	const text = squash(raw)
		.replace(/`/g, "")
		.replace(/ \(aspirational\)/g, "")
		.replace(/\{@link ([^}]+)\}/g, "$1")
	// Split before a capital so "e.g. foo" does not end the sentence.
	const first = text.split(/\.\s+(?=[A-Z])|\.$/)[0] ?? ""
	// "Message name — creates a message start event": the clause after the dash restates the name.
	const head = first.includes(" — ") ? first.slice(0, first.indexOf(" — ")) : first
	if (head.length <= DOC_CAP) return head
	// Cut at a word boundary and drop a dangling "(" so a cap never leaves half a clause.
	return `${head
		.slice(0, DOC_CAP)
		.replace(/\s+\S*$/, "")
		.replace(/\s*\([^)]*$/, "")}…`
}

const isInternal = (node) => ts.getJSDocTags(node).some((t) => t.tagName.text === "internal")
const hasModifier = (node, kind) => node.modifiers?.some((m) => m.kind === kind) ?? false

function isPublic(member) {
	return (
		!hasModifier(member, ts.SyntaxKind.PrivateKeyword) &&
		!hasModifier(member, ts.SyntaxKind.ProtectedKeyword) &&
		!isInternal(member) &&
		!(member.name && ts.isPrivateIdentifier(member.name)) &&
		!member.name?.text?.startsWith("_")
	)
}

/** Public methods of a class in declaration order: { name, signature, node }. */
function publicMethods(sf, className) {
	const cls = sf.statements.find((s) => ts.isClassDeclaration(s) && s.name?.text === className)
	if (!cls) throw new Error(`class ${className} not found in ${sf.fileName}`)
	const out = []
	for (const m of cls.members) {
		if (!ts.isMethodDeclaration(m) || !isPublic(m) || SKIP_METHODS.has(m.name.getText(sf))) continue
		const params = m.parameters.map((p) => squash(p.getText(sf)).replace(/ = .*$/, "")).join(", ")
		const isStatic = hasModifier(m, ts.SyntaxKind.StaticKeyword)
		out.push({ name: m.name.getText(sf), signature: `${m.name.getText(sf)}(${params})`, isStatic })
	}
	return out
}

// ---------------------------------------------------------------------------
// Option interfaces
// ---------------------------------------------------------------------------

/**
 * Option-type names a text mentions. Only \`*Options\` and \`*Config\` interfaces count: the
 * model types in bpmn-model.ts (BpmnDefinitions, ...) are output shapes, not arguments to write.
 */
function referencedInterfaces(text, interfaces) {
	return [...text.matchAll(/\b[A-Z][A-Za-z0-9]*(?:Options|Config)\b/g)]
		.map((m) => m[0])
		.filter((n) => interfaces.has(n))
}

/** Own fields of an interface after the skip list, with `extends` flattened. */
function fieldsOf(name, interfaces, sf, seen = new Set()) {
	const decl = interfaces.get(name)
	if (!decl || seen.has(name)) return []
	seen.add(name)
	const fields = []
	for (const clause of decl.heritageClauses ?? []) {
		for (const base of clause.types) {
			fields.push(...fieldsOf(base.expression.getText(), interfaces, sf, seen))
		}
	}
	for (const m of decl.members) {
		if (!ts.isPropertySignature(m) || !m.type) continue
		const key = m.name.getText()
		if (SKIP_FIELDS.has(key)) continue
		fields.push({
			name: key,
			optional: Boolean(m.questionToken),
			type: squash(m.type.getText()),
			doc: firstSentence(m),
		})
	}
	return fields
}

function expandAlias(type, aliases) {
	return type.replace(/\b[A-Z][A-Za-z0-9]*\b/g, (n) => {
		const alias = aliases.get(n)
		if (!alias) return n
		const body = squash(alias.type.getText())
		return body.length <= 70 ? body : n
	})
}

function renderOptions(interfaces, aliases, order) {
	const shared = fieldsOf("ElementOptions", interfaces).map((f) => f.name)
	const sharedSet = new Set(shared)
	const longTypes = new Map()
	const rows = []
	for (const name of order) {
		const base = interfaces.get(name)
		const extendsElement = (base.heritageClauses ?? []).some((c) =>
			c.types.some((t) => t.expression.getText() === "ElementOptions"),
		)
		const fields = fieldsOf(name, interfaces)
			.filter((f) => !(extendsElement && sharedSet.has(f.name)) || name === "ElementOptions")
			.map((f) => ({ ...f, type: expandAlias(f.type, aliases) }))
		for (const f of fields) {
			if (f.type.length > 50) longTypes.set(f.type, [...(longTypes.get(f.type) ?? []), f.name])
		}
		rows.push({ name, extendsElement, fields })
	}
	// A long type used by several fields (ioMapping on four task options) is printed once.
	const sharedShapes = [...longTypes].filter(([, names]) => names.length > 1)
	const shapeLabel = new Map(sharedShapes.map(([type, names]) => [type, `${names[0]} shape`]))

	// One line per interface. A field's description is printed the first time its name
	// appears: `timerDuration` means the same on every event, and repeating it costs tokens.
	const described = new Set()
	const lines = []
	for (const row of rows) {
		const items = row.fields.map((f) => {
			const type = shapeLabel.get(f.type) ?? f.type
			const doc = f.doc && !described.has(f.name) ? ` (${f.doc})` : ""
			described.add(f.name)
			return `${f.name}${f.optional ? "?" : ""}: ${type}${doc}`
		})
		lines.push(`- ${row.name}${row.extendsElement ? " +El" : ""}: ${items.join("; ")}`)
	}
	if (sharedShapes.length > 0) {
		for (const [type] of sharedShapes) lines.push(`- ${shapeLabel.get(type)} = ${type}`)
	}
	return lines
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function familyOf(name) {
	return FAMILIES.find(([, re]) => re.test(name))?.[0] ?? OTHER
}

function groupByFamily(methods) {
	const groups = new Map([...FAMILIES.map(([f]) => f), OTHER].map((f) => [f, []]))
	for (const m of methods) groups.get(familyOf(m.name)).push(m)
	return groups
}

export function generateBuilderReference() {
	const { main, files } = loadSources()
	const { interfaces, aliases } = collectTypes(files)

	const proc = publicMethods(main, "ProcessBuilder")
	const branch = publicMethods(main, "BranchBuilder")
	const sub = publicMethods(main, "SubProcessContentBuilder")
	const processNames = new Set(proc.map((m) => m.name))
	const callbackNames = new Set([...branch, ...sub].map((m) => m.name))

	const branchOnly = branch.filter((m) => !processNames.has(m.name))
	const subOnly = sub.filter(
		(m) => !processNames.has(m.name) && !branch.some((b) => b.name === m.name),
	)
	const processOnly = proc.filter((m) => !callbackNames.has(m.name) && !m.isStatic)

	// Option interfaces, in the order the method signatures first mention them,
	// then those reachable through their fields (MultiInstanceOptions via serviceTask).
	const order = []
	const visit = (text) => {
		for (const n of referencedInterfaces(text, interfaces)) {
			if (order.includes(n)) continue
			order.push(n)
			visit(
				fieldsOf(n, interfaces)
					.map((f) => f.type)
					.join(" "),
			)
		}
	}
	visit([...proc, ...branchOnly, ...subOnly].map((m) => m.signature).join(" "))
	// ElementOptions is the shared base: print it first and only once.
	const options = ["ElementOptions", ...order.filter((n) => n !== "ElementOptions")].filter((n) =>
		interfaces.has(n),
	)

	const out = []
	out.push("# @bpmnkit/core builder reference", "")
	out.push("Generated from `bpmn-builder.ts`; do not edit.", "")
	out.push("## Rules", "")
	for (const rule of RULES) out.push(`- ${rule}`)
	out.push("", "## Methods", "")
	out.push(
		"`ProcessBuilder` methods (all return `this`; callback builders have the element methods too). `?` = optional.",
		"",
	)
	for (const [family, methods] of groupByFamily(proc)) {
		if (methods.length === 0) continue
		out.push(`${family}:`)
		for (const m of methods) out.push(`- ${m.isStatic ? "static " : ""}${m.signature}`)
	}
	const extras = [...branchOnly, ...subOnly]
	if (extras.length > 0) {
		out.push(
			"",
			"Only inside `.branch()` callbacks (BranchBuilder), applied to the flow leaving the gateway:",
		)
		for (const m of branchOnly) out.push(`- ${m.signature}`)
		if (subOnly.length > 0) {
			out.push("", "Only inside sub-process callbacks:")
			for (const m of subOnly) out.push(`- ${m.signature}`)
		}
	}
	if (processOnly.length > 0) {
		out.push(
			"",
			`Not available inside callbacks (top-level only): ${processOnly.map((m) => m.name).join(", ")}.`,
		)
	}
	out.push("", "## Options", "", "`+El` = also accepts the ElementOptions fields.", "")
	out.push(...renderOptions(interfaces, aliases, options))
	out.push("", "## Examples", "")
	for (const example of EXAMPLES) out.push("```typescript", example, "```", "")
	return `${out.join("\n").trimEnd()}\n`
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const generated = generateBuilderReference()
	if (process.argv.includes("--check")) {
		let current = ""
		try {
			current = readFileSync(OUT, "utf-8")
		} catch {}
		if (current !== generated) {
			console.error(
				"builder-reference.md is stale. Run: node scripts/generate-builder-reference.mjs",
			)
			process.exit(1)
		}
	} else {
		writeFileSync(OUT, generated)
		console.log(
			`wrote ${OUT} (${generated.length} chars, ~${Math.round(generated.length / 4)} tokens)`,
		)
	}
}
