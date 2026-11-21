// Records what the legacy Node CLI prints for the commands `bpmnkit` (Rust) runs natively, so
// crates/bpmnkit-cli/tests/legacy_parity.rs can compare against it. It runs the legacy command
// objects (apps/cli/src/commands/{lint,diff}.ts) in-process with a stub context, because the
// full CLI bundle needs the reebe-wasm build. Run with: pnpm exec tsx scripts/record-cli-snapshots.mjs
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const fixtures = join(root, "crates/bpmnkit-cli/tests/fixtures")
const outDir = join(root, "crates/bpmnkit-cli/tests/legacy")
mkdirSync(outDir, { recursive: true })

const { lintGroup } = await import(join(root, "apps/cli/src/commands/lint.ts"))
const { diffGroup } = await import(join(root, "apps/cli/src/commands/diff.ts"))
const lint = lintGroup.commands.find((c) => c.name === "lint")
const diff = diffGroup.commands.find((c) => c.name === "bpmn")

/** Mirrors apps/cli/src/output.ts for colour-less, non-interactive output. */
function run(command, positional, flags) {
	let stdout = ""
	const w = (s) => {
		stdout += s
	}
	const output = {
		format: "table",
		isInteractive: false,
		print(data) {
			w(typeof data === "string" ? `${data}\n` : `${JSON.stringify(data, null, 2)}\n`)
		},
		ok: (m) => w(`✓ ${m}\n`),
		info: (m) => w(`→ ${m}\n`),
	}
	return command
		.run({ positional, flags, output })
		.then(() => ({ stdout, code: 0 }))
		.catch((e) => ({ stdout, code: 1, error: e instanceof Error ? e.message : String(e) }))
}

const f = (n) => join(fixtures, n)
const cases = {
	"lint-two-errors": () => run(lint, [f("two-errors.bpmn")], {}),
	"lint-deployable": () => run(lint, [f("deployable.bpmn")], {}),
	"lint-two-errors-json": () => run(lint, [f("two-errors.bpmn")], { format: "json" }),
	"lint-deploy-json": () =>
		run(lint, [f("two-errors.bpmn")], { format: "json", profile: "deploy" }),
	"lint-categories-naming": () => run(lint, [f("two-errors.bpmn")], { categories: "naming" }),
	"diff-deployable-two-errors": () => run(diff, [f("deployable.bpmn"), f("two-errors.bpmn")], {}),
	"diff-same": () => run(diff, [f("deployable.bpmn"), f("deployable.bpmn")], {}),
	"diff-moved": () => run(diff, [f("laid-out.bpmn"), f("moved.bpmn")], {}),
	"diff-moved-json": () => run(diff, [f("laid-out.bpmn"), f("moved.bpmn")], { format: "json" }),
}
for (const [name, fn] of Object.entries(cases)) {
	const r = await fn()
	// Paths in output would leak the checkout location.
	const text = r.stdout.split(fixtures).join("<fixtures>")
	writeFileSync(join(outDir, `${name}.out`), text)
	writeFileSync(join(outDir, `${name}.code`), `${r.code}\n`)
}
console.log(`recorded ${Object.keys(cases).length} cases → ${outDir}`)
