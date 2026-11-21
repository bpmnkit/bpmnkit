// What counts as a `casen` that must stay, shared by rename-casen.mjs (which rewrites the rest)
// and check-casen.mjs (the CI guard that fails on any new one).
//
// The CLI is `bpmnkit` now and `casen` an alias (doc/plans/c8-workers-and-rust-cli.md §10), so
// prose and examples say `bpmnkit`. What stays, and why:
//   - history: changelogs, progress.md, plans, changesets, recorded conformance data;
//   - generated output: docspack/README text is rebuilt from the sources, never edited;
//   - migration and compatibility code: the profile dirs (`$XDG_CONFIG_HOME/casen`, `~/.casen`),
//     plugin lookup, the argv0 alias, `CASEN_*` variables;
//   - names that are not the command: `casen-<plugin>` packages and binaries,
//     `create-casen-plugin`, the `CasenPlugin` type, the `/docs/cli/casen` URL.

/** Paths (prefix or exact, repo-relative, `/`-separated) that may keep any `casen`. */
export const ALLOWED_PATHS = [
	"doc/progress.md",
	"doc/plans/",
	"docs/superpowers/",
	".changeset/",
	"pnpm-lock.yaml",
	"Cargo.lock",
	"conformance/",
	// generated; rebuilt by `pnpm --filter @bpmnkit/docspack build` and generate-readmes.mjs
	"packages/docspack/.llms/",
	"packages/camunda-docspack/",
	"apps/landing/src/generated/",
	// migration / compatibility code and its tests
	"packages/profiles/",
	"crates/bpmnkit-profiles/",
	"crates/bpmnkit-cli/tests/",
	"crates/bpmnkit-cli/src/plugin.rs",
	"crates/bpmnkit-cli/src/lib.rs",
	"crates/bpmnkit-cli/src/legacy.rs",
	"apps/cli/src/plugin-loader.ts",
	"packages/cli/lib/launch.js",
	// the rename tooling itself
	"scripts/rename-casen.mjs",
	"scripts/check-casen.mjs",
	"scripts/check-casen.test.mjs",
	"scripts/lib/casen-rules.mjs",
	"scripts/migrate-to-bpmnkit.mjs",
	"scripts/deprecate-old-packages.mjs",
	// the alias is documented under its own name
	"apps/landing/public/casen-demo.cast",
	// recorded eval prompts/results, compared byte for byte
	"scripts/eval-generation/eval-report.json",
	"scripts/eval-generation/prompts/",
	// npm keyword kept so existing searches still find the packages
	"scripts/fix-packages.mjs",
]

/** `**​/CHANGELOG.md` and binary-ish files are never scanned. */
export function isAllowedPath(path) {
	if (/(^|\/)CHANGELOG\.md$/.test(path)) return true
	return ALLOWED_PATHS.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p))
}

const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|pdf|zip|gz|wasm|cast|svg|bpmn|dmn|form)$/i

export function isScannable(path) {
	return !BINARY.test(path)
}

/**
 * A standalone command word: not part of a longer name (`casen-report`, `CasenPlugin`,
 * `create-casen-plugin`), not a path segment or file (`~/.casen`, `config/casen`, `casen.md`,
 * `cli/casen`), not an env prefix, and not the alias being documented (`alias casen`).
 */
export const CASEN = /(?<![\w./\\~@$-])(?<!\balias:? [\\"'`]*)casen(?![\w/-]|\.\w)/g

/** A whole quoted literal in code is a name/path the code relies on: review it by hand. */
export function quotedAt(line, offset) {
	const q = line[offset - 1]
	return (q === '"' || q === "'") && line[offset + 5] === q
}

const CODE = /\.(ts|tsx|js|mjs|cjs|rs|json)$/

export function isCode(path) {
	return CODE.test(path)
}

/** Lines of `text` with a standalone `casen`, as `{ line, col, text }`. */
export function findCasen(text, code = false) {
	const out = []
	text.split("\n").forEach((text, i) => {
		for (const m of text.matchAll(CASEN)) {
			// Quoted literals in code are deliberate names (alias, argv0, test inputs).
			if (code && quotedAt(text, m.index)) continue
			out.push({ line: i + 1, col: m.index + 1, text })
		}
	})
	return out
}
