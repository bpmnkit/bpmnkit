# Agent onboarding check

`measure.mjs` packs `@bpmnkit/core`, installs it into a temp project and reports what an agent with only that package finds: README pointer in the first 2 KB, `AGENTS.md`, cards, `llms.txt`, d.ts comments, sizes. No LLM calls.

```sh
pnpm turbo build --filter @bpmnkit/core
node scripts/eval-agent-onboarding/measure.mjs        # exit 1 when a check fails
```

## Real before/after agent run (manual)

1. Make two empty project dirs. In the first install the previous release (`npm i @bpmnkit/core@<old>`), in the second this build (`npm i <tarball from pnpm pack>`).
2. In each, start a fresh agent session with no extra instructions and the same task, for example: "Write a Camunda 8 order process with a risk decision and a review form, lint it, and write the files."
3. Compare from the session logs: tokens spent before the first script runs, files read under `node_modules/@bpmnkit/core` (the card, or README + `.d.ts`), lint errors on the first run, and total cost. Repeat at least three times per arm; one run is noise.
4. Success: the new arm reads `AGENTS.md` or a card first and spends fewer tokens on docs.
