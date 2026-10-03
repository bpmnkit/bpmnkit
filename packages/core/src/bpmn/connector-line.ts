/**
 * `with` lines: how a model configures a connector in the line format.
 *
 * ```
 * with post: slack chat.postMessage | data.channel=#ops | data.text== "Order " + orderId
 * with fetch: http GET https://api.example.com/orders | result=order
 * ```
 *
 * A line names a node already written by its id, the connector by its alias,
 * the operation when the connector has several, and the inputs as
 * `key=value` (`key==expr` for FEEL). Path lines are unchanged, so a `with`
 * line can follow anywhere and a diagram streams as before.
 *
 * This module only reads the line. Which connector an alias names, which keys
 * it has and what it writes is `@bpmnkit/core/connectors`' part, so the parser
 * stays free of the catalog's data.
 *
 * @packageDocumentation
 */

import type { ProcessTextProblem } from "./process-text.js"

/** One `with` line, as written. Nothing is resolved against the catalog yet. */
export interface ConnectorLine {
	/** The node's id as written. */
	id: string
	/** The connector alias, e.g. `slack`. */
	alias: string
	/**
	 * The words after the alias, before the first `|`: the operation, and for
	 * some connectors values written without a key (`http GET <url>`). A word
	 * starting with `=` or a quote runs to the end of the head.
	 */
	args: string[]
	/** `key=value` parts, in the order written; a later key wins. */
	values: Record<string, string>
	line: number
}

/** `with <id>:` at the start of a line. */
export const CONNECTOR_LINE = /^with\s+([A-Za-z_][\w.-]*)\s*:\s*(.*)$/i

/** Splits on `|` outside quotes, brackets, braces and parentheses. */
function splitParts(text: string): string[] {
	const parts: string[] = []
	let depth = 0
	let quote: string | undefined
	let start = 0
	for (let i = 0; i < text.length; i++) {
		const ch = text[i]
		if (quote !== undefined) {
			if (ch === "\\") i++
			else if (ch === quote) quote = undefined
		} else if (ch === '"' || ch === "'") quote = ch
		else if (ch === "(" || ch === "[" || ch === "{") depth++
		else if (ch === ")" || ch === "]" || ch === "}") depth = Math.max(0, depth - 1)
		else if (ch === "|" && depth === 0) {
			parts.push(text.slice(start, i))
			start = i + 1
		}
	}
	parts.push(text.slice(start))
	return parts.map((p) => p.trim())
}

/**
 * `a=1 b=2 c==x + 1`, several inputs in one part as the cards list them, split
 * into one part each: at a space before `key=`, outside quotes and brackets.
 * A FEEL value runs to the end of the part, as it may hold `=` itself.
 */
function splitPairs(part: string): string[] {
	const pairs: string[] = []
	let depth = 0
	let quote: string | undefined
	let start = 0
	for (let i = 0; i < part.length; i++) {
		const ch = part[i]
		if (quote !== undefined) {
			if (ch === "\\") i++
			else if (ch === quote) quote = undefined
		} else if (ch === '"' || ch === "'") quote = ch
		else if (ch === "(" || ch === "[" || ch === "{") depth++
		else if (ch === ")" || ch === "]" || ch === "}") depth = Math.max(0, depth - 1)
		else if (ch === "=" && part[i + 1] === "=" && depth === 0) break
		else if (/\s/.test(ch ?? "") && depth === 0 && /^\s+[A-Za-z_][\w.]*\*?=/.test(part.slice(i))) {
			pairs.push(part.slice(start, i))
			start = i + 1
		}
	}
	pairs.push(part.slice(start))
	return pairs.map((p) => p.trim()).filter((p) => p !== "")
}

function headWords(head: string): string[] {
	const words: string[] = []
	let rest = head.trim()
	while (rest !== "") {
		if (rest.startsWith("=") || rest.startsWith('"') || rest.startsWith("'")) {
			words.push(rest)
			break
		}
		const space = rest.search(/\s/)
		words.push(space < 0 ? rest : rest.slice(0, space))
		rest = space < 0 ? "" : rest.slice(space).trim()
	}
	return words
}

/**
 * Reads a `with` line, or answers `undefined` when the line is not one.
 *
 * Never throws: a line that starts like one but cannot be read becomes a
 * problem, and the parts it could read are kept.
 */
export function parseConnectorLine(
	text: string,
	line: number,
	problems: ProcessTextProblem[],
): ConnectorLine | undefined {
	const match = CONNECTOR_LINE.exec(text.trim())
	if (!match) return undefined
	const [, id = "", body = ""] = match
	const [head = "", ...rest] = splitParts(body)
	const [alias, ...args] = headWords(head)
	if (alias === undefined) {
		problems.push({ line, message: `"with ${id}:" names no connector; ignored` })
		return undefined
	}
	const values: Record<string, string> = {}
	for (const part of rest.flatMap(splitPairs)) {
		const eq = part.indexOf("=")
		// `token*={{secrets.T}}`: the card's required mark copied with the key
		const key = eq < 0 ? "" : part.slice(0, eq).trim().replace(/\*$/, "")
		if (eq <= 0 || !/^[\w.:$-]+$/.test(key)) {
			problems.push({ line, message: `expected "key=value" at "${part.slice(0, 30)}"; ignored` })
			continue
		}
		values[key] = part.slice(eq + 1).trim()
	}
	return { id, alias: alias.toLowerCase(), args, values, line }
}
