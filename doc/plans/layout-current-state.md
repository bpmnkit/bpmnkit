# Auto-layout: current state (analysis for the improvement plan)

2026-11-19. Analysis only, no code changed. Paths are relative to `packages/core/src` unless prefixed. Line numbers come from
subagent reads of `origin/main` @ 80ed2e14 and are approximate (±5); re-check before editing.

## 1. Entry points

| Entry | Where | Behaviour |
|---|---|---|
| `casen build` (new file) | `apps/cli/src/commands/build.ts:419` | `if (defs.diagrams.length === 0) defs = applyAutoLayout(defs)`: default engine, no hints. A merge gateway added by `splitMixedGateways` empties the diagrams (~:386) and forces a full re-layout. |
| `casen build --edit` | `build.ts:407-412` | `dropRewiredEdges` → `makeRoom` → `placeNewShapes` → `exportPreserving`. Never re-lays out; existing shapes stay put. |
| `casen generate --patch` | `apps/cli/src/commands/generate.ts:914` | `placeNewShapes` WITHOUT `makeRoom`. |
| `applyAutoLayout(defs, engine="semantic", hints?)` | `bpmn/auto-layout.ts:995` | Engine is a plain arg, no heuristic. Collaboration pipeline L995-1450. Hints: `grids`, `annotationSides` (`layout/types.ts:107-122`). No spacing options exposed. |
| `layoutProcess` | `layout/layout-engine.ts:19` | `grid` → `gridLayoutFlowNodes`; else `semanticLayoutProcess`. |
| `layoutFlowNodes` | `layout-engine.ts:36` | ALWAYS the legacy grid engine. Used by ascii, proxy, compact. Two divergent algorithms. |
| Other `applyAutoLayout` callers | cli generate/build-spec, proxy, editor, canvas, markdown, `plan/compile`+`merge`, `bpmn-builder`, compact, svg, `node/write` | A layout change reaches all of them. |
| Rust mirror | `crates/bpmnkit-layout` | Line-by-line port (`lib.rs:1-5`). Plain lib: no wasm/napi. Consumers: builder, text, ascii, render, conformance. |

### TS ↔ Rust map

| Rust `src/` | TS twin |
|---|---|
| `auto_layout.rs` (2627 loc) | `bpmn/auto-layout.ts` (1638) |
| `semantic/{graph,bands,place,route,mod}.rs` | `layout/semantic/*.ts` |
| `grid/*.rs`, `collaboration/*.rs` | `layout/grid/*`, `layout/collaboration/*` |
| `orthogonal.rs`, `repair.rs`, `annotations.rs`, `overlap.rs`, `types.rs`, `dmn.rs` | same-named TS |
| `js.rs` (JS `Math.round`, UTF-16 len, NaN min/max), `hash.rs` (FxHasher, perf only) | none |
| none | `layout/bench.ts`, `bpmn/place-new-shapes.ts`, `bpmn/make-room.ts` (no Rust twin found) |

### Parity enforcement

| Mechanism | Detail |
|---|---|
| TS is the oracle | `packages/core/tests/conformance-layout.test.ts` records/asserts `serialize(applyAutoLayout(parse(input), engine))` into `conformance/layout/<case>/expected/<run>.bpmn` (~120 cases, runs `semantic` + `grid`). `CONFORMANCE_RECORD=1` rewrites. |
| Rust runner | `crates/bpmnkit-conformance/src/layout.rs`; tolerance `LAYOUT_TOLERANCE = 1.0` px on x/y/width/height only; ids, order, structure exact. |
| CI | `conformance-ts` (build feel+core, `pnpm conformance:record`, `git diff --exit-code conformance/`); `conformance-rs` (fmt, clippy -D warnings, `cargo test --workspace --locked`, bench --no-run). Bench regression is nightly only (`bench-nightly.yml`). |
| Oracle fixtures | `crates/bpmnkit-layout/tests/fixtures/{semantic,grid,orthogonal,repair,annotations,...}/dump.mjs` dumped from TS. |
| Not layout | `semantic-hash.test.ts` GOLDEN hashes cover the semantic hash, not geometry. |

