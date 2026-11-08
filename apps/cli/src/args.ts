import type { ParsedFlags } from "./types.js"

export interface ParseResult {
	positional: string[]
	flags: ParsedFlags
	/** Every value of each flag given more than once, in order; `flags` keeps only the last. */
	repeated: Record<string, string[]>
}

/**
 * Parse argv tokens into positional arguments and flags.
 *
 * Supports:
 *   --flag value        string / number flag
 *   --flag=value        alternative syntax
 *   --flag              boolean flag (true)
 *   --no-flag           boolean flag negation (false)
 *   -f value            short flag
 *   -f=value            short flag with equals
 *   --                  stop flag parsing; everything after is positional
 */
export function parseArgs(argv: string[]): ParseResult {
	const positional: string[] = []
	const flags: ParsedFlags = {}
	let i = 0
	let stopFlags = false
	// Every occurrence of a flag, for the ones given more than once.
	const seen = new Map<string, string[]>()
	const set = (name: string, value: string | number | boolean): void => {
		flags[name] = value
		seen.set(name, [...(seen.get(name) ?? []), String(value)])
	}

	while (i < argv.length) {
		const arg = argv[i] ?? ""

		if (stopFlags || arg === "") {
			positional.push(arg)
			i++
			continue
		}

		if (arg === "--") {
			stopFlags = true
			i++
			continue
		}

		if (arg.startsWith("--")) {
			const raw = arg.slice(2)
			const eqIdx = raw.indexOf("=")

			if (eqIdx >= 0) {
				// --flag=value
				const name = raw.slice(0, eqIdx)
				const value = raw.slice(eqIdx + 1)
				set(name, coerce(value))
			} else if (raw.startsWith("no-")) {
				// --no-flag → false
				set(raw.slice(3), false)
			} else {
				// --flag [value?]
				const next = argv[i + 1]
				if (next !== undefined && !next.startsWith("-")) {
					set(raw, coerce(next))
					i++
				} else {
					set(raw, true)
				}
			}
		} else if (arg.startsWith("-") && arg.length === 2) {
			// -f [value?]
			const short = arg.slice(1)
			const next = argv[i + 1]
			if (next !== undefined && !next.startsWith("-")) {
				set(short, coerce(next))
				i++
			} else {
				set(short, true)
			}
		} else if (arg.startsWith("-") && arg.length > 2 && arg[2] !== "-") {
			// -fVALUE or -f=VALUE
			const short = arg[1] ?? ""
			const rest = arg.slice(2).replace(/^=/, "")
			set(short, coerce(rest))
		} else {
			positional.push(arg)
		}

		i++
	}

	const repeated: Record<string, string[]> = {}
	for (const [name, all] of seen) if (all.length > 1) repeated[name] = all
	return { positional, flags, repeated }
}

/** Coerce string to number or boolean if it looks like one. */
function coerce(value: string): string | number | boolean {
	if (value === "true") return true
	if (value === "false") return false
	const n = Number(value)
	if (!Number.isNaN(n) && value.trim() !== "") return n
	return value
}

/** Resolve a flag value with a fallback, returning it as a string. */
export function flagStr(flags: ParsedFlags, name: string, short?: string): string | undefined {
	const v = flags[name] ?? (short ? flags[short] : undefined)
	return v !== undefined ? String(v) : undefined
}

/**
 * Every value a flag was given, in order — `--set a=1 --set b=2` yields both,
 * where `flags.set` holds only the last. Empty when the flag is absent or a
 * bare switch.
 */
export function flagAll(
	flags: ParsedFlags,
	repeated: Record<string, string[]> | undefined,
	name: string,
): string[] {
	const all = repeated?.[name]
	if (all) return all
	const single = flags[name]
	return typeof single === "boolean" || single === undefined ? [] : [String(single)]
}

const SECRET_FLAG_RE = /secret|password|token/i

/**
 * The flags as they may be written to the audit log. A flag named like a
 * secret is masked, and so is `--set`: its values are `key=value` pairs
 * whatever the flag is called, and a value can be a credential.
 */
export function redactFlagsForAudit(flags: ParsedFlags): ParsedFlags {
	const out: ParsedFlags = {}
	for (const [k, v] of Object.entries(flags)) {
		out[k] = SECRET_FLAG_RE.test(k) || k === "set" ? "***" : v
	}
	return out
}

/** Resolve a flag value as a boolean. */
export function flagBool(flags: ParsedFlags, name: string, short?: string): boolean {
	const v = flags[name] ?? (short ? flags[short] : undefined)
	return v === true || v === "true" || v === 1
}
