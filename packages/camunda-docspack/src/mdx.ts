/**
 * Reducing Camunda's MDX to the Markdown a chunk should carry.
 *
 * The rule this module exists to enforce: **never drop anything silently**. Camunda's own
 * `docusaurus-plugin-llms` export removes every construct it does not recognise, which is how
 * 94 BPMN diagrams vanish from the best-practice pages while the prose goes on referring to
 * them. Here an unrecognised component is an error naming the file and line, so a new upstream
 * component stops the build instead of quietly thinning the corpus.
 */

import { posix } from "node:path"

/** Raised when a document uses a construct no rule covers. The build must not continue. */
export class UnknownConstructError extends Error {
	constructor(
		readonly file: string,
		readonly line: number,
		readonly construct: string,
	) {
		super(`${file}:${line}: unhandled MDX construct <${construct}>`)
		this.name = "UnknownConstructError"
	}
}

/**
 * Components that carry meaning and are replaced by text rather than removed.
 *
 * `MarkerCamundaExtension` is the reason this map exists: it appears 25 times in the FEEL
 * reference to mark a function as Camunda's own rather than standard FEEL, and a reader who
 * loses it is told the opposite of the truth.
 */
const REPLACED: Record<string, string> = {
	MarkerCamundaExtension: "(Camunda extension)",
	MarkerStronglyConsistentExtension: "(strongly consistent)",
	MarkerEventuallyConsistentExtension: "(eventually consistent)",
	MarkerRequiredPermissions: "(requires permissions)",
	MarkerGuideline: "(guideline)",
	MarkerAddedInVersion: "(added in version)",
	GitHubInlineIcon: "",
	// The cells of a feature-comparison table. Removed, the table says nothing.
	YesItem: "Yes",
	NoItem: "No",
	// Download links whose URL is computed from the release; the link text is what is left.
	C8Run: "Camunda 8 Run",
	DockerCompose: "Docker Compose",
	HelmChartValuesFileBitnamiLegacyLink: "Helm chart Bitnami legacy values file",
}

/** Components that are page furniture: navigation cards, decorative icons, layout wrappers. */
const DROPPED = new Set([
	"PageDescription",
	"AoGrid",
	"ApiGrid",
	"FormViewer",
	"Versions",
	"GlossaryTerm",
	"CamundaDistributions",
	"CamundaSelfManaged",
	"HelmInstallOverviewMethods",
	"Property",
	"Highlight",
	// Navigation cards to pages that are in the corpus themselves.
	"DocCardList",
	"ZeebeGrid",
	"ConnectorsGrid",
	"ConnectorsGridSml",
	"IdpGrid",
	// Wrappers: the Markdown table or text between their tags stays.
	"TableTextSmall",
	"ExpandableTable",
	// Interactive widgets, rendered from data in a script: the connector catalogue, the LiveBench
	// model filter. Their content is not in the Markdown, so there is nothing to keep.
	"SearchableTable",
	"LiveBenchModelFilter",
	// Before and after diagrams of a dual-region operation, as images, and an embedded video.
	"StateContainer",
	"ReactPlayer",
	"UploadIcon",
	"br",
	"hr",
	"img",
	"p",
	"span",
	"div",
	"a",
	"b",
	"i",
	"em",
	"strong",
	"code",
	"pre",
	"ul",
	"ol",
	"li",
	"table",
	"thead",
	"tbody",
	"tr",
	"td",
	"th",
	"small",
	"sup",
	"sub",
	"details",
	"summary",
	"figure",
	"figcaption",
])

/** An imported SVG component renders as an inline icon; its name is the only text in it. */
const SVG_COMPONENT = /^[A-Z][A-Za-z0-9]*Svg$/

/**
 * Components dropped because of where they are imported from, not what they are called. An
 * image import is a diagram or an icon, whatever its name (`RegionLoss`, `TopologyImg`). The
 * self-managed landing page renders its sections from one module under names as generic as
 * `Components` and `Installation`, which must not be dropped on every other page.
 */
const DROPPED_IMPORT = /\.(svg|png|jpe?g|gif)$|^@site\/src\/components\/CamundaSelfManaged$/