**Cost of any TS layout change:** port identically to Rust (same float op order, `js::round`, insertion-ordered maps) → `pnpm turbo build --filter=@bpmnkit/feel --filter=@bpmnkit/core && pnpm conformance:record`, commit the diff (also touches `text/`, `compact/`, `builder/`, `render/`, `ascii/`, `optimize/`; a past change moved 41 cases) → re-dump oracle fixtures → update hard-coded expectations in `crates/.../tests/{auto_layout,annotations}.rs` → regenerate frozen `tests/fixtures/bakeoff/expected.bpmn`, ascii `expected.txt`, `scripts/lib/closeness.test.mjs`, cli `test.test.ts`, engine cpt test → `pnpm bench:rs --update` if perf moved → `doc/progress.md`.

## 2. Algorithm per stage (semantic engine, the default)

| Stage | Where | Actual algorithm |
|---|---|---|
| Graph | `layout/semantic/graph.ts:50-100` | Boundary events leave the rank set; their flows are re-keyed to the host (`effectiveSource` :34). `dataObject` skipped. |
| Components | `graph.ts:104-128` | Weakly connected; start = first startEvent, else first no-incoming. |
| Back edges | `graph.ts:147-165` | DFS from starts; edge to a node on the stack = back edge. **Declaration-order dependent.** |
| Layering | `graph.ts:195-225` | Longest path by repeated relaxation O(V·E). Back edges ignored. `sharesRank` puts join→join of the same type in one rank. No layer balancing, no dummy nodes for long edges, no sink compaction. |
| Rows ("bands") | `bands.ts:50-90, 271-363` | Not Sugiyama. `traceSpine` greedy (non-handler, reaches end, default flow, declaration order) → band 0. `follow` walks the FIRST unassigned successor chain; side = handler side, default→below, else alternate below/above by index (`i % 2`). `compact` first-fit packs branches per side by rank-interval overlap. |
| Crossing minimisation | `bands.ts:93-165` | Weak hill-climb: `inversions()` O(E²) on (rank, band); swap adjacent same-side levels, accept only strict gain, ≤ levels sweeps. No barycenter/median, no per-column ordering. |
| Boundary side | `bands.ts:44` | escalation → up, everything else down. |
| Columns (x) | `place.ts:134-160, 232` | One column per rank, width = widest node, nodes centred. Gap = max(`H_GAP` 60, `CONTAINER_GAP` 100 if a node > 80 high, label overhang, flow-label width + 20). |
| Rows (y) | `place.ts:166-208, 316` | Band 0 at y=0; other bands pushed outward to clear any box whose x-range overlaps by `V_GAP`. Tall containers hang from the inner spine. Components stacked by `COMPONENT_GAP`. |
| Split/join alignment | implicit | Not enforced. Same band ⇒ same centre y. Branch ends are NOT aligned to a common column (each at its own rank). |
| Same-cell clash | `place.ts:518` | Post-hoc push-down in declaration order; no re-run of bandLines. |
| Edge routing | `semantic/route.ts:107` | Candidate templates, first with 0 shape hits and 0 crossings wins: straight; same-rank vertical drop; "branch" L (2 bends); "gutter turn" (4); "early gutter". Pending/back edges (widest span first) → `detour` via corridors (nearest clear y, +-20 margin, `reserve` up to 4 lanes 20 px apart) → `searchRoute` (A*). |
| A* router | `layout/orthogonal.ts:49` | Sparse orthogonal visibility grid, state (x,y,dir); bend 40, crossing 160, stub 12; port costs; region 240 then global retry. No parallel-overlap penalty, no nudging. |
| Repair | `layout/repair.ts:36` | One sequential pass: reroute edges that cut a non-related shape or their own end with A*; keeps old route on failure. Not run on collapsed child planes. |
| Edge labels | `layout/grid/edge-labels.ts:25` | Gateway-source: just past exit if segment ≥ label+12 and not crossed. Else longest segment, fractions .5/.25/.75/.33/.67, above/below; fallback slide 10 steps. If nothing fits the label bounds are dropped. Not checked against other edges' segments. |
| Event/gateway labels | `semantic/index.ts:~280` | Default centred below; 5 candidates if overlap; if all collide, stays below. |
| Boundary events | `place.ts:~760`; `route.ts` | Spread evenly on host edge: x = host.x + (i+1)·w/(n+1) − 18; farthest handler outermost. Outgoing: straight, stem 20 → gutter, or ±10 beside gutter; target left of source wraps around. Labels in gaps between stems. |
| Expanded sub-process | `semantic/index.ts:60-120, 185` | Recursive layout; size = child extent + 2·`SUB_PADDING` 50 (+28 title). Collapsed: separate plane. |
| Loops | `graph.ts:147`; `route.ts` | Back edges always via `detour`, loop corridor tries below then above, fewer crossings wins. |
| Compaction | none | No global compaction pass. |
| Annotations | `layout/annotations.ts:111` | Placed AFTER everything, so they never influence spacing. Width 200, height from 6.4 px/char estimate. Side = hint else above/below by `mainFlowY` (fallback 370). Shift search, cost 10000 if association hits a shape, 200 per cut route. Association = straight 2-point (diagonal) segment. |
| Data objects | `graph.ts`; `place.ts:681` | References are ordinary rank nodes if they have flow, else loose components stacked below. In lanes: moved under the activity. |
| Grid engine (legacy) | `layout/grid/*` | bpmn-io-style DFS walk, first successor right, others below; cell 150×140; no crossing work, no obstacle routing. |

