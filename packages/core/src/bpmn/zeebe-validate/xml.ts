import type { ZeebeRuleName } from "../../generated/zeebe-rules.js"
import type { OptimizationFinding } from "../optimize/types.js"
import type { ZeebeContext } from "./context.js"
import { XSD_ELEMENTS, XSD_ENUMS, XSD_TYPES } from "./xsd.js"

/*
 * Zeebe reads BPMN with a validating Xerces parser (BPMN20.xsd), which stops at
 * the first well-formedness or schema error. This is a small strict scanner and
 * XSD content-model check that reports that first error with Xerces' own text,
 * so the finding reads like Zeebe's rejection. It walks the text in document
 * order exactly once, as Xerces does, so "first" means the same thing.
 */

const MODEL = "http://www.omg.org/spec/BPMN/20100524/MODEL"
const XSI = "http://www.w3.org/2001/XMLSchema-instance"
const XML_NS = "http://www.w3.org/XML/1998/namespace"
const XMLNS_NS = "http://www.w3.org/2000/xmlns/"
const XSD_NS = "http://www.w3.org/2001/XMLSchema"

/** Prefixes the schema table uses for each target namespace. */
const SCHEMA_PREFIXES: readonly (readonly [string, string])[] = [
	["", MODEL],
	["bpmndi", "http://www.omg.org/spec/BPMN/20100524/DI"],
	["di", "http://www.omg.org/spec/DD/20100524/DI"],
	["dc", "http://www.omg.org/spec/DD/20100524/DC"],
]

/** What ZCheck prints before Xerces' message for a parse failure (zeebe-verdicts.json). */
const PARSE_PREFIX = "PARSE: SAXException while parsing input stream / "

const SUGGESTIONS: Partial<Record<ZeebeRuleName, string>> = {
	"xml-schema": "Fix the XML so it is well-formed and the BPMN elements follow the schema order.",
	"target-namespace": "Add a targetNamespace attribute to bpmn:definitions.",
	"sequence-flow-refs": "Give the sequence flow both sourceRef and targetRef.",
	"boundary-attached-ref": "Set attachedToRef to the activity the boundary event is attached to.",
	"association-refs": "Give the association or message flow both sourceRef and targetRef.",
	"xsd-required-name": "Add the attribute the BPMN schema requires.",
	"id-ncname-unique": "Use unique ids that are valid XML names (no spaces, no leading digit).",
	"idref-resolves": "Point the reference at an existing element id that is a valid XML name.",
	"xsd-content": "Remove the attribute or value the BPMN schema does not allow.",
	"id-present": "Give the element a non-empty id.",
}

// ---------------------------------------------------------------------------
// Schema table
// ---------------------------------------------------------------------------

interface Alt {
	kind: "ref" | "local" | "any" | "other"
	ns: string
	local: string
	/** For a local element, its type. */
	type?: string
}

interface Particle {
	alts: Alt[]
	min: number
	max: number
}

interface AttrDecl {
	name: string
	type: string
	required: boolean
}

interface ComplexType {
	name: string
	/** Target namespace of the schema the type is declared in. */
	ns: string
	particles: Particle[]
	attrs: AttrDecl[]
	anyAttr: boolean
	mixed: boolean
	abstract: boolean
}

const BUILTIN_SIMPLE = new Set([
	"string",
	"anyURI",
	"boolean",
	"integer",
	"int",
	"double",
	"ID",
	"IDREF",
	"QName",
])

/** Pseudo-type of `di:extension`, whose anonymous type takes any foreign content. */
const EXT_TYPE = "#ext"

/** A table entry, ignoring `Object.prototype` (an element named `constructor` is not in the schema). */
function own<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
	return Object.hasOwn(table, key) ? table[key] : undefined
}

function nsOfPrefix(prefix: string): string {
	for (const [p, ns] of SCHEMA_PREFIXES) if (p === prefix) return ns
	return ""
}

/** A table name such as `bpmndi:BPMNShape` or `task`, split into namespace and local name. */
function schemaName(name: string): { ns: string; local: string } {
	const colon = name.indexOf(":")
	if (colon < 0) return { ns: MODEL, local: name }
	return { ns: nsOfPrefix(name.slice(0, colon)), local: name.slice(colon + 1) }
}

/** The table key of a namespace-qualified name, or `undefined` outside the BPMN schemas. */
function schemaKey(ns: string, local: string): string | undefined {
	for (const [p, uri] of SCHEMA_PREFIXES) if (uri === ns) return p === "" ? local : `${p}:${local}`
	return undefined
}

/** Splits on `sep` outside parentheses and braces. */
function splitTop(text: string, sep: string): string[] {
	const out: string[] = []
	let depth = 0
	let start = 0
	for (let i = 0; i < text.length; i++) {
		const ch = text[i]
		if (ch === "(" || ch === "{") depth++
		else if (ch === ")" || ch === "}") depth--
		else if (ch === sep && depth === 0) {
			out.push(text.slice(start, i))
			start = i + 1
		}
	}
	out.push(text.slice(start))
	return out
}

/** Splits an occurrence suffix off a particle: `a*` -> `["a", 0, Infinity]`. */
function occurrence(text: string): [string, number, number] {
	const last = text[text.length - 1]
	if (last === "?") return [text.slice(0, -1), 0, 1]
	if (last === "*") return [text.slice(0, -1), 0, Number.POSITIVE_INFINITY]
	if (last === "+") return [text.slice(0, -1), 1, Number.POSITIVE_INFINITY]
	if (last === "}") {
		const open = text.lastIndexOf("{")
		const [min, max] = text.slice(open + 1, -1).split(",")
		return [
			text.slice(0, open),
			Number(min),
			max === undefined || max === "" ? Number.POSITIVE_INFINITY : Number(max),
		]
	}
	return [text, 1, 1]
}

