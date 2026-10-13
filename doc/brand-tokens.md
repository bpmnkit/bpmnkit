# Brand tokens and the bpmnkit.com design system

Moved out of `CLAUDE.md`, which keeps the rules in short form. This is the full reference.

All brand colors and design tokens are defined in **`packages/ui`** (`@bpmnkit/ui`).

- **Single source of truth**: edit `packages/ui/src/tokens.css` (CSS file) or `packages/ui/src/css.ts` (`UI_TOKENS_CSS` string) — both must stay in sync
- **Token namespace**: all public tokens use `--bpmnkit-*` prefix
- **Usage in packages**: call `injectUiStyles()` at runtime (editor, canvas, plugins), or `@import "@bpmnkit/ui/tokens.css"` in Astro apps via `packages/astro-shared`
- **Never hardcode brand colors** — always use `var(--bpmnkit-*, <fallback>)` with a hex fallback so packages work standalone
- **Semantic colors are exempt**: execution-state colors (token-highlight amber/green), syntax highlighting (feel-playground, dmn-viewer), and DMN semantic section colors must not be replaced with brand tokens

### Key tokens

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--bpmnkit-bg` | `#f4f4f8` | `#0d0d16` | Page background |
| `--bpmnkit-surface` | `#ffffff` | `#161626` | Card / panel surface |
| `--bpmnkit-surface-2` | `#eeeef8` | `#1e1e2e` | Elevated surface |
| `--bpmnkit-border` | `#d0d0e8` | `#2a2a42` | Borders |
| `--bpmnkit-fg` | `#1a1a2e` | `#cdd6f4` | Primary text |
| `--bpmnkit-fg-muted` | `#6666a0` | `#8888a8` | Secondary text |
| `--bpmnkit-accent` | `#1a56db` | `#6b9df7` | Primary accent / interactive |
| `--bpmnkit-accent-bright` | `#3b82f6` | `#89b4fa` | Bright accent / links |
| `--bpmnkit-accent-subtle` | `rgba(26,86,219,0.12)` | `rgba(107,157,247,0.15)` | Accent tint / hover bg |
| `--bpmnkit-teal` | `#0d9488` | `#2dd4bf` | Secondary accent |
| `--bpmnkit-panel-bg` | `rgba(255,255,255,0.92)` | `rgba(13,13,22,0.92)` | Floating panels |
| `--bpmnkit-panel-border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Panel borders |
| `--bpmnkit-success` | `#16a34a` | `#22c55e` | Success state |
| `--bpmnkit-warn` | `#d97706` | `#f59e0b` | Warning state |
| `--bpmnkit-danger` | `#dc2626` | `#f87171` | Error / danger state |
| `--bpmnkit-font` | `system-ui, -apple-system, sans-serif` | same | UI font |
| `--bpmnkit-font-mono` | `ui-monospace, "Cascadia Code", "JetBrains Mono", monospace` | same | Monospace font |

### Design-system tokens (`--bpmnkit-ds-*`)

The bpmnkit.com landing system — flat, square, hairline-ruled, one terracotta accent — lives
alongside the product palette in the same two files, under the `--bpmnkit-ds-` prefix. It is a
**separate, additive set**: changing it never moves `--bpmnkit-accent` and friends.

- Used by `apps/landing`, `apps/drop` and the `@bpmnkit/editor` chrome. Everything else stays
  on the product palette above.
- Rules the set encodes, and that consumers must keep: `border-radius: 0` on all chrome; no
  `box-shadow`, `linear-gradient` or `backdrop-filter`; depth is 1px hairlines only; one
  accent (`--bpmnkit-ds-accent`, `--bpmnkit-ds-accent-on-dark` on dark grounds); two type
  roles — `--bpmnkit-ds-font-sans` for prose, `--bpmnkit-ds-font-mono` for every label,
  eyebrow, filename, version and status readout, with any uppercase label in mono.
- Card grids are **one** bordered box subdivided by `--bpmnkit-ds-line-soft`, never gapped
  cards. Toolbars and palettes follow the same rule.
- Diagram rendering is out of scope for the set: BPMN/DMN strokes, rounded task shapes and
  labels belong to the renderer. Selection is a dashed accent halo *around* a shape, never a
  recolour of it.
- Semantic state (`--bpmnkit-success` / `-warn` / `-danger`, execution-state and syntax
  colours) stays exempt, as above.
- Drop serves Space Grotesk and Space Mono from `/drop/fonts/`, copied out of
  `apps/landing/public/fonts` by `apps/drop/scripts/build-client.mjs`.