## 3. Collaborations

| Aspect | Where | Actual behaviour |
|---|---|---|
| Per-pool layout | `auto-layout.ts:1031-1056` | Each process laid out independently; only coupling is pool order + per-pool x shift. |
| Pool order | `layout/collaboration/ordering.ts:124` | Exhaustive permutations ≤ 8 pools, else remove/reinsert. Cost = Σ link weight·\|index distance\| + depth term (`DEPTH_WEIGHT` .5) + black-box-in-middle penalty. Ignores pool height. |
| Horizontal alignment | `collaboration/alignment.ts:27-88` | Anchor on widest pool; greedy, candidates = shifts making one message vertical; Σ\|dx\|. No crossing term; shift widens the pool. |
| Pool/lane sizing | `auto-layout.ts:1097-1170`, `:172-246` | Width = header + content + 2·PADDING + alignDx. Lanes from engine bands; fallback sizes by node count (`MIN_LANE_H` declared, not a floor). |
| Lanes | `semantic/place.ts:548` | Ranks/x are global, so lanes only reorder vertically; lane band order not crossing-optimised; lane height = content + 80, min 116. |
| Message routing | `auto-layout.ts:689-860` | Per flow: candidate inter-pool gaps nearest midpoint; vertical drop at dock centre, else stem + jog (20 px steps, max 2400). Routed in declaration order vs shapes only: NOT against other message flows. Gap-mates evenly spaced, sorted by min end-x only. |
| Message labels | `collaboration/message-labels.ts:52` | First free of 4 spots / slide; `candidates[0]` (may overlap) if none. |
| Black-box pools | `auto-layout.ts:430-440,1177` | 300×60, widened to widest pool. |
| Data / annotations in pools | `auto-layout.ts:98-118, 248, 332` | Data refs not lane members; pool not grown for them. Annotations stretch the outer lane band (`stretchBands` :38). |
| Final | `auto-layout.ts:1450` | `routeRepair` once. |

### `--edit` path

