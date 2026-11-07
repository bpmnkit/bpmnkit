import { header, pascal, rustStr, rustStrSlice, tsJson } from "./util.mjs"

export const source = "spec/feel-builtins.json"
export const schema = "spec/schema/feel-builtins.schema.json"

export function generate(spec) {
	const { builtins } = spec
	const signatures = Object.fromEntries(builtins.map((b) => [b.name, b.signatures]))
	const variadic = builtins.filter((b) => b.variadic).map((b) => b.name)

	const ts = `${header(source)}
/** Parameter names of every built-in, one list per signature, in declaration order. */
export const PARAM_SIGNATURES: Readonly<Record<string, readonly (readonly string[])[]>> = ${tsJson(signatures)}

/** Built-ins DMN also defines over a bare argument list; their arity is not checked. */
export const VARIADIC: ReadonlySet<string> = new Set(${tsJson(variadic)})
`

	const entries = builtins
		.map(
			(b) => `    FeelBuiltin {
        name: ${rustStr(b.name)},
        group: FeelBuiltinGroup::${pascal(b.group)},
        signatures: &[${b.signatures.map(rustStrSlice).join(", ")}],
        variadic: ${b.variadic === true},
    },`,
		)
		.join("\n")
	const rs = `${header(source)}
use crate::feel::{FeelBuiltin, FeelBuiltinGroup};

/// Every FEEL built-in, in spec order.
pub static FEEL_BUILTINS: &[FeelBuiltin] = &[
${entries}
];
`

	return {
		"packages/feel/src/generated/builtin-signatures.ts": ts,
		"crates/bpmnkit-spec/src/generated/feel_builtins.rs": rs,
	}
}
