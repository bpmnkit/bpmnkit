# Auto-layout improvement plan: beat Bare-Opus on looks

2026-11-19. Plan only, nothing implemented.

Inputs:
- `doc/plans/layout-current-state.md`: the engine map and its weaknesses W1–W12.
- The eval repo's `eval/v4/report/layout-analysis.md`: metrics, deficits D1–D8 and Opus rules R1–R14.

## Diagnosis

bpmnkit 1.15 already wins on **defects**:
- 0 edges through shapes, against Bare-Opus S16X 22±31;
- 0 label-on-label overlaps, against 4.7;
- run-to-run SD of about 0.

It loses on **composition**:
- ragged pool frames;
- a pool order that ignores story order;
- Z-routed message flows;
- no shared columns and no grid;
- exception handlers spread over several rows;
- artifacts far from their task.

Most of that is a small set of deterministic post-placement rules, not a Sugiyama rewrite. So the plan does the cheap composition rules first, gated by metrics, and only then rebuilds the core. Phases 0–2 should close the visible gap; phases 3–4 make it robust beyond the three eval scenarios.

## Key enabler: offline replay

Each eval run keeps the agent's `casen build` input (`runs-setup2/<S>/toolgatenext-*/r*/ws/*.txt`). Replaying those specs through a local bpmnkit build produces the exact diagram the agent would get:
- no LLM, no cluster, seconds per run, 0 $;
- compared with Bare-Opus `.bpmn` as the reference.

This is the main acceptance loop. A full eval rerun happens once, at the end.

## Acceptance gates

These are layout metrics, measured on the replay corpus. "≤ BO" means "less than or equal to the Bare-Opus mean".

| Metric | Now (tgn Opus) | Bare-Opus | Gate |
|---|---|---|---|
| Edges through shapes / label overlaps | 0 / 0 | 22 / 4.7 | stay 0 / 0 |
| Run-to-run SD | ~0 | high | stay ~0 |
| S16X pool width SD | 969 | 19 | 0 |
| S16X left-padding SD | 406 | 211 | ≤ 20 |
| S16X msg bends/flow | 1.86 | 0.49 | ≤ 0.5 |
| S16X non-vertical msg % | 56 | 20 | ≤ 20 |
| S16X msg×seq crossings | 31 | 16 | ≤ 16 |
| S16X msg×msg crossings | 2.6 | 16 | ≤ 3 |
| S16X area/node | 131k | 93k | ≤ 95k |
| S04 width | 905 | 712 | ≤ 720 |
| S04 seq crossings / bends per flow / max bends | 1 / 0.33 / 2 | 0 / 0.07 / 0.6 | 0 / ≤ 0.1 / ≤ 1 |
| Shared centre-x % (S16X / S11) | 65 / 3 | 98 / 15 | ≥ 95 / ≥ 15 |
| Origins on a 10 px grid | 3–16 % | 30–39 % | 100 % |
| Boundary labels crossed by an edge (S11) | 0.6–2 | 0 | 0 |
| Max bends per seq flow (S16X) | 4 | 2.7 | ≤ 2 |
| Labels crossed by an edge (S16X) | 15.8 | 21 | ≤ 8 |

Two further gates apply on top of the metrics:
- **Visual gate:** a blind pairwise Opus judge, tgn-replay vs Bare-Opus, with the same scenario and swapped sides. The new layout must win ≥ 60 %.
- **Regression gate:** the existing aesthetics corpus (`scripts/layout-aesthetics`) and the 29 routing fixtures must not get worse.

## Phases

### P0: Measure (prerequisite; Sonnet, about 3 d)

1. Port `layout_metrics.py` to `scripts/layout-aesthetics/metrics.mjs`, keeping one metric set (W12).
2. Add `fixtures/layout-corpus/`:
   - the S04, S11 and S16X tgn specs (3 models × 3 runs, deduplicated);
   - the Bare-Opus `.bpmn` files as references;
   - the existing 10 aesthetics scenarios.
3. Add `pnpm layout:score`. It writes a JSON and a markdown table against the gates and is used in CI as a ratchet: it fails if any metric gets worse than `doc/layout-aesthetics/baseline.json`.
4. Add `pnpm layout:judge`, which runs the blind pairwise judge and stays manual (it costs money). It reuses the eval `judge.py` prompt.
5. Render a side-by-side PNG per corpus case (reuse `render_thumbs.cjs`), so every PR shows before and after.

