# Embedding the Rust crates — Slack recipe

Slack does not render HTML. In `spawn_blocking`: run `diff_bpmn`, upload `diff_to_html` as a
file with `files.uploadV2`, and post `diff_to_text` with `markdown: true` (or a lint report as
`to_slack_mrkdwn`). For an inline image, rasterize `diff_to_svg` (PNG support in
`bpmnkit-render` is planned; until then `casen diff bpmn --png` does it from the CLI).


## Examples

`cargo run -p bpmnkit --all-features --example text_to_bpmn | eval_dmn | lint_report | render_svg | diff_html`.

---
Source: https://bpmnkit.com/docs/rust/embedding
