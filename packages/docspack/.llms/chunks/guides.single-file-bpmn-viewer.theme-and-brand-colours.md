# One-File BPMN Viewer — Theme and brand colours

The viewer is light by default: dark strokes on a light page, whatever the reader's OS says. Opt in to
the other themes with `theme: "dark"` or `theme: "auto"` (follow `prefers-color-scheme`):

```typescript
toHtml(xml, { theme: "auto" })
toHtml(xml, { colors: { bg: "#101820", text: "#e8eef5", shapeStroke: "#0b5fff" } })
```

`colors` takes any of `bg`, `shapeFill`, `shapeStroke`, `flowStroke`, `text`, `poolHeader` and
`textHalo`, merged over the light theme. `toHtml` writes them as `--bpmnkit-viewer-*` CSS variables and
throws on a value that could break out of the CSS. In your own page, set the variables (`-bg`, `-fill`,
`-stroke`, `-flow`, `-text`, `-pool-header`, `-halo`; the halo defaults to the background) on the
element or an ancestor, or put `data-theme="light|dark|auto"` on the script. In code,
`render(xml, el, { theme })` also takes a partial palette, which wins over the variables.

From the shell: `casen export html order.bpmn --theme dark --color stroke=#0b5fff --color bg=#101820`.

---
Source: https://bpmnkit.com/docs/guides/single-file-bpmn-viewer
