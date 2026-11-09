// Rewrites the expected outputs under conformance/ from the TypeScript
// implementation, which is the oracle. The recording lives in the vitest
// suites so the encoding exists in one place; this only switches it on.
import { spawnSync } from "node:child_process"

for (const pkg of ["@bpmnkit/feel", "@bpmnkit/core", "@bpmnkit/engine", "@bpmnkit/ascii"]) {
	const r = spawnSync("pnpm", ["--filter", pkg, "exec", "vitest", "run", "conformance"], {
		stdio: "inherit",
		env: { ...process.env, CONFORMANCE_RECORD: "1" },
	})
	if (r.status !== 0) process.exit(r.status ?? 1)
}