### P1: Collaboration composition (largest visual payoff; Opus, about 1.5 wk)

These are changes to `auto-layout.ts` and `collaboration/*`, with the Rust twin in `auto_layout.rs` and `collaboration/`.

1. **Uniform frame (D1, R7).** After the per-pool layout:
   - give every pool `x = min x` and `width = max width`;
   - shift each process's content so that its first layer starts at the same `contentX`, which puts all start events in one column;
   - set the black-box pools to the same width.
2. **Pool order (D2, R8)**, by rewriting the `ordering.ts` cost:
   - put black-box partners at the top or bottom edge, as a hard constraint chosen by link majority;
   - order executable pools topologically by message flow, then by first-start order;
   - make the cost include pool height, so long flows are penalised by px and not by index distance.
3. **Message-flow alignment (D3, R9)**, by replacing the greedy `alignment.ts` with a joint pass:
   - for each message flow, try to move the receiving node's *column* within its pool slack to the sender's centre-x, using per-pool column shifts that keep the pool's internal order;
   - try the sender side when the receiver has no slack;
   - aim for a straight vertical line;
   - when that fails, use a single Z with its horizontal part in the middle of the inter-pool gap.
4. **Message track assignment (W8).** For flows that share a gap:
   - sort them by x interval;
   - assign them to tracks with interval-graph colouring;
   - avoid the y values already taken by other gaps' flows.

   This removes the bundles of parallel runs on the same y.
5. **Duplicate partners (optional, R8).** Behind a flag, a black-box partner that talks to non-adjacent pools can be repeated next to each of them. This needs the user's consent because it changes the semantics of the drawing, so it is off by default.

Exit:
- all S16X gates pass;
- the S04 and S11 gates do not regress;
- conformance is re-recorded;
- the Rust port is at parity within 1 px.

### P2: Process-level composition (Sonnet, about 1.5 wk; can run in parallel with P1)

These are changes to `semantic/place.ts`, `route.ts`, `annotations.ts` and `edge-labels.ts`, plus the Rust twins.

1. **Exception row (D6, R4).**
   - Place a boundary handler in its host's column: x = the host's centre.
   - Give all handlers of one main row a single shared row below it, with their end events on that row.
   - The flow goes straight down from the event: 0 bends.
   - When several boundaries share a host, the handlers fan out to the right on the same row.
2. **Gateway port rules (R5).** Out of a split: leave from the top or bottom at the gateway's centre-x, then turn horizontal. Into a join: come in horizontal, then turn vertical. These become the first route templates, and the order-dependent "first fit" goes away.
3. **Loops (D8, R6).** A back edge runs below its own row and enters the merge gateway from below. The corridor search is limited to the band between the loop's endpoints; nothing wraps the whole diagram.
4. **Labels (D7, W5).**
   - A boundary label goes to the right of the outgoing vertical segment, or to the left if that spot is blocked.
   - Gateway labels go above-right.
   - Edge labels go 9 px beside a vertical segment or 20 px above a horizontal one.
   - One scoring pass covers nodes, **all edge segments** and labels. Long names are wrapped, and a label is never dropped.
5. **Artifacts (W9, R11).** A data store or object linked to one task goes directly below it, in a slot reserved during placement, with a vertical association. Annotations go in a bottom row, or follow their `side` hint.
6. **Grid and spacing (D4, D5, W6).**
   - Snap every origin and waypoint to 10 px.
   - Set the column pitch to the widest node + 50, giving the 150 pitch Bare-Opus uses for tasks.
   - Make each gap depend on its content: + 20 per routed track, + the label width when a flow label sits in that gap.
   - Set the row pitch to 120.
   - Compact empty rows after placement.
7. **Column sharing (D5).** Stack related nodes, such as branch targets of one split with equal rank, a handler under its host, or data under its task, in one column instead of shifting them a layer to the right.

Exit: the S04 and S11 gates pass, and so do the process-level S16X gates (shared centre-x, max bends, labels crossed).

### P3: Layered core (robustness; Opus, about 3–4 wk, behind `engine: "layered"`)

