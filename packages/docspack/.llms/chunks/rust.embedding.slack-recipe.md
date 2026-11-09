# Embedding the Rust crates — Slack recipe

Slack does not render HTML. In `spawn_blocking`: run `diff_bpmn`, upload `diff_to_html` as a
file with `files.uploadV2`, and post `diff_to_text` with `markdown: true` (or a lint report as
`to_slack_mrkdwn`). For an inline image, `svg_to_png(&diff_to_svg(&after, &diff, &opts)?,
&PngOptions::default())` (feature `render-png`) gives the later diagram with the changes marked.


## Examples

`cargo run -p bpmnkit --all-features --example text_to_bpmn | eval_dmn | lint_report | render_svg | render_png | diff_html`.

---
Source: https://bpmnkit.com/docs/rust/embedding
