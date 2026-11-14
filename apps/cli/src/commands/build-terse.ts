/**
 * Shorthand the `casen build` text spec accepts on top of the line format, rewritten
 * line by line (line numbers stay) before the spec is read:
 *
 * - `[user Review expense]` without an id gets one from its name (`reviewExpense`);
 * - a node or pool may later be named instead of its id (`Review expense > …`);
 * - service/send tasks and message throws default `job=` to the id kebab-cased;
 * - message events and receive tasks default `msg=` to the name kebab-cased.
 *
 * It lives here and not in the core line format so the Rust text reader needs no mirror.
 */

/** `[` … `]` with an optional id before it, or a branch label `>(` … `)`. */
interface Span {
	start: number
	end: number
	kind: "decl" | "label"
	id?: string
	body: string
}

const ID_BEFORE = /([A-Za-z_][\w.-]*)$/
const ID_ATTR = /(^|[\s|])id=([A-Za-z_][\w.-]*)(?=\s|$)/
const ID = /^[A-Za-z_][\w.-]*$/
const JOB_KINDS = /^(?:service|send|(?:end|throw):message)$/
const MESSAGE_KINDS = /^(?:(?:start|catch|boundary|end|throw):message|receive)$/

/** Index of the bracket closing the one at `from`, or -1. */
function closing(line: string, from: number, open: string, close: string): number {
	let depth = 0
	for (let i = from; i < line.length; i++) {
		if (line[i] === open) depth++
		else if (line[i] === close && --depth === 0) return i
	}
	return -1
}

function spans(line: string): Span[] {
	const out: Span[] = []
	for (let i = 0; i < line.length; i++) {
		if (line.startsWith(">(", i)) {
			const end = closing(line, i + 1, "(", ")")
			if (end < 0) break
			out.push({ start: i, end: end + 1, kind: "label", body: line.slice(i, end + 1) })
			i = end
		} else if (line[i] === "[") {
			const end = closing(line, i, "[", "]")
			if (end < 0) break
			const before = ID_BEFORE.exec(line.slice(0, i))?.[1]
			let body = line.slice(i + 1, end)
			// `[service Authorize card | id=authorizeCard job=…]`: the id written as an attribute.
			let id = before
			if (id === undefined) {
				const attr = ID_ATTR.exec(body)
				if (attr !== null) {
					id = attr[2]
					body = body.replace(ID_ATTR, "$1").replace(/\s*\|\s*$/, "")
				}
			}
			out.push({
				start: before === undefined ? i : i - before.length,
				end: end + 1,
				kind: "decl",
				id,
				body,
			})
			i = end
		}
	}
	return out
}

/** `user Review expense | fields=…` → kind `user`, name `Review expense`. */
function parts(body: string): { kind: string; name: string } {
	const head = body.split("|")[0]?.trim() ?? ""
	const space = head.search(/\s/)
	return space < 0
		? { kind: head, name: "" }
		: { kind: head.slice(0, space), name: head.slice(space + 1).trim() }
}

/** `Review expense?` → `reviewExpense`; empty when the name has no letters to use. */
export function camelId(name: string): string {
	const words = name
		.normalize("NFKD")
		.replace(/[^A-Za-z0-9]+/g, " ")
		.trim()
		.toLowerCase()
		.split(" ")
		.filter(Boolean)
	const id = words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join("")
	return /^[a-z_]/.test(id) ? id : ""
}

/** `reviewExpense` → `review-expense`. */
export function kebab(id: string): string {
	return id
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/[_.\s]+/g, "-")
		.toLowerCase()
}

const nameKey = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase()

function hasAttr(body: string, key: string): boolean {
	return new RegExp(`(?:^|[\\s|,])${key}=`).test(body)
}

/** Adds `key=value` right after the `|`, ahead of a `feel=`/`cond=` that must stay last. */
function withAttr(body: string, key: string, value: string): string {
	const bar = body.indexOf("|")
	return bar < 0
		? `${body.trimEnd()} | ${key}=${value}`
		: `${body.slice(0, bar + 1)} ${key}=${value}${body.slice(bar + 1)}`
}

export interface Desugared {
	text: string
	fixes: string[]
	problems: string[]
}