P1 and P2 fix the eval scenarios. Larger or more branchy models still suffer from W1, W2 and W3. The fix:
- Sugiyama on the existing graph: dummy nodes for long edges, plus barycenter/median sweeps with transpose. The spine is held straight as a constraint, and back edges are found by a declaration-order-independent DFS (W1).
- Brandes–Köpf coordinates with split/join pairs level, symmetric branch balancing, and a sink pull so that branch ends align (W2).
- Channel routing: each gutter gets tracks, ordered to minimise crossings; nudging spreads collinear segments; A* is kept only as a fallback (W3, W4).
- The P2 rules are reused as constraints, not as post-passes.
- A flag-first rollout: the default moves from `semantic` to `layered` only once the corpus gates and the judge are at least as good. That is the only point of mass conformance churn.

### P4: Lanes, edit path, cleanup (Sonnet, about 2 wk)

- Lane-aware ordering, with a lane-change penalty and per-lane compaction (W7).
- `--edit` (W10):
  - `makeRoom` works per scope, with vertical growth and pool or lane growth;
  - new subgraphs get a local re-layout with existing shapes pinned, using the new engine;
  - R13 (shift after the insertion point, keep y) is already about what S11 needs.
- Route `layoutFlowNodes` through the default engine, then delete the grid engine (W11).
- Update the agent card. Drop the "layout is final" caveats only if the metrics justify it.

### P5: Confirm

1. Release.
2. Rebuild `arms/bpmnkit-next`.
3. Rerun S04, S11 and S16X × 3 models × 3 runs in the eval (this needs the cluster, so it runs in the parent session).
4. Run `layout_metrics.py` and the blind judge.
5. Update the gallery.

## TS/Rust parity strategy

- TS stays the oracle. In each phase the PR lands TS first; a Sonnet subagent ports it to Rust line by line (`js::round`, op order). CI conformance (1 px) proves parity.
- Re-record the conformance and frozen fixtures **once per phase PR**, not per item. Batch each phase's items behind a temporary `layoutRev` internal switch until the phase is complete, then flip the switch and re-record.
- Run `pnpm bench:rs` per phase. P1 and P2 are O(n) post-passes. P3 must stay within the 20 % budget; the barycenter sweeps are O(sweeps·E).
- Confirm in `crates/` whether `make-room` and `place-new-shapes` really have no Rust twin. If they have none, P4's edit work is TS only.

## Session split (one dedicated session each, archived when done)

| # | Session | Repo / branch | Model | Subagents | Depends on |
|---|---|---|---|---|---|
| 1 | P0 metrics + corpus + replay | bpmnkit `layout/p0-metrics` | Sonnet | Haiku: copy fixtures; Sonnet: metrics port | none |
| 2 | P1 collaboration composition | bpmnkit `layout/p1-collab` | Opus | Sonnet: Rust port, conformance | 1 |
| 3 | P2 process composition | bpmnkit `layout/p2-process` | Sonnet | Sonnet: Rust port; Haiku: re-record | 1 (parallel with 2; rebase on merge) |
| 4 | P3 layered core | bpmnkit `layout/p3-layered` | Opus | Opus: design review; Sonnet: Rust port | 2, 3 |
| 5 | P4 lanes, edit, cleanup | bpmnkit `layout/p4-edit` | Sonnet | Sonnet: Rust port | 4 (edit parts can start after 3) |
| 6 | P5 eval confirm | eval `claude/bpmnkit-layout` | parent session only (needs cluster) | none | release |

Rules for every session:
- Use superpowers (brainstorming, writing-plans, TDD, subagent-driven-development, verification-before-completion) and caveman mode.
- Before opening a PR, run `pnpm layout:score` and attach the before/after PNGs.
- A PR is done only when the gates of its phase pass.

## Risks

- **Conformance churn**, with more than 100 files per default change. Mitigation: one re-record per phase, behind a switch.
- **Overfitting to 3 scenarios.** Mitigation: the corpus includes the 10 existing aesthetics scenarios and the bake-off fixtures, and P3 targets generality.
- **Uniform-width pools grow the area for one small pool.** This is accepted, because the frame gestalt matters more visually. The area gate is per node, not per pool.
- **Straight message flows can conflict with the column grid.** P1.3 shifts whole columns within the pool slack, never single nodes off-grid.
- **The Bare-Opus S04 used a different model** (a receive task instead of an event-based gateway), so the S04 gate is set at a realistic level (max bends ≤ 1, not 0.6).

## Effort

| Phases | Effort |
|---|---|
| P0–P2, the visible fix | about 4 weeks with sessions 2 and 3 in parallel |
| P3–P4, robustness | about 5–6 weeks |
| P5 | 1 day |