/** `import RegionLoss from "./img/region-loss.svg"`, `import { Components } from "@site/…"` */
const COMPONENT_IMPORT = /^import\s+(\{[^}]*\}|\w+)\s+from\s+["']([^"']+)["']/gm

const ADMONITION = /^:::(note|tip|info|caution|warning|important|danger|success)\s*(.*)$/
const ADMONITION_END = /^:::\s*$/
const IMPORT = /^import\s/
const EXPORT = /^export\s/

export interface StripOptions {
	/** Path reported in an error, so a failure names the upstream file a human must look at. */
	file: string
	/** Lines removed before this body, so a reported line number opens the right place. */
	lineOffset?: number
	/** Resolve `<div bpmn="…"/>` to flow text. Returning undefined drops the embed. */
	renderBpmn?: (path: string) => string | undefined
	/**
	 * Read an imported Markdown partial, relative to the importing file. Returning undefined
	 * leaves the component to the allowlist, so a missing partial fails loudly.
	 */
	readPartial?: (importPath: string) => string | undefined
	/** Guards against a partial that imports itself, directly or through another. */
	depth?: number
	/** The attributes of the tag that included this partial, which its `{props.x && …}` reads. */
	props?: Readonly<Record<string, string | true>>
}

/** A partial chain deeper than this is a cycle, not a document. */
const MAX_PARTIAL_DEPTH = 4

