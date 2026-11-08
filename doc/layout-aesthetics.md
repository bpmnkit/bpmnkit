# Auto-layout aesthetics for new diagrams

2026-11-05. Follow-up to the Camunda eval, where an Opus judge scored rendered PNGs of new diagrams at
2.3-3.0 for bpmnkit auto-layout against 3.6-4.0 for model-drawn DI, while overlap and crossing metrics
were already near perfect. Goal: make `applyAutoLayout` on a DI-less diagram look hand-drawn.
Layouts that keep existing DI (edits) are untouched.

## Benchmark

`scripts/layout-aesthetics/` (needs a built `packages/core`):

- `scenarios.mjs`: 10 DI-less processes: linear, XOR split/join, parallel, order process, loop back,
  boundary events (interrupting + non-interrupting), sub-process, lanes in a pool, two pools with message
  flows, mixed (loop + SLA timer).
- `metrics.mjs`: deterministic metrics: size, aspect, ink density, mean gap between flow neighbours,
  bends per edge, edge-length CV, detour ratio, happy-path straightness (first-declared path drawn as
  straight segments) and axis deviation, crossings, edges through shapes, shape overlaps, label
  collisions (label on a flow, shape or other label), short labels the SVG export would wrap.
- `bench.mjs [folder] [--json out] [--compare base.json]`: runs the scenarios (plus every `.bpmn` in
  `folder`, DI discarded). `render.mjs <out>` writes `.bpmn`, `.svg` and `.png` per scenario.

Results: `doc/layout-aesthetics/{baseline,after}-{scenarios,corpus}.json`; PNGs in
`doc/layout-aesthetics/{before,after}/`. Corpus = `packages/core/tests/fixtures/roundtrip` (29 files).

## Defects found (before)

| defect | seen in |
|---|---|
| 100 px column / 80 px row gaps: wide, sparse canvas (aspect up to 13:1, ink density 0.05-0.16) | all |
| Event/gateway label centred below the shape, cut by the branch leaving through the bottom | S02, S04, S08, S10 |
| Branch conditions halfway along long edges instead of at the gateway exit | S04, S07, S08 |
| A tall sub-process pushes every branch row down, even in columns it does not occupy | S07 |
| Sub-process hung from the task line: outer flow enters off its inner spine | S07 |
| A boundary handler route drawn on top of an unrelated flow's vertical run | S10 |
| `exportSvg`: short labels ("< 1000", "SLA 4h") wrapped; "+" collapsed marker on expanded sub-processes | S02, S07, S10 |
| A participant-less primary process in a collaboration drawn at the origin, on top of the pools | corpus `miwg-B.2.0` |

## Fixes

- `semantic/place.ts`: `H_GAP` 100 → 60, `V_GAP` 80 → 60. `columnGaps` widens a gap only for a flow label
  between neighbouring columns or for event/gateway labels wider than their column; gaps beside an
  expanded container stay at 100 (its title and notes need the room; the bake-off spec's tool note
  depends on it). `bandLines` places each band's line so it clears only the shapes above/below it in its
  own columns and along its connecting flows, with room for labels and docked boundary events.
  Expanded sub-processes with an inner flow align their inner spine with the row (`axes`).
- `semantic/route.ts`: straight docking when both centres fall inside each other (sub-process on its
  spine); running along an unrelated flow counts as two crossings; boundary routes also try beside the
  gutter.
- `semantic/index.ts`: `clearExternalLabels` moves event/gateway labels above / beside the stem when a
  flow cuts them. `grid/edge-labels.ts`: optional `nearSource` set, used for gateway branch labels.
- `bpmn/auto-layout.ts`: participant-less primary process stacked below the pools.
- `bpmn/svg.ts`: labels wrap at their box width; "+" marker only on collapsed containers.

## Results

Scenario means (10 diagrams):

| metric | before | after |
|---|---|---|
| width / height (px) | 1170 / 331 | 945 / 302 |
| aspect | 4.77 | 4.05 |
| ink density | 0.16 | 0.21 |
| mean neighbour gap (px) | 105 | 65 |
| happy-path axis deviation (px) | 20.2 | 17.3 |
| label collisions per diagram | 0.8 | 0.2 |
| bends per edge | 0.40 | 0.40 |
| crossings / through shapes / overlaps | 0 / 0 / 0 | 0 / 0 / 0 |
| edge-length CV | 0.52 | 0.58 (short neighbour edges shrank, long branch edges did not) |

Corpus means (29 files): width 1467 → 1277, height 769 → 720, aspect 3.33 → 2.92, density 0.12 → 0.16,
label collisions 1.90 → 0.44, shape overlaps 0.18 → 0.05, crossings 0.87 → 0.85, bends 0.41 → 0.39;
edge-length CV 0.56 → 0.64.

Blind Opus-vision judge (20 PNGs, pairs in random order, fixed 1-5 rubric): **3.4 → 4.2**.
Per scenario before → after: S01 4→5, S02 3→4, S03 4→5, S04 3→4, S05 4→4, S06 3→4, S07 3→4, S08 3→4,
S09 4→5, S10 3→3. The judge was given our own `exportSvg` renders, not the eval's renderer.

## Left open

- S10: the SLA handler still shares the merge gutter area; the handler row would need placing next to
  its host rather than in the next free band.
- S08 (lanes): the happy path crosses lanes by design (0.43 straight); lane-internal row merging was not
  attempted.
- Message-flow names get no label bounds (3 in S09), so `exportSvg` does not draw them.
- `bakeoff/expected.bpmn` was regenerated (coordinates only: 32 `dc:Bounds`/`di:waypoint` lines), as
  allowed for coordinates-only diffs in `doc/layout-closeness-diagnosis.md`; its spec checks all pass.
