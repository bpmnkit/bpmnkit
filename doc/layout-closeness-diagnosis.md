# Layout closeness diagnosis (C8)

2026-11-05. Diagnosis of the bake-off layout gap (7.7/15 against 9.5; mean shape offset 194 px,
`doc/agent-bpmn-bakeoff-rerun.md`). Outcome: R3 and R1 shipped (see "Status"); R2 is blocked by a spec test.

## Premise corrections

- `packages/core/tests/fixtures/bakeoff/expected.bpmn` is our own builder output, not the canonical.
  `tests/bakeoff-ai-agent-chat.test.ts:264` asserts that `build.ts` exports it byte for byte, so it scores 0 px
  against itself. The canonical is `experiments/ai-agent-bpmn/scorer/canon/canonical.bpmn` in
  `HanselIdes/bpmn-js-cli` (branch `camunda-executable`).
- The scorers differ. The external `closeness.py` translates both diagrams to the top-left corner of their
  shared shapes before it measures. `scripts/lib/closeness.mjs` `layout()` (:461-474) compares absolute
  centres. Because of that, the two can rank changes differently.
- `placeGrid` order is already right. `fill: "column"` puts users/recipes left and joke/products right, as in
  the canonical. No order hint is needed.

## Baseline (`expected.bpmn` against the canonical)

| measure | value |
|---|---|
| `closeness.mjs`, id mode | total 82.4, layout 9.2/15, `meanOffsetPx` 153.6 (absolute) |
| origin-aligned (`closeness.py`) | 193.6 px, layout 7.7/15. This matches the rerun. |
| annotation id coverage | 10/13 shapes. Annotation ids differ from the canonical; the spec names none. This costs 0.8 points no layout rule can recover. |
| bench (`node scripts/bench-layout.mjs packages/core/tests/fixtures/roundtrip --top 0`) | 29 files, 0 order violations, global avg 330.7 px, P90 555.1 px |

## Offset by element class (origin-aligned; absolute in brackets)

| class | n | mean px | share |
|---|---|---|---|
| main flow (start, 2 gateways, user task, end) | 5 | 242 [141] | 62% [46%] |
| ad-hoc sub-process `AI_Agent` | 1 | 138 [167] | 7% [11%] |
| tools in the 2×2 grid | 4 | 147 [166] | 30% [43%] |
| annotations | 3 | not scored | 0 |

## Causes and general rules

| rule | cause (code) | origin-aligned px / layout | absolute px / layout |
|---|---|---|---|
| R1 | A tall container is centred on its row (`semantic/place.ts:137-142`). The canonical hangs it from the task line (top = row centre − 40). The rule also needs straight-flow docking in `semantic/route.ts:376` whenever the source centre falls within the target's height. | 157.5 / 8.7 | 91.5 / 11.6 |
| R2 | Main-column gap `H_GAP = 100` (`place.ts:8, 104-105`). Canonical gaps are 45-87 px. The rule: about 50 px, wider only where a gutter carries a label or corridor lanes. | 106.2 / 10.0 | 142.3 / 9.7 |
| R3 | Loose-node grid (`placeGrid`, `place.ts:207-213`) uses routing gaps 100/80. Loose nodes have no flows, so 40/20 (plus label room) is enough. | 149.0 / 8.9 | 136.4 / 9.9 |
| R1+R2+R3 | together | 11.4 / 12.4 | 125.8 / 10.3 |

Sub-process padding (50 + 28 px title band) is minor; matching the canonical's padding does not help once
R1-R3 apply. It is not a general rule.

R3 was tried: corpus avg 330.7 → 330.1 px, P90 555.1 → 553.4 px (only `miwg-C.6.0` changes:
775.4 → 760.0 px), all core tests green except the byte-exact fixture test.

## Status (2026-11-05)

- Shipped R3 and R1, after the parent decided that `expected.bpmn` may be regenerated for coordinates-only diffs
  (36 `dc:Bounds` and 40 `di:waypoint` lines). Corpus: avg 330.7 → 330.1 px, P90 555.1 → 553.4 px, 0 order
  violations. Bake-off: 193.6 → 120.9 px, layout 7.7 → 10.5/15.
- Shipped: `closeness.mjs` `layout()` is translation-invariant (next step 2), so it now gives 193.6 px / 7.7 for
  the baseline, the same as `closeness.py`.
- Not shipped: R2. With the 50 px gap, `bakeoff-ai-agent-chat.test.ts` ("the tool note right of the agent, below
  the user task") fails, with `"below"` and with `"right"` alike. R2 measured: corpus avg 326.7 px, P90 534.6 px;
  bake-off 11.4 px. To ship it, either relax that spec check or add a corner side to the annotation packer.

## Why no fix shipped at first

All three rules change the layout of `build.ts`, so `expected.bpmn` would have to be regenerated. That
fixture is frozen on purpose and shared: `packages/engine/tests/cpt/run.test.ts`
(`doc/cpt-on-reebe-parity.md` lists it as "unchanged"), `packages/ascii/tests/bakeoff.test.ts`
(`expected.txt`), `scripts/lib/closeness.test.mjs` and `apps/cli/src/commands/test.test.ts`. The task rule
is that existing layout tests stay green without being rewritten, so this is reported, not worked around.

## Next steps (need a decision)

1. Allow regenerating `expected.bpmn` and `expected.txt` for a deliberate layout change. Then ship R3 first
   (low risk: no edges run through a loose grid), then R1 with its docking rule, then R2 (most risk: re-run
   the bench and the ascii fixtures).
2. Make `closeness.mjs` `layout()` translation-invariant, as `closeness.py` is. Without it, absolute
   margins dominate, and R1+R2+R3 scores worse than R1 alone in id mode.
3. With C7 in place, `build.ts` can pass `side: "left"` for the `AI_Agent` note and `side: "right"` for
   `FetchSafeJoke`, as the canonical places them. Neither scorer measures annotations, so this is visual only.
   It also changes `expected.bpmn`, so it waits on step 1.