| Piece | Behaviour | Weakness |
|---|---|---|
| `makeRoom` (`bpmn/make-room.ts`, GAP 50) | Longest path of new nodes → dx; shifts EVERY shape/waypoint with x ≥ anchor right edge, in all rows, pools, lanes; containers spanning it grow. | Global x shift; width only (no new-branch height); edges only shifted, not rerouted; message flows to unshifted pools kink. |
| `placeNewShapes` (`bpmn/place-new-shapes.ts`, 1493 loc) | Greedy worklist; existing shapes never move. Candidate grid (cols ≤ 120×30, rows ±20×20), first clear spot by cost; own `routeOrthogonal` port weights. | Order-dependent; lane/pool never grows in height → `unplaced`; new lanes never placed; no message-label pass; boundary spots reused when crowded. |

## 4. Constants

| Group | Values |
|---|---|
| Sizes (`layout/types.ts:6-39`) | events 36×36; tasks/call/subprocess 100×80; gateways 50×50; data object/ref 36×50, store 50×50 |
| Unused-by-semantic | `HORIZONTAL_SPACING` 50, `VERTICAL_SPACING` 60 (`types.ts:48-49`); `GRID_CELL` 150×140 |
| Semantic spacing (`place.ts:21-40`) | `H_GAP` 60, `V_GAP` 60, `CONTAINER_GAP` 100, `COMPONENT_GAP` 80, `LANE_PADDING` 40, `MIN_LANE_HEIGHT` 116, `LABEL_MARGIN` 10, `EXTERNAL_LABEL_OFFSET` 4, `GRID_GAP_X/Y` 40/20 |
| Containers | `SUB_PADDING` 50, `TITLE_BAND` 28 (`semantic/index.ts`) |
| Labels | `LABEL_CHAR_WIDTH` 7, `LABEL_MIN_WIDTH` 40, `LABEL_HEIGHT` 14 (char-count estimates, no font metrics) |
| Routing (`route.ts:8-23`) | `ROUTING_MARGIN` 20, `BOUNDARY_STEM` 20, `HIT_TOLERANCE` 2, `CROSSING_TOLERANCE` 0, `DETOUR_PENALTY` 0 (no-op knobs), `CORRIDOR_SPACING` 20, `CORRIDOR_LANES` 4 |
| A* (`orthogonal.ts`) | stub 12, margin 16, bend 40, crossing 160, region 240; seq ports right 0 / top-bottom 20 / left 80 |
| Pools (`auto-layout.ts`) | `POOL_HEADER` 30, `LANE_HEADER` 30, `PADDING` 20, `POOL_GAP` 30, black box 300×60 |
| Message flow | step 10, stem 20, stem-step 8, jog 20, max jog 2400 |
| Annotations (`annotations.ts:10-25`) | width 200, 6.4 px/char, line 14.4, pad 18/14, gap 20, preferred offset 50, blocked 10000, crossed 200 |
| Edit path | `makeRoom` GAP 50; `placeNewShapes` GAP 50, STEP 30, ROW_STEP 20, MARGIN 12, STALE_DISTANCE 12, annotation width 100 |

## 5. Tests, metrics, docs

