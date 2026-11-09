# casen diff — Flags

| Flag | Default | What it does |
| --- | --- | --- |
| `--format` | `text` | `text` or `json` |
| `--exit-code` | off | Exit non-zero when the two diagrams differ |
| `--ascii` | off | Also render both diagrams as ASCII art |
| `--html <file>` | — | Write a self-contained HTML viewer of both diagrams with the changes highlighted |
| `--png <file>` | — | Write a PNG of the later diagram with the changes drawn over it (needs `@resvg/resvg-js`) |

### As a pipeline gate

```sh
casen diff bpmn main/order.bpmn branch/order.bpmn --exit-code
```

Exits non-zero when anything differs, so a job can fail — or a review can be requested —
whenever a pull request touches the shape of a process rather than only its formatting.

### Machine-readable

```sh
casen diff bpmn old.bpmn new.bpmn --format json
```

```json
{
  "added": ["Activity_1x8fj2"],
  "removed": [],
  "changed": ["Activity_0p2ktn"],
  "moved": ["Gateway_09sd1a"],
  "total": 3,
  "planes": [{ "id": "order-process", "total": 3, "added": 1, "removed": 0, "changed": 1, "moved": 1 }]
}
```

### Alongside the picture

```sh
casen diff bpmn old.bpmn new.bpmn --ascii
```

Prints both diagrams as ASCII art above the summary — the same rendering
[`casen view`](/docs/cli/view) produces, and the same one the VS Code extension copies into a
pull request.

### A page to open or attach

```sh
casen diff bpmn old.bpmn new.bpmn --html diff.html --png diff.png
```

`diff.html` is one file that loads nothing: both diagrams side by side or overlaid (with a
slider for the earlier one's opacity), added, removed, changed and moved elements outlined in
green, red, amber and blue, and the change list with each changed field as `before → after`.
Click a change to zoom both diagrams to it, `j`/`k` to step through, wheel to zoom, drag to pan,
`0` to fit. With JavaScript off it still shows the highlights and the list. Models without
diagram interchange are laid out first. `diff.png` is the later diagram with the same marks, for
chat tools that do not show HTML. The page is `renderDiffHtml()` from `@bpmnkit/core`, and
the Rust `bpmnkit_diff::diff_to_html` gives the same bytes.

---
Source: https://bpmnkit.com/docs/cli/diff