function parseAlt(text: string, typeNs: string): { alt: Alt; min: number; max: number } {
	const [body, min, max] = occurrence(text)
	if (body === "#any") return { alt: { kind: "any", ns: "", local: "" }, min, max }
	if (body === "#other") return { alt: { kind: "other", ns: typeNs, local: "" }, min, max }
	const eq = body.indexOf("=")
	if (eq < 0) {
		const { ns, local } = schemaName(body)
		return { alt: { kind: "ref", ns, local }, min, max }
	}
	const { ns, local } = schemaName(body.slice(0, eq))
	return { alt: { kind: "local", ns, local, type: body.slice(eq + 1) }, min, max }
}

function parseParticle(text: string, typeNs: string): Particle {
	if (!text.startsWith("(")) {
		const { alt, min, max } = parseAlt(text, typeNs)
		return { alts: [alt], min, max }
	}
	const close = text.lastIndexOf(")")
	const [, min, max] = occurrence(`x${text.slice(close + 1)}`)
	const alts = splitTop(text.slice(1, close), "|").map((a) => parseAlt(a, typeNs))
	// A choice's occurrence bounds combine with its alternatives' (the timer choice of three optional elements may be empty).
	return {
		alts: alts.map((a) => a.alt),
		min: min * Math.min(...alts.map((a) => a.min)),
		max: max * Math.max(...alts.map((a) => a.max)),
	}
}

const TYPE_CACHE = new Map<string, ComplexType | undefined>()

function complexType(name: string): ComplexType | undefined {
	if (TYPE_CACHE.has(name)) return TYPE_CACHE.get(name)
	const spec = own(XSD_TYPES, name)
	let result: ComplexType | undefined
	if (spec !== undefined) {
		const [base = "", particles = "", attrs = "", flags = ""] = splitTop(spec, "|")
		const ns = schemaName(name).ns
		const parent = base === "" ? undefined : complexType(base)
		const own = particles === "" ? [] : splitTop(particles, ",").map((p) => parseParticle(p, ns))
		const ownAttrs: AttrDecl[] =
			attrs === ""
				? []
				: attrs.split(",").map((a) => {
						const eq = a.indexOf("=")
						const required = a.endsWith("!")
						return {
							name: a.slice(0, eq),
							type: a.slice(eq + 1, required ? -1 : undefined),
							required,
						}
					})
		// Xerces lists a derived type's own attributes before the inherited ones.
		const inherited = (parent?.attrs ?? []).filter((a) => !ownAttrs.some((o) => o.name === a.name))
		result = {
			name,
			ns,
			particles: [...(parent?.particles ?? []), ...own],
			attrs: [...ownAttrs, ...inherited],
			anyAttr: flags.includes("@") || (parent?.anyAttr ?? false),
			mixed: flags.includes("~") || (own.length === 0 && (parent?.mixed ?? false)),
			abstract: flags.includes("!"),
		}
	}
	TYPE_CACHE.set(name, result)
	return result
}

function isSimpleType(name: string): boolean {
	return BUILTIN_SIMPLE.has(name) || own(XSD_ENUMS, name) !== undefined
}

/** A global element's type and substitution head. */
function globalElement(key: string): { type: string; head?: string } | undefined {
	const spec = own(XSD_ELEMENTS, key)
	if (spec === undefined) return undefined
	const slash = spec.indexOf("/")
	return slash < 0 ? { type: spec } : { type: spec.slice(0, slash), head: spec.slice(slash + 1) }
}

/** Whether a type is, or derives from, `ancestor`. */
function derivesFrom(type: string, ancestor: string): boolean {
	let current: string | undefined = type
	for (let guard = 0; current !== undefined && guard < 32; guard++) {
		if (current === ancestor) return true
		const spec: string | undefined = own(XSD_TYPES, current)
		const base: string = spec === undefined ? "" : (splitTop(spec, "|")[0] ?? "")
		current = base === "" ? undefined : base
	}
	return false
}

function altLabel(alt: Alt): string {
	if (alt.kind === "any") return "WC[##any]"
	if (alt.kind === "other") return `WC[##other:"${alt.ns}"]`
	return `"${alt.ns}":${alt.local}`
}

/** Xerces' rendering of an element in "Invalid content" messages. */
function expandedName(ns: string, local: string): string {
	return ns === "" ? local : `{"${ns}":${local}}`
}

// ---------------------------------------------------------------------------
// Lexical checks
// ---------------------------------------------------------------------------

function isNameStart(cp: number): boolean {
	return (
		(cp >= 0x61 && cp <= 0x7a) ||
		(cp >= 0x41 && cp <= 0x5a) ||
		cp === 0x5f ||
		(cp >= 0xc0 && cp <= 0xd6) ||
		(cp >= 0xd8 && cp <= 0xf6) ||
		(cp >= 0xf8 && cp <= 0x2ff) ||
		(cp >= 0x370 && cp <= 0x37d) ||
		(cp >= 0x37f && cp <= 0x1fff) ||
		(cp >= 0x200c && cp <= 0x200d) ||
		(cp >= 0x2070 && cp <= 0x218f) ||
		(cp >= 0x2c00 && cp <= 0x2fef) ||
		(cp >= 0x3001 && cp <= 0xd7ff) ||
		(cp >= 0xf900 && cp <= 0xfdcf) ||
		(cp >= 0xfdf0 && cp <= 0xfffd) ||
		(cp >= 0x10000 && cp <= 0xeffff)
	)
}

function isNameChar(cp: number): boolean {
	return (
		isNameStart(cp) ||
		cp === 0x2d ||
		cp === 0x2e ||
		(cp >= 0x30 && cp <= 0x39) ||
		cp === 0xb7 ||
		(cp >= 0x300 && cp <= 0x36f) ||
		(cp >= 0x203f && cp <= 0x2040)
	)
}

function isNcName(text: string): boolean {
	if (text === "") return false
	let first = true
	for (const ch of text) {
		const cp = ch.codePointAt(0) ?? 0
		if (first ? !isNameStart(cp) : !isNameChar(cp)) return false
		first = false
	}
	return true
}

function isQName(text: string): boolean {
	const colon = text.indexOf(":")
	if (colon < 0) return isNcName(text)
	return isNcName(text.slice(0, colon)) && isNcName(text.slice(colon + 1))
}