| Item | Where | Notes |
|---|---|---|
| Aesthetic regression tests | `packages/core/tests/layout-aesthetics.test.ts`, `layout-routing.test.ts` | Routing gate: no edge through a shape/own end across 29 roundtrip fixtures. |
| Layout unit tests | `layout.test.ts`, `semantic-layout.test.ts`, `grid*.test.ts`, `collaboration-layout.test.ts`, `nested-lanes-layout.test.ts`, `make-room.test.ts`, `place-new-shapes.test.ts`, … | |
| Overlap check | `layout/overlap.ts` (`assertNoOverlap`) | Test-only; not in the pipeline. |
| Deviation bench | `layout/bench.ts`, `scripts/bench-layout.mjs` | Distance from reference DI; avg ~330 px, P90 ~555 px (older figure). |
| Aesthetic metrics | `scripts/layout-aesthetics/{scenarios,metrics,bench,render}.mjs`; results `doc/layout-aesthetics/*.json` | 10 DI-less scenarios; bends/edge, CV, detour, crossings, through-shapes, label collisions, etc. NOT in CI. |
| Closeness scorer | `scripts/lib/closeness.mjs` | Layout = 15 of 100 points. |
| Conformance + bench | see §1 | |
| TODO/FIXME | none in `layout/**`, `auto-layout.ts`, `crates/bpmnkit-layout/src` | Weaknesses are undocumented in code. |
| `doc/layout-aesthetics.md` | | Fixed gaps 100/80 → 60/60, label cuts, near-source conditions. Open: S10 SLA handler shares merge gutter; S08 lane happy path crosses lanes (0.43 straight); edge-length CV worse (.52→.58); corpus crossings ~0.85/file. Judge 3.4 → 4.2 (hand DI 3.6-4.0 in the earlier run). |
| `doc/layout-closeness-diagnosis.md` | | Open: R2 main-flow gap 50 (breaks bake-off spec check; needs annotation corner side); annotation `side` hints left/right. |
| `doc/bpmn-auto-layout-evaluation.md` | | vs upstream bpmn-auto-layout: through-shapes 0, crossings 184 (up 200), bends 815 vs 703, msg×seq 63 vs 54, deviation 264 vs 234 px. |
| `doc/agent-friction.md` | | Agents wrote A* routers after build; "layout is final" card line (`apps/cli/agent-cards/bpmn.md:16`). |
| Roadmap | `doc/roadmap.md` | No open layout item. |

## 6. Assessment: top 10 weaknesses

Effort: S ≤ 3 d, M ≈ 1-2 wk, L ≥ 3 wk (one engineer, includes Rust port and conformance re-record). Rust is a line-by-line port, so every row costs TS + roughly 1.3× in Rust, plus the conformance churn in §1.

