import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"
import {
	baselinePath,
	corpusDir,
	regressions,
	scoreDir,
} from "../../../../scripts/layout-aesthetics/score-lib.mjs"
import { compileTextSpec, keyThrownMessages } from "../commands/build-spec.js"
import { dropRewiredEdges } from "../commands/build.js"

// Layout may only get better: after a real improvement run `pnpm layout:score --update-baseline`.
it("no corpus metric is worse than doc/layout-aesthetics/baseline.json", async () => {
	const result = await scoreDir(fileURLToPath(corpusDir), {
		compileTextSpec,
		keyThrownMessages,
		dropRewiredEdges,
	})
	expect(result.errors).toEqual({})
	const baseline = JSON.parse(readFileSync(baselinePath, "utf8"))
	const { worse, missing } = regressions(baseline, result.cases)
	expect(missing, "new case: run pnpm layout:score --update-baseline").toEqual([])
	expect(worse).toEqual([])
}, 120_000)