/** XSD whitespace collapse (`xsd:token` and every non-string built-in). */
function collapse(text: string): string {
	return text.replace(/[ \t\n\r]+/g, " ").replace(/^ | $/g, "")
}

function isXmlWhitespace(text: string): boolean {
	return /^[ \t\n\r]*$/.test(text)
}

function isXmlChar(cp: number): boolean {
	return (
		cp === 0x9 ||
		cp === 0xa ||
		cp === 0xd ||
		(cp >= 0x20 && cp <= 0xd7ff) ||
		(cp >= 0xe000 && cp <= 0xfffd) ||
		(cp >= 0x10000 && cp <= 0x10ffff)
	)
}

const DOUBLE = /^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?$|^(-?INF|NaN)$/

// ---------------------------------------------------------------------------
// Scanner and validator
// ---------------------------------------------------------------------------

/** The first error, in Zeebe's words. */
class XmlFailure {
	constructor(
		readonly rule: ZeebeRuleName,
		readonly message: string,
	) {}
}

interface Attr {
	raw: string
	prefix: string
	local: string
	ns: string
	value: string
}

const Mode = { Skip: 0, Complex: 1, Simple: 2 } as const
type Mode = (typeof Mode)[keyof typeof Mode]

interface Frame {
	raw: string
	ns: string
	local: string
	nsMap: ReadonlyMap<string, string>
	mode: Mode
	ct?: ComplexType
	simple?: string
	/** Content-model state: the particle reached and how often it matched. */
	pi: number
	pc: number
	text: string
	sawText: boolean
	sawChild: boolean
	/** Nearest id of this element or an ancestor, for Zeebe's `id > child` naming. */
	ownerId: string
	/** Inside a non-executable process, which Zeebe's model walker skips. */
	skipped: boolean
	/** Child positions from the root, for Zeebe's model walk order. */
	path: number[]
	children: number
	node?: NodeRefs
}

/** A flow node's sequence flow references, which Zeebe's validators resolve eagerly. */
interface NodeRefs {
	local: string
	path: number[]
	outgoing: string[]
	incoming: string[]
	/** Exclusive and inclusive gateways resolve their outgoing flows only as some flow's source. */
	gateway: boolean
	id: string | undefined
	/** Boundary events and compensation handlers also resolve their incoming flows. */
	resolvesIncoming: boolean
}

const PREDEFINED: Readonly<Record<string, string>> = {
	lt: "<",
	gt: ">",
	amp: "&",
	quot: '"',
	apos: "'",
}

/** Types whose elements Zeebe requires an id on (`IdentifiableBpmnElementValidator`). */
const ID_REQUIRED_TYPES = ["tFlowElement", "tProcess", "tMessage", "tSignal", "tEscalation"]

class XmlChecker {
	private i = 0
	private readonly lineStarts: number[] = [0]
	private readonly stack: Frame[] = []
	private readonly ids = new Set<string>()
	private readonly idrefs: string[] = []
	/** Elements without the id Zeebe requires, by the id Zeebe would name them under. */
	readonly missingIds: string[] = []
	/** The element each id names (the first one), as Zeebe's `getModelElementById` finds it. */
	private readonly elementsById = new Map<string, { ns: string; local: string }>()
	private readonly flowNodes: NodeRefs[] = []
	private readonly flowSources = new Set<string>()

	constructor(private readonly s: string) {
		for (let k = 0; k < s.length; k++) {
			const ch = s.charCodeAt(k)
			if (ch === 0x0a) this.lineStarts.push(k + 1)
			else if (ch === 0x0d && s.charCodeAt(k + 1) !== 0x0a) this.lineStarts.push(k + 1)
		}
	}

	private line(pos: number): number {
		let lo = 0
		let hi = this.lineStarts.length - 1
		while (lo < hi) {
			const mid = (lo + hi + 1) >> 1
			if ((this.lineStarts[mid] ?? 0) <= pos) lo = mid
			else hi = mid - 1
		}
		return lo + 1
	}

	private fatal(text: string, pos = this.i, rule: ZeebeRuleName = "xml-schema"): XmlFailure {
		return new XmlFailure(
			rule,
			`${PARSE_PREFIX}Fatal Error: URI=null Line=${this.line(pos)}: ${text}`,
		)
	}

	private error(rule: ZeebeRuleName, text: string, pos: number): XmlFailure {
		return new XmlFailure(rule, `${PARSE_PREFIX}Error: URI=null Line=${this.line(pos)}: ${text}`)
	}

	private startsWith(text: string): boolean {
		return this.s.startsWith(text, this.i)
	}

	private skipWs(): boolean {
		const start = this.i
		while (this.i < this.s.length && /[ \t\n\r]/.test(this.s[this.i] ?? "")) this.i++
		return this.i > start
	}

	private readName(): string | undefined {
		const start = this.i
		const first = this.s.codePointAt(this.i) ?? -1
		if (!isNameStart(first) && first !== 0x3a) return undefined
		this.i += first > 0xffff ? 2 : 1
		while (this.i < this.s.length) {
			const cp = this.s.codePointAt(this.i) ?? -1
			if (!isNameChar(cp) && cp !== 0x3a) break
			this.i += cp > 0xffff ? 2 : 1
		}
		return this.s.slice(start, this.i)
	}