| # | Weakness (evidence) | Why it looks worse than hand layout | Fix | Effort | Impact |
|---|---|---|---|---|---|
| 1 | **No real ordering/crossing minimisation**: adjacent band-swap hill-climb, declaration-order spine and `i % 2` side alternation (`bands.ts:93-165, 315`) | Branches land on arbitrary sides; avoidable crossings; result changes with element order | Replace band choice with a layered model: dummy nodes for long edges, barycenter/median sweeps with transpose, spine/default-flow kept straight as a constraint | L | TS+Rust rewrite of `bands.ts`, `graph.ts`, parts of `place.ts` |
| 2 | **Coordinate assignment is band-centred, not aligned**: no split/join alignment, branch ends at ragged ranks (`graph.ts:195`, `place.ts:518`) | Hand layouts keep gateway pairs level, branches symmetric, ends in one column | Brandes-Köpf (or priority/spine-based) y assignment on the layered model; align ends to a common rank (sink pull), balance symmetric branches around the split | L (couples with #1) | TS+Rust `place.ts`; all conformance moves |
| 3 | **Routing is first-fit templates + order-dependent crossings** (`route.ts:107`, `CROSSING_TOLERANCE`/`DETOUR_PENALTY` no-ops) | Detours and 4-6 bend routes where a hand layout uses one straight line or one L | Channel routing: assign each gutter/corridor a track set, order tracks to avoid crossings, centre parallel flows; keep A* only as fallback | L | TS+Rust `route.ts`, `repair.ts`, `orthogonal.ts` |
| 4 | **Parallel segments share a gutter x, no nudging** (`gutterX`, route.ts ~350) | Overlapping/touching lines at joins; ambiguous merges | Post-pass nudging: group collinear overlapping segments, spread on a track grid (subset of #3, can ship first) | S-M | TS+Rust `route.ts` |
| 5 | **Label placement is local and lossy**: edge labels not checked vs other edges, dropped when nothing fits, event/gateway labels stay overlapping, char-count widths (`edge-labels.ts`, `index.ts`, `types.ts:55`) | Labels on lines, missing labels, wrong width for CJK/long names | Unified label pass: candidate set per label (8 anchors), score vs nodes, all edge segments, other labels, lane borders; reserve label space in column gaps; wrap long names; keep a measured-width table (no font dependency) | M | TS+Rust `edge-labels`, `index`, `message-labels`; wrapping affects DI bounds |
| 6 | **Rank spacing ignores content**: fixed `H_GAP` 60, uniform 100×80 tasks, label-width widening only for adjacent flow labels (`place.ts:232`) | Gaps uniform where a hand layout is tight on short chains and spacious near branches | Per-gap spacing from edge count/bend channels needed (channel count × 20) and label demand; size tasks to name length (or at least wrap) | M | TS+Rust `place.ts`; breaks every golden |
| 7 | **Lanes are an afterthought**: global x ranks, lane = vertical re-stack, no lane-aware ordering/compaction (`place.ts:548`) | Long vertical runs, lane-crossing happy path (S08), empty space in lanes | Lane-aware ordering (crossings + lane-change penalty), per-lane track compaction, lane heights from occupied bands | M-L | TS+Rust `place.ts`, `bands.ts`, `auto-layout.ts` |
| 8 | **Collaboration pools independent; message flows routed without crossing awareness** (`auto-layout.ts:689-860`, `alignment.ts`) | Message×message crossings (15 vs 21 upstream, but msg×seq 63 vs 54), kinks on black boxes, flows through pool text | Joint pass: message-aware x alignment with pool-width penalty, then message gap track assignment ordered by x to avoid crossings, black-box docking by link position; ordering uses pool height | M | TS+Rust `auto-layout`, `alignment`, `ordering` |
| 9 | **Annotations/data objects placed last, diagonal associations** (`annotations.ts`, `place.ts:681`) | Notes at far offsets, slanted association lines, data refs as loose components far from their activity | Reserve annotation/data slots during placement (above/below the owner as part of the row, not packed after); orthogonal association routing; honour `side` hints incl. left/right | M | TS+Rust `annotations`, `place`; bake-off fixture |
| 10 | **Edit path is purely greedy and global-shifting** (`make-room.ts`, `place-new-shapes.ts`) | `--edit` results look worse than fresh builds; message flows kink; `unplaced` in lanes | Make-room per scope (row/lane/pool aware) incl. vertical growth and lane/pool height growth; local re-layout of the affected subgraph with existing shapes pinned, reusing the new engine | M-L | TS only today (no Rust twin found): cheaper, but confirm |
| 11 (bonus) | **Two engines**: legacy grid still behind `layoutFlowNodes` (ascii/proxy/compact) (`layout-engine.ts:36`) | Divergent look in ascii/compact/proxy | Route `layoutFlowNodes` through semantic; delete grid after goldens re-recorded | S-M | TS+Rust; ascii/compact goldens |
| 12 (bonus) | **Quality not gated**: aesthetics metrics not in CI; `assertNoOverlap` test-only; no TODOs mark known gaps | A rewrite cannot be judged objectively; regressions slip | Promote `scripts/layout-aesthetics` to a CI metric set with thresholds (bends/edge, crossings, label collisions, straightness, area), add hand-laid reference corpus (agent Opus layouts) and a blind-judge script | S-M | TS only; do this FIRST |

## 7. Suggested sequencing (input to the plan)

1. **Measure first (#12)**: metrics in CI + reference corpus of hand layouts. No engine work without it.
2. **Cheap wins in route/label (#4, #5)**: nudging, unified label scoring; mostly additive.
3. **Layered core (#1, #2, #6)** behind `engine: "layered"` next to `semantic`, TS first, Rust mirror, switch default after metrics beat `semantic`.
4. **Channel routing (#3)**, then lanes (#7) and collaborations (#8) on the new core.
5. **Edit path (#10)** and legacy-engine removal (#11) last.

Risk: every default-engine change re-records ~100+ conformance files and frozen fixtures; the flag-first approach keeps `semantic` goldens untouched until the switch.

## 8. Caveats

- Line numbers are from subagent reads, not re-verified line by line.
- The claim that `place-new-shapes`/`make-room` have no Rust twin is from a module-name check; confirm in `crates/` before planning.
- `doc/progress.md` entry not added (task scope: this doc only).