/** Rewrites the shorthand into the plain spec; see the module comment. */
export function desugarSpec(text: string, poolId: (name: string) => string): Desugared {
	const lines = text.split(/\r?\n/)
	const fixes: string[] = []
	const problems: string[] = []
	const isPath = (line: string) => {
		const t = line.trim()
		return t !== "" && !t.startsWith("#") && !t.startsWith("//") && t !== "}"
	}

	// Pass 1: the ids written, then one for each node written without.
	const taken = new Set<string>()
	const byName = new Map<string, string | null>()
	const pools = new Map<string, string>()
	const lineSpans = lines.map((l) => (isPath(l) ? spans(l) : []))
	for (const [n, line] of lines.entries()) {
		const t = line.trim()
		if (t.startsWith("##") && !t.startsWith("###")) {
			const [name = "", ...rest] = t.slice(2).split("|")
			const id = /(?:^|\s)id=(\S+)/.exec(rest.join(" "))?.[1] ?? poolId(name.trim())
			pools.set(nameKey(name), id)
			taken.add(id)
		}
		for (const s of lineSpans[n] ?? []) if (s.id !== undefined) taken.add(s.id)
	}
	const derived: string[] = []
	const counters = new Map<string, number>()
	for (const list of lineSpans)
		for (const s of list) {
			if (s.kind !== "decl") continue
			const { kind, name } = parts(s.body)
			if (s.id === undefined) {
				const base =
					(kind !== "annotation" && camelId(name)) ||
					(kind === "annotation"
						? "note"
						: kind.replace(/:(\w)/g, (_m, c: string) => c.toUpperCase()))
				let id = base
				for (let i = counters.get(base) ?? 2; taken.has(id); i++) {
					id = `${base}${i}`
					counters.set(base, i + 1)
				}
				taken.add(id)
				s.id = id
				derived.push(`${id} (${name || kind})`)
			}
			if (name === "" || kind === "annotation") continue
			const key = nameKey(name)
			// A name two nodes share names neither: the reader must use the id.
			byName.set(key, byName.has(key) && byName.get(key) !== s.id ? null : s.id)
		}
	if (derived.length > 0) fixes.push(`ids from names: ${derived.join(", ")}`)

	const resolve = (segment: string, n: number): string => {
		const word = segment.trim()
		if (word === "" || taken.has(word)) return segment
		const key = nameKey(word)
		const id = byName.has(key) ? byName.get(key) : pools.get(key)
		// An undeclared id is the reader's to report, in its own words.
		if (id === undefined && ID.test(word)) return segment
		if (id === undefined || id === null) {
			problems.push(
				`line ${n}: "${word}" ${id === null ? "names more than one node; use its id" : "names no node or pool; declare it id[kind Name] or use its id"}`,
			)
			return segment
		}
		return segment.replace(word, id)
	}

	// Pass 2: write the ids, defaults and resolved names back.
	const out = lines.map((line, index) => {
		const list = lineSpans[index] ?? []
		if (!isPath(line)) return line
		const n = index + 1
		let masked = ""
		let last = 0
		for (const [i, s] of list.entries()) {
			masked += `${line.slice(last, s.start)}${s.kind === "label" ? "\uE001" : "\uE000"}${i}\uE002`
			last = s.end
		}
		masked += line.slice(last)
		// A message flow's label (after the first ":" past "~>") is text, not a reference.
		const arrow = masked.lastIndexOf("~>")
		const colon = arrow < 0 ? -1 : masked.indexOf(":", arrow)
		const head = colon < 0 ? masked : masked.slice(0, colon)
		const tail = colon < 0 ? "" : masked.slice(colon)
		const isNoteLine = /^\s*(?:note|doc)\s/.test(head) && arrow < 0
		const resolved = isNoteLine
			? head
			: head
					.split(/(~>|\.\.>|>|\{|[\uE000\uE001]\d+\uE002)/)
					.map((seg, i) => (i % 2 === 1 ? seg : resolve(seg, n)))
					.join("")
		return `${resolved}${tail}`.replace(/[\uE000\uE001](\d+)\uE002/g, (_m, i: string) => {
			const s = list[Number(i)] as Span
			if (s.kind === "label") return s.body
			const { kind, name } = parts(s.body)
			let body = s.body
			if (/(?:^|[\s|])key==/.test(body)) {
				body = body.replace(/((?:^|[\s|])key)==/, "$1=")
				fixes.push(`line ${n}: "key==" is a typo for "key="; corrected`)
			}
			const id = s.id ?? ""
			if (JOB_KINDS.test(kind) && !hasAttr(body, "job")) body = withAttr(body, "job", kebab(id))
			const messages = MESSAGE_KINDS.test(kind) || (kind === "catch" && hasAttr(body, "key"))
			if (messages && !hasAttr(body, "msg"))
				body = withAttr(body, "msg", kebab(camelId(name) || id))
			return `${id}[${body}]`
		})
	})
	return { text: out.join("\n"), fixes, problems }
}