/** `<ConfigurationResponse type="process" />`, `<DeploymentReadinessCheck download />` */
const PARTIAL_USE = /<(\w+)((?:\s+[a-z]\w*(?:="[^"]*")?)*)\s*\/>/

/** `{props.type === "process" && <Fields />}`, `{props.download && <Download />}` */
const PROPS_CONDITION = /^\{props\.(\w+)(?:\s*===\s*"([^"]*)")?\s*&&\s*(<\w+\s*\/>)\}$/

/** `<X type="process" download />` as `{ type: "process", download: true }`. */
function attributes(source: string): Record<string, string | true> {
	const out: Record<string, string | true> = {}
	for (const match of source.matchAll(/([a-z]\w*)(?:="([^"]*)")?/g)) {
		if (match[1]) out[match[1]] = match[2] ?? true
	}
	return out
}

/** `import SaasPrereqs from '../guides/react-components/\_saas-prerequisites.md'` */
const PARTIAL_IMPORT = /^import\s+(\w+)\s+from\s+["']([^"']+\.mdx?)["']/

/**
 * Strip one MDX document to Markdown.
 *
 * @throws UnknownConstructError when a component appears that no rule covers.
 */
export function stripMdx(source: string, options: StripOptions): string {
	const out: string[] = []
	let fence: string | null = null
	let inImport = false
	let skipUntil = -1
	const partials = partialImports(source)
	const droppedImports = importsMatching(source, DROPPED_IMPORT)

	const lines = source.split(/\r?\n/)
	for (const [index, raw] of lines.entries()) {
		if (index <= skipUntil) continue
		let line = raw
		const number = index + 1 + (options.lineOffset ?? 0)

		const fenceMatch = /^\s*(```+|~~~+)/.exec(line)
		if (fenceMatch?.[1]) {
			fence = fence === null ? (fenceMatch[1][0] ?? null) : null
			out.push(line)
			continue
		}
		if (fence !== null) {
			out.push(line)
			continue
		}

		// An `import {` that lists its names over several lines ends at its `from`.
		if (inImport) {
			if (/\bfrom\s+["']/.test(line)) inImport = false
			continue
		}
		if (IMPORT.test(line)) {
			inImport = !/\bfrom\s+["']/.test(line)
			continue
		}
		if (EXPORT.test(line)) continue

		const admonition = ADMONITION.exec(line.trim())
		if (admonition?.[1]) {
			const title = (admonition[2] ?? "").trim()
			out.push(`**${capitalize(admonition[1])}${title === "" ? "" : `: ${title}`}**`)
			continue
		}
		if (ADMONITION_END.test(line.trim())) continue

		const bpmn = /<div\s+bpmn="([^"]+)"[^>]*\/?>/.exec(line)
		if (bpmn?.[1]) {
			const rendered = options.renderBpmn?.(bpmn[1])
			if (rendered !== undefined && rendered.trim() !== "") out.push("", rendered, "")
			continue
		}

		// A partial that renders a part only for one caller: `{props.type === "task" && <X />}`.
		// The condition is decided here, from the attributes the partial was included with.
		const conditional = PROPS_CONDITION.exec(line.trim())
		if (conditional?.[1] && conditional[3]) {
			const value = options.props?.[conditional[1]]
			const shown = conditional[2] === undefined ? value !== undefined : value === conditional[2]
			if (shown) line = conditional[3]
			else continue
		}

		// A partial is included by using the component the import bound it to. Its prose is the
		// page's prose — prerequisites, setup steps — so it is inlined, not dropped.
		const used = PARTIAL_USE.exec(line.trim())
		const importPath = used?.[1] === undefined ? undefined : partials.get(used[1])
		if (importPath !== undefined) {
			const partial = options.readPartial?.(importPath)
			if (partial !== undefined) {
				const props = attributes(used?.[2] ?? "")
				out.push("", inlinePartial(partial, importPath, { ...options, props }), "")
				continue
			}
		}

		// `<span className="callout">1</span>` numbers a element in the diagram above. The
		// number means nothing on its own, so it becomes an ordered marker the prose after it
		// still reads correctly against.
		const calloutMatch = /<span\s+className="callout">\s*(\d+)\s*<\/span>/.exec(line)
		if (calloutMatch?.[1]) {
			out.push(`**(${calloutMatch[1]})**`)
			continue
		}

		// Join a tag whose props run over lines, so it is rewritten whole instead of leaving its
		// props behind as text. Consumed lines are skipped by the loop below.
		if (opensUnclosedTag(line)) {
			let joined = line
			for (let next = index + 1; next < lines.length && next <= index + MAX_TAG_LINES; next++) {
				joined = `${joined} ${(lines[next] ?? "").trim()}`
				if (!opensUnclosedTag(joined)) {
					line = joined
					skipUntil = next
					break
				}
			}
		}

		out.push(replaceComponents(line, options.file, number, droppedImports))
	}

	return collapseBlankRuns(out.join("\n")).trim()
}

/**
 * Rewrite or remove every JSX tag on one line, failing on anything unrecognised.
 *
 * Inline code is left alone first: `<key>` in `run view <key>` is a placeholder a reader is
 * meant to substitute, and rewriting or refusing it would be wrong both ways.
 */
function replaceComponents(
	line: string,
	file: string,
	number: number,
	droppedImports: ReadonlySet<string>,
): string {
	return outsideCode(line, (text) => replaceTags(text, file, number, droppedImports))
}

function replaceTags(
	text: string,
	file: string,
	number: number,
	droppedImports: ReadonlySet<string>,
): string {
	let out = ""
	let from = 0
	for (;;) {
		const open = text.indexOf("<", from)
		if (open < 0) return out + text.slice(from)
		const name = TAG_START.exec(text.slice(open))
		const end = name?.[0] === undefined ? -1 : tagEnd(text, open + name[0].length)
		// `\<GitProvider\>` is Markdown for the literal text `<GitProvider>`, a placeholder in a
		// sentence, so an escaped `<` never opens a tag. Neither does one that is never closed.
		if (!name?.[1] || end < 0 || text[open - 1] === "\\") {
			out += text.slice(from, open + 1)
			from = open + 1
			continue
		}
		const tag = text.slice(open, end + 1)
		out += text.slice(from, open) + rewriteTag(tag, name[1], file, number, droppedImports)
		from = end + 1
	}
}

const TAG_START = /^<\/?([A-Za-z][\w.]*)\b/

/**
 * The index of the `>` that closes a tag whose name ends at `from`, or -1.
 *
 * A prop holds JSX and quotes of its own — `current={<img src={Four} />}` — so the first `>`
 * is not the end: only one outside every brace and quote is.
 */
function tagEnd(text: string, from: number): number {
	let depth = 0
	let quote: string | undefined
	for (let i = from; i < text.length; i++) {
		const c = text[i]
		if (quote !== undefined) {
			if (c === quote) quote = undefined
		} else if (c === '"' || (depth > 0 && (c === "'" || c === "`"))) quote = c
		else if (c === "{") depth += 1
		else if (c === "}") depth -= 1
		else if (c === ">" && depth === 0) return i
	}
	return -1
}

/** A component's opening tag whose props run onto the next lines: `<Tabs values={[`. */
function opensUnclosedTag(line: string): boolean {
	return outsideCodeParts(line).some((part) => {
		for (const match of part.matchAll(/(?<!\\)<([A-Z][\w.]*)\b/g)) {
			if (tagEnd(part, match.index + match[0].length) < 0) return true
		}
		return false
	})
}

/** How far a tag may run over lines before the `<` is taken for prose after all. */
const MAX_TAG_LINES = 40

function rewriteTag(
	tag: string,
	rawName: string,
	file: string,
	number: number,
	droppedImports: ReadonlySet<string>,
): string {
	const name = rawName.split(".")[0] ?? rawName

	const replacement = REPLACED[name]
	if (replacement !== undefined) return replacement
	if (SVG_COMPONENT.test(name)) return ""
	if (DROPPED.has(name) || droppedImports.has(name)) return ""

	// JSX components are capitalised by the language's own rule. A lowercase name that is
	// not HTML is prose in angle brackets — `<your-token>`, `<version>` — and belongs to
	// the sentence, so it stays exactly as written.
	if (name[0] === name[0]?.toLowerCase()) return tag

	// Tabs are the one construct that must keep its labels: a tab titled "VS Code Copilot"
	// is the search term someone would actually type.
	if (name === "Tabs") return ""
	if (name === "TabItem") {
		const value = /value=\{?"([^"]+)"\}?/.exec(tag)?.[1]
		return value === undefined ? "" : `\n### ${value}\n`
	}

	throw new UnknownConstructError(file, number, name)
}

/** The names a document imports from a module that `pattern` matches. */
function importsMatching(source: string, pattern: RegExp): Set<string> {
	const found = new Set<string>()
	// Over the whole source, because `import {` lists its names on lines of their own.
	for (const match of source.matchAll(COMPONENT_IMPORT)) {
		if (!match[1] || !match[2] || !pattern.test(match[2])) continue
		for (const name of match[1].match(/\w+/g) ?? []) found.add(name)
	}
	return found
}

/** Map every `import Name from "./partial.md"` in a document to the path it names. */
function partialImports(source: string): Map<string, string> {
	const found = new Map<string, string>()
	for (const line of source.split(/\r?\n/)) {
		const match = PARTIAL_IMPORT.exec(line.trim())
		if (!match?.[1] || !match[2]) continue
		// Docusaurus escapes the leading underscore of a partial's filename for MDX.
		found.set(match[1], match[2].replace(/\\_/g, "_"))
	}
	return found
}

/** Strip a partial with the same rules, keeping its own frontmatter out of the prose. */
function inlinePartial(source: string, path: string, options: StripOptions): string {
	const depth = (options.depth ?? 0) + 1
	if (depth > MAX_PARTIAL_DEPTH) {
		throw new Error(`${options.file}: partial imports nested more than ${MAX_PARTIAL_DEPTH} deep`)
	}
	const body = source.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
	// `readPartial` resolves against the page that started the chain, so an import inside this
	// partial must be rebased from the partial's directory onto that page's.
	const readPartial = options.readPartial
	return stripMdx(body, {
		...options,
		file: path,
		lineOffset: 0,
		depth,
		readPartial: readPartial && ((nested) => readPartial(posix.join(posix.dirname(path), nested))),
	})
}

/** Apply `transform` to the parts of a line that are not inside an inline code span. */
function outsideCode(line: string, transform: (text: string) => string): string {
	const parts = line.split(/(`+[^`]*`+)/)
	return parts.map((part) => (part.startsWith("`") ? part : transform(part))).join("")
}

function outsideCodeParts(line: string): string[] {
	return line.split(/(`+[^`]*`+)/).filter((part) => !part.startsWith("`"))
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1)
}

function collapseBlankRuns(text: string): string {
	return text.replace(/\n{3,}/g, "\n\n")
}