	/** Reads a reference at `&` and returns its replacement text. */
	private readReference(): string {
		this.i++
		if (this.s[this.i] === "#") {
			this.i++
			const hex = this.s[this.i] === "x"
			if (hex) this.i++
			const start = this.i
			while (this.i < this.s.length && /[0-9a-fA-F]/.test(this.s[this.i] ?? "")) this.i++
			const digits = this.s.slice(start, this.i)
			if (digits === "" || (!hex && /[a-fA-F]/.test(digits)))
				throw this.fatal(
					hex
						? 'A hexadecimal representation must immediately follow the "&#x" in a character reference.'
						: 'A decimal representation must immediately follow the "&#" in a character reference.',
				)
			if (this.s[this.i] !== ";")
				throw this.fatal("The character reference must end with the ';' delimiter.")
			this.i++
			const cp = Number.parseInt(digits, hex ? 16 : 10)
			if (!isXmlChar(cp))
				throw this.fatal(
					`Character reference "&#${hex ? "x" : ""}${digits}" is an invalid XML character.`,
				)
			return String.fromCodePoint(cp)
		}
		const name = this.readName()
		if (name === undefined)
			throw this.fatal("The entity name must immediately follow the '&' in the entity reference.")
		if (this.s[this.i] !== ";")
			throw this.fatal(`The reference to entity "${name}" must end with the ';' delimiter.`)
		this.i++
		const value = own(PREDEFINED, name)
		if (value === undefined)
			throw this.fatal(`The entity "${name}" was referenced, but not declared.`)
		return value
	}

	private skipComment(): void {
		const end = this.s.indexOf("-->", this.i + 4)
		if (end < 0)
			throw this.fatal(
				"XML document structures must start and end within the same entity.",
				this.s.length,
			)
		const dashes = this.s.indexOf("--", this.i + 4)
		if (dashes < end) throw this.fatal('The string "--" is not permitted within comments.', dashes)
		this.i = end + 3
	}

	private skipPi(): void {
		const target = /^<\?([^\s?]*)/.exec(this.s.slice(this.i, this.i + 64))?.[1] ?? ""
		if (target.toLowerCase() === "xml")
			throw this.fatal('The processing instruction target matching "[xX][mM][lL]" is not allowed.')
		const end = this.s.indexOf("?>", this.i + 2)
		if (end < 0)
			throw this.fatal(
				"XML document structures must start and end within the same entity.",
				this.s.length,
			)
		this.i = end + 2
	}

	/** Misc before or after the root: whitespace, comments and processing instructions. */
	private skipMisc(): void {
		for (;;) {
			this.skipWs()
			if (this.startsWith("<!--")) this.skipComment()
			else if (this.startsWith("<?")) this.skipPi()
			else return
		}
	}

	run(): void {
		if (this.s.charCodeAt(0) === 0xfeff) this.i = 1
		if (this.startsWith("<?xml") && /[ \t\n\r?]/.test(this.s[this.i + 5] ?? "")) {
			const end = this.s.indexOf("?>", this.i)
			if (end < 0)
				throw this.fatal(
					"XML document structures must start and end within the same entity.",
					this.s.length,
				)
			const encoding = /\bencoding\s*=\s*(["'])(.*?)\1/.exec(this.s.slice(this.i, end))?.[2]
			if (encoding !== undefined && !/^[A-Za-z][A-Za-z0-9._-]*$/.test(encoding))
				throw this.fatal(`Invalid encoding name "${encoding}".`)
			this.i = end + 2
		}
		this.skipMisc()
		if (this.i >= this.s.length) throw this.fatal("Premature end of file.")
		if (this.startsWith("<!DOCTYPE"))
			throw this.fatal(
				'DOCTYPE is disallowed when the feature "http://apache.org/xml/features/disallow-doctype-decl" set to true.',
			)
		if (this.s[this.i] !== "<") throw this.fatal("Content is not allowed in prolog.")
		this.startTag()
		while (this.stack.length > 0) this.content()
		this.skipMisc()
		if (this.i < this.s.length) {
			if (this.s[this.i] === "<")
				throw this.fatal(
					"The markup in the document following the root element must be well-formed.",
				)
			throw this.fatal("Content is not allowed in trailing section.")
		}
	}

	private content(): void {
		if (this.i >= this.s.length)
			throw this.fatal("XML document structures must start and end within the same entity.")
		if (this.s[this.i] !== "<") {
			this.text()
			return
		}
		if (this.startsWith("</")) this.endTag()
		else if (this.startsWith("<!--")) this.skipComment()
		else if (this.startsWith("<![CDATA[")) {
			const end = this.s.indexOf("]]>", this.i + 9)
			if (end < 0)
				throw this.fatal(
					"XML document structures must start and end within the same entity.",
					this.s.length,
				)
			this.onText(this.s.slice(this.i + 9, end))
			this.i = end + 3
		} else if (this.startsWith("<?")) this.skipPi()
		else this.startTag()
	}

	private text(): void {
		let out = ""
		while (this.i < this.s.length && this.s[this.i] !== "<") {
			const ch = this.s[this.i] ?? ""
			if (ch === "&") {
				out += this.readReference()
				continue
			}
			if (ch === "]" && this.startsWith("]]>"))
				throw this.fatal(
					'The character sequence "]]>" must not appear in content unless used to mark the end of a CDATA section.',
				)
			const cp = this.s.codePointAt(this.i) ?? 0
			if (!isXmlChar(cp))
				throw this.fatal(
					`An invalid XML character (Unicode: 0x${cp.toString(16)}) was found in the element content of the document.`,
				)
			const width = cp > 0xffff ? 2 : 1
			out += this.s.slice(this.i, this.i + width)
			this.i += width
		}
		this.onText(out)
	}

	private onText(text: string): void {
		const top = this.stack[this.stack.length - 1]
		if (top === undefined || top.mode === Mode.Skip) return
		top.text += text
		if (!isXmlWhitespace(text)) top.sawText = true
	}

	private startTag(): void {
		this.i++
		const raw = this.readName()
		if (raw === undefined)
			throw this.fatal(
				this.stack.length === 0
					? "The markup in the document preceding the root element must be well-formed."
					: "The content of elements must consist of well-formed character data or markup.",
			)
		const attrs: { raw: string; value: string }[] = []
		let selfClose = false
		const eof = () => {
			if (this.i >= this.s.length)
				throw this.fatal("XML document structures must start and end within the same entity.")
		}
		for (;;) {
			const ws = this.skipWs()
			eof()
			if (this.s[this.i] === ">") {
				this.i++
				break
			}
			if (this.startsWith("/>")) {
				this.i += 2
				selfClose = true
				break
			}
			const name = ws ? this.readName() : undefined
			eof()
			if (name === undefined)
				throw this.fatal(
					`Element type "${raw}" must be followed by either attribute specifications, ">" or "/>".`,
				)
			this.skipWs()
			eof()
			if (this.s[this.i] !== "=")
				throw this.fatal(
					`Attribute name "${name}" associated with an element type "${raw}" must be followed by the ' = ' character.`,
				)
			this.i++
			this.skipWs()
			eof()
			const quote = this.s[this.i]
			if (quote !== '"' && quote !== "'")
				throw this.fatal(
					`Open quote is expected for attribute "${name}" associated with an  element type  "${raw}".`,
				)
			this.i++
			let value = ""
			for (;;) {
				if (this.i >= this.s.length)
					throw this.fatal("XML document structures must start and end within the same entity.")
				const ch = this.s[this.i] ?? ""
				if (ch === quote) {
					this.i++
					break
				}
				if (ch === "<")
					throw this.fatal(
						`The value of attribute "${name}" associated with an element type "${raw}" must not contain the '<' character.`,
					)
				if (ch === "&") {
					value += this.readReference()
					continue
				}
				const cp = this.s.codePointAt(this.i) ?? 0
				if (!isXmlChar(cp))
					throw this.fatal(
						`An invalid XML character (Unicode: 0x${cp.toString(16)}) was found in the value of attribute "${name}" and element is "${raw}".`,
					)
				// Attribute-value normalization: line breaks and tabs become spaces.
				if (ch === "\r" && this.s[this.i + 1] === "\n") this.i++
				const width = cp > 0xffff ? 2 : 1
				value +=
					ch === "\t" || ch === "\n" || ch === "\r" ? " " : this.s.slice(this.i, this.i + width)
				this.i += width
			}
			if (attrs.some((a) => a.raw === name))
				throw this.fatal(`Attribute "${name}" was already specified for element "${raw}".`)
			attrs.push({ raw: name, value })
		}
		const endPos = this.i - 1
		const parent = this.stack[this.stack.length - 1]
		const nsMap = this.namespaces(attrs, parent?.nsMap)
		const [prefix, local] = splitQName(raw)
		const ns = prefix === "" ? (nsMap.get("") ?? "") : this.resolvePrefix(nsMap, prefix)
		if (ns === undefined)
			throw this.fatal(`The prefix "${prefix}" for element "${raw}" is not bound.`, endPos)
		const resolved: Attr[] = []
		for (const a of attrs) {
			if (a.raw === "xmlns" || a.raw.startsWith("xmlns:")) continue
			const [ap, al] = splitQName(a.raw)
			const ans = ap === "" ? "" : this.resolvePrefix(nsMap, ap)
			if (ans === undefined)
				throw this.fatal(
					`The prefix "${ap}" for attribute "${a.raw}" associated with an element type "${raw}" is not bound.`,
					endPos,
				)
			resolved.push({ raw: a.raw, prefix: ap, local: al, ns: ans, value: a.value })
		}
		const idAttr = resolved.find((a) => a.ns === "" && a.local === "id")
		const frame: Frame = {
			raw,
			ns,
			local,
			nsMap,
			mode: Mode.Skip,
			pi: -1,
			pc: 0,
			text: "",
			sawText: false,
			sawChild: false,
			ownerId: idAttr !== undefined && idAttr.value !== "" ? idAttr.value : (parent?.ownerId ?? ""),
			skipped:
				(parent?.skipped ?? false) ||
				(ns === MODEL &&
					local === "process" &&
					resolved.find((a) => a.ns === "" && a.local === "isExecutable")?.value.toLowerCase() !==
						"true"),
			path: parent === undefined ? [0] : [...parent.path, parent.children++],
			children: 0,
		}
		if (idAttr !== undefined && !this.elementsById.has(idAttr.value))
			this.elementsById.set(idAttr.value, { ns, local })
		this.validateStart(frame, parent, resolved, endPos)
		this.collectRefs(frame, resolved)
		this.stack.push(frame)
		if (selfClose) this.finish(endPos)
	}

	private endTag(): void {
		this.i += 2
		const top = this.stack[this.stack.length - 1]
		if (top === undefined) return
		// Like Xerces, match the open element's name first, then require the '>'.
		if (!this.startsWith(top.raw))
			throw this.fatal(
				`The element type "${top.raw}" must be terminated by the matching end-tag "</${top.raw}>".`,
			)
		this.i += top.raw.length
		this.skipWs()
		if (this.s[this.i] !== ">")
			throw this.fatal(`The end-tag for element type "${top.raw}" must end with a '>' delimiter.`)
		this.i++
		this.finish(this.i - 1)
	}

	private resolvePrefix(nsMap: ReadonlyMap<string, string>, prefix: string): string | undefined {
		if (prefix === "xml") return XML_NS
		if (prefix === "xmlns") return XMLNS_NS
		const uri = nsMap.get(prefix)
		return uri === "" ? undefined : uri
	}

	private namespaces(
		attrs: readonly { raw: string; value: string }[],
		inherited: ReadonlyMap<string, string> | undefined,
	): ReadonlyMap<string, string> {
		const decls = attrs.filter((a) => a.raw === "xmlns" || a.raw.startsWith("xmlns:"))
		if (decls.length === 0 && inherited !== undefined) return inherited
		const map = new Map(inherited ?? [])
		for (const d of decls) map.set(d.raw === "xmlns" ? "" : d.raw.slice(6), d.value)
		return map
	}

	private collectRefs(frame: Frame, attrs: readonly Attr[]): void {
		if (frame.skipped || frame.ns !== MODEL || frame.ct === undefined) return
		const attr = (name: string) => attrs.find((a) => a.ns === "" && a.local === name)?.value
		if (frame.local === "sequenceFlow") {
			const source = attr("sourceRef")
			if (source !== undefined) this.flowSources.add(collapse(source))
		}
		if (!derivesFrom(frame.ct.name, "tFlowNode")) return
		frame.node = {
			local: frame.local,
			path: frame.path,
			outgoing: [],
			incoming: [],
			gateway: frame.local === "exclusiveGateway" || frame.local === "inclusiveGateway",
			id: attr("id"),
			resolvesIncoming:
				frame.local === "boundaryEvent" ||
				(derivesFrom(frame.ct.name, "tTask") &&
					attr("isForCompensation")?.toLowerCase() === "true"),
		}
		this.flowNodes.push(frame.node)
	}

	/**
	 * The exception Zeebe's validators throw resolving a flow node's `outgoing`
	 * (or a boundary event's `incoming`) to a sequence flow, for the first node in
	 * Zeebe's walk order: parents first, then children from the last to the first.
	 */
	referenceFailure(): string | undefined {
		const nodes = [...this.flowNodes].sort((a, b) => walkOrder(a.path, b.path))
		for (const node of nodes) {
			const refs = [
				...(node.gateway && !(node.id !== undefined && this.flowSources.has(node.id))
					? []
					: node.outgoing),
				...(node.resolvesIncoming ? node.incoming : []),
			]
			for (const ref of refs) {
				const text = ref.trim()
				const id = text.slice(text.indexOf(":") + 1)
				const target = this.elementsById.get(id)
				if (target === undefined)
					return `PARSE: Unable to find a model element instance for id ${id}`
				if (target.ns === MODEL && target.local !== "sequenceFlow") {
					const impl = `io.camunda.zeebe.model.bpmn.impl.instance.${target.local.charAt(0).toUpperCase()}${target.local.slice(1)}Impl`
					return `PARSE: class ${impl} cannot be cast to class io.camunda.zeebe.model.bpmn.instance.SequenceFlow`
				}
			}
		}
		return undefined
	}

	// -- schema validation ----------------------------------------------------

	private validateStart(
		frame: Frame,
		parent: Frame | undefined,
		attrs: readonly Attr[],
		pos: number,
	): void {
		let typeName: string
		if (parent === undefined) {
			const key = schemaKey(frame.ns, frame.local)
			const decl = key === undefined ? undefined : globalElement(key)
			if (decl === undefined)
				throw this.error(
					"xml-schema",
					`cvc-elt.1.a: Cannot find the declaration of element '${frame.raw}'.`,
					pos,
				)
			typeName = decl.type
		} else {
			if (parent.mode === Mode.Skip) return
			// Xerces reports children of simple or empty content at the parent's end tag.
			if (parent.mode === Mode.Simple || parent.ct?.particles.length === 0) {
				parent.sawChild = true
				// Without a content model to place it, Xerces still validates a child by its global declaration.
				const key = schemaKey(frame.ns, frame.local)
				const decl = key === undefined ? undefined : globalElement(key)
				if (decl === undefined) return
				typeName = decl.type
			} else {
				const matched = this.step(parent, frame, pos)
				if (matched === undefined) return
				typeName = matched
			}
		}
		if (typeName === EXT_TYPE) return
		const xsiType = attrs.find((a) => a.ns === XSI && a.local === "type")
		if (xsiType !== undefined) {
			const declared = typeName
			typeName = this.xsiType(frame, xsiType.value, pos)
			if (typeName !== declared && !derivesFrom(typeName, declared))
				throw this.error(
					"xml-schema",
					`cvc-elt.4.3: Type '${collapse(xsiType.value)}' is not validly derived from the type definition, '${schemaName(declared).local}', of element '${frame.raw}'.`,
					pos,
				)
		}
		if (isSimpleType(typeName)) {
			frame.mode = Mode.Simple
			frame.simple = typeName
			const extra = attrs.find((a) => a.ns !== XSI)
			if (extra !== undefined)
				throw this.error(
					"xsd-content",
					`cvc-type.3.1.1: Element '${frame.raw}' is a simple type, so it cannot have attributes, excepting those whose namespace name is identical to '${XSI}' and whose [local name] is one of 'type', 'nil', 'schemaLocation' or 'noNamespaceSchemaLocation'. However, the attribute, '${extra.raw}' was found.`,
					pos,
				)
			return
		}
		const ct = complexType(typeName)
		if (ct === undefined) return
		if (ct.abstract)
			throw this.error(
				"xml-schema",
				`cvc-type.2: The type definition cannot be abstract for element ${frame.raw}.`,
				pos,
			)
		frame.mode = Mode.Complex
		frame.ct = ct
		for (const a of attrs) {
			if (a.ns === XSI) continue
			const decl = a.ns === "" ? ct.attrs.find((d) => d.name === a.local) : undefined
			if (decl === undefined) {
				if (a.ns !== "" && ct.anyAttr && a.ns !== ct.ns) continue
				throw this.error(
					"xsd-content",
					`cvc-complex-type.3.2.2: Attribute '${a.raw}' is not allowed to appear in element '${frame.raw}'.`,
					pos,
				)
			}
			const failure = this.value(decl.type, a.value, frame.nsMap)
			if (failure !== undefined) throw this.error(failure[0], failure[1], pos)
		}
		for (const d of ct.attrs) {
			if (!d.required || attrs.some((a) => a.ns === "" && a.local === d.name)) continue
			throw this.error(
				missingAttributeRule(frame.local, d.name),
				`cvc-complex-type.4: Attribute '${d.name}' must appear on element '${frame.raw}'.`,
				pos,
			)
		}
		if (
			!frame.skipped &&
			frame.ns === MODEL &&
			!attrs.some((a) => a.ns === "" && a.local === "id") &&
			ID_REQUIRED_TYPES.some((t) => derivesFrom(typeName, t))
		)
			this.missingIds.push(parent?.ownerId ?? "")
	}

	private xsiType(frame: Frame, raw: string, pos: number): string {
		const value = collapse(raw)
		if (!isQName(value))
			throw this.error(
				"xml-schema",
				`cvc-elt.4.1: The value '${value}' of attribute '${XSI},type' of element '${frame.raw}' is not a valid QName.`,
				pos,
			)
		const [prefix, local] = splitQName(value)
		const ns = prefix === "" ? (frame.nsMap.get("") ?? "") : this.resolvePrefix(frame.nsMap, prefix)
		if (ns === XSD_NS && BUILTIN_SIMPLE.has(local)) return local
		const key = ns === undefined ? undefined : schemaKey(ns, local)
		if (key === undefined || (own(XSD_TYPES, key) === undefined && !isSimpleType(key)))
			throw this.error(
				"xml-schema",
				`cvc-elt.4.2: Cannot resolve '${value}' to a type definition for element '${frame.raw}'.`,
				pos,
			)
		return key
	}

	/** Matches a child against the parent's content model; the child's type, or `undefined` for wildcard content. */
	private step(parent: Frame, child: Frame, pos: number): string | undefined {
		const ct = parent.ct
		if (ct === undefined) return undefined
		const ps = ct.particles
		const current = ps[parent.pi]
		if (current !== undefined && parent.pc < current.max) {
			const t = matchParticle(current, child)
			if (t !== null) {
				parent.pc++
				return t
			}
		}
		if (current === undefined || parent.pc >= current.min) {
			for (let j = parent.pi + 1; j < ps.length; j++) {
				const p = ps[j]
				if (p === undefined) break
				const t = matchParticle(p, child)
				if (t !== null) {
					parent.pi = j
					parent.pc = 1
					return t
				}
				if (p.min > 0) break
			}
		}
		const short = shortBy(current, parent.pc)
		if (current !== undefined && short !== undefined)
			throw this.error(
				"xml-schema",
				`cvc-complex-type.2.4.${short === 1 ? "g" : "h"}: Invalid content was found starting with element '${child.raw}'. ${minimumMessage(current, short, " in the current sequence")}`,
				pos,
			)
		const expected = expectedAt(ps, parent.pi, parent.pc)
		if (expected.length === 0)
			throw this.error(
				"xml-schema",
				`cvc-complex-type.2.4.d: Invalid content was found starting with element '${child.raw}'. No child element is expected at this point.`,
				pos,
			)
		throw this.error(
			isDeclared(child) ? "xml-schema" : "xsd-content",
			`cvc-complex-type.2.4.a: Invalid content was found starting with element '${expandedName(child.ns, child.local)}'. One of '{${expected.join(", ")}}' is expected.`,
			pos,
		)
	}

	/** End of an element: content-model completion, simple content, and the document's IDREFs at the root. */
	private finish(pos: number): void {
		const frame = this.stack.pop()
		if (frame === undefined) return
		if (frame.mode === Mode.Complex && frame.ct !== undefined) {
			const ct = frame.ct
			if ((frame.sawText && !ct.mixed) || frame.sawChild)
				throw this.error(
					"xml-schema",
					ct.particles.length === 0
						? `cvc-complex-type.2.1: Element '${frame.raw}' must have no character or element information item [children], because the type's content type is empty.`
						: `cvc-complex-type.2.3: Element '${frame.raw}' cannot have character [children], because the type's content type is element-only.`,
					pos,
				)
			const current = ct.particles[frame.pi]
			const short = shortBy(current, frame.pc)
			if (current !== undefined && short !== undefined)
				throw this.error(
					"xml-schema",
					`cvc-complex-type.2.4.${short === 1 ? "i" : "j"}: The content of element '${frame.raw}' is not complete. ${minimumMessage(current, short, "")}`,
					pos,
				)
			if (!isComplete(ct.particles, frame.pi, frame.pc))
				throw this.error(
					"xml-schema",
					`cvc-complex-type.2.4.b: The content of element '${frame.raw}' is not complete. One of '{${expectedAt(ct.particles, frame.pi, frame.pc).join(", ")}}' is expected.`,
					pos,
				)
		} else if (frame.mode === Mode.Simple && frame.simple !== undefined) {
			if (frame.sawChild)
				throw this.error(
					"xml-schema",
					`cvc-type.3.1.2: Element '${frame.raw}' is a simple type, so it must have no element information item [children].`,
					pos,
				)
			const failure = this.value(frame.simple, frame.text, frame.nsMap)
			if (failure !== undefined) throw this.error(failure[0], failure[1], pos)
			const owner = this.stack[this.stack.length - 1]?.node
			if (owner !== undefined && frame.ns === MODEL) {
				if (frame.local === "outgoing") owner.outgoing.push(frame.text)
				else if (frame.local === "incoming") owner.incoming.push(frame.text)
			}
		}
		if (this.stack.length === 0) {
			const missing = this.idrefs.find((ref) => !this.ids.has(ref))
			if (missing !== undefined)
				throw this.error(
					"idref-resolves",
					`cvc-id.1: There is no ID/IDREF binding for IDREF '${missing}'.`,
					pos,
				)
		}
	}

	/** Validates a value against a simple type; the rule and Xerces' message on failure. */
	private value(
		type: string,
		raw: string,
		nsMap: ReadonlyMap<string, string>,
	): [ZeebeRuleName, string] | undefined {
		if (type === "string" || type === "anyURI") return undefined
		const enumeration = own(XSD_ENUMS, type)
		if (enumeration !== undefined) {
			if (enumeration.length === 0 || enumeration.includes(raw)) return undefined
			return [
				"xsd-content",
				`cvc-enumeration-valid: Value '${raw}' is not facet-valid with respect to enumeration '[${enumeration.join(", ")}]'. It must be a value from the enumeration.`,
			]
		}
		const v = collapse(raw)
		const invalid = (rule: ZeebeRuleName, name: string): [ZeebeRuleName, string] => [
			rule,
			`cvc-datatype-valid.1.2.1: '${v}' is not a valid value for '${name}'.`,
		]
		switch (type) {
			case "boolean":
				return /^(true|false|1|0)$/.test(v) ? undefined : invalid("xsd-content", "boolean")
			case "integer":
			case "int":
				return /^[+-]?[0-9]+$/.test(v) ? undefined : invalid("xsd-content", "integer")
			case "double":
				return DOUBLE.test(v) ? undefined : invalid("xsd-content", "double")
			case "ID":
				if (!isNcName(v)) return invalid("id-ncname-unique", "NCName")
				if (this.ids.has(v))
					return [
						"id-ncname-unique",
						`cvc-id.2: There are multiple occurrences of ID value '${v}'.`,
					]
				this.ids.add(v)
				return undefined
			case "IDREF":
				if (!isNcName(v)) return invalid("idref-resolves", "NCName")
				this.idrefs.push(v)
				return undefined
			case "QName": {
				if (!isQName(v)) return invalid("idref-resolves", "QName")
				const [prefix] = splitQName(v)
				if (prefix !== "" && this.resolvePrefix(nsMap, prefix) === undefined)
					return [
						"idref-resolves",
						`UndeclaredPrefix: Cannot resolve '${v}' as a QName: the prefix '${prefix}' is not declared.`,
					]
				return undefined
			}
			default:
				return undefined
		}
	}
}

/** Zeebe's `ModelWalker` order: an element before its children, later siblings before earlier ones. */
function walkOrder(a: readonly number[], b: readonly number[]): number {
	for (let k = 0; k < Math.min(a.length, b.length); k++) {
		const x = a[k] ?? 0
		const y = b[k] ?? 0
		if (x !== y) return y - x
	}
	return a.length - b.length
}

function splitQName(raw: string): [string, string] {
	const colon = raw.indexOf(":")
	return colon < 0 ? ["", raw] : [raw.slice(0, colon), raw.slice(colon + 1)]
}

/** The type a child takes when it matches the particle, `undefined` for wildcard content, `null` when it does not match. */
function matchParticle(p: Particle, child: Frame): string | undefined | null {
	for (const alt of p.alts) {
		switch (alt.kind) {
			case "any":
				return undefined
			case "other":
				if (child.ns !== alt.ns && child.ns !== "") return undefined
				break
			case "local":
				if (child.ns === alt.ns && child.local === alt.local) return alt.type ?? null
				break
			case "ref": {
				const key = schemaKey(child.ns, child.local)
				let decl = key === undefined ? undefined : globalElement(key)
				const type = decl?.type
				let name = key
				for (let guard = 0; decl !== undefined && name !== undefined && guard < 16; guard++) {
					const { ns, local } = schemaName(name)
					if (ns === alt.ns && local === alt.local) return type ?? null
					name = decl.head
					decl = name === undefined ? undefined : globalElement(name)
				}
				break
			}
		}
	}
	return null
}

function isDeclared(child: Frame): boolean {
	const key = schemaKey(child.ns, child.local)
	return key !== undefined && globalElement(key) !== undefined
}

/** What Xerces lists as allowed next: the current particle while it may repeat, then up to the next required one. */
function expectedAt(ps: readonly Particle[], pi: number, pc: number): string[] {
	const out: string[] = []
	const current = ps[pi]
	if (current !== undefined) {
		if (pc < current.max) out.push(...current.alts.map(altLabel))
		if (pc < current.min) return out
	}
	for (let j = pi + 1; j < ps.length; j++) {
		const p = ps[j]
		if (p === undefined) break
		out.push(...p.alts.map(altLabel))
		if (p.min > 0) break
	}
	return out
}

/** How many more a counted particle (minOccurs above 1) needs once it has started, or `undefined`. */
function shortBy(p: Particle | undefined, count: number): number | undefined {
	if (p === undefined || p.min <= 1 || count === 0 || count >= p.min) return undefined
	return p.min - count
}

function minimumMessage(p: Particle, short: number, where: string): string {
	const label = p.alts.map(altLabel).join(", ")
	const more =
		short === 1
			? "One more instance is required to satisfy this constraint."
			: `'${short}' more instances are required to satisfy this constraint.`
	return `'${label}' is expected to occur a minimum of '${p.min}' times${where}. ${more}`
}

function isComplete(ps: readonly Particle[], pi: number, pc: number): boolean {
	const current = ps[pi]
	if (current !== undefined && pc < current.min) return false
	for (let j = pi + 1; j < ps.length; j++) if ((ps[j]?.min ?? 0) > 0) return false
	return true
}

function missingAttributeRule(element: string, attribute: string): ZeebeRuleName {
	if (attribute === "targetNamespace" && element === "definitions") return "target-namespace"
	if (element === "sequenceFlow") return "sequence-flow-refs"
	if (element === "boundaryEvent" && attribute === "attachedToRef") return "boundary-attached-ref"
	if (element === "association" || element === "messageFlow") return "association-refs"
	return "xsd-required-name"
}

/**
 * Zeebe's parse and XSD stage (zeebe-rules.md section A, `check: "xml"`): what
 * the text must satisfy before BPMN Kit's tolerant parser reads it. Also the
 * missing ids Zeebe rejects (`id-present`), which BPMN Kit's parser cannot model,
 * and `incoming`/`outgoing` references Zeebe's validators fail to resolve.
 *
 * @returns `fatal` when Zeebe would stop at parsing, so the model rules are not run.
 */
export function checkXml(xml: string, ctx: ZeebeContext): { fatal: boolean } {
	const checker = new XmlChecker(xml)
	try {
		checker.run()
	} catch (err) {
		if (!(err instanceof XmlFailure)) throw err
		ctx.report(err.rule, "", err.message, SUGGESTIONS[err.rule] ?? "Fix the BPMN XML.")
		return { fatal: true }
	}
	const reference = checker.referenceFailure()
	if (reference !== undefined) {
		ctx.report(
			"idref-resolves",
			"",
			reference,
			"Point incoming and outgoing at the ids of existing sequence flows.",
		)
		return { fatal: true }
	}
	if (checker.missingIds.length > 0) {
		for (const owner of checker.missingIds)
			ctx.report(
				"id-present",
				owner,
				"Element id must be present and not empty.",
				SUGGESTIONS["id-present"] ?? "",
			)
		// BPMN Kit's parser cannot build a model without these ids, so the model rules cannot run.
		return { fatal: true }
	}
	return { fatal: false }
}

export type { OptimizationFinding }
