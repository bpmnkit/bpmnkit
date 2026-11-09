# Embedding the Rust crates — One error type

`bpmnkit::Error` is `#[non_exhaustive]` and has `From` for each crate's error (`Xml`, `Bpmn`,
`Dmn`, `Form`, `Feel`, `Text`, `Build`), so `?` works across crates. `Display` prefixes the
source (`BPMN: ...`) and `source()` returns the original. `Unrecognized` and `FeatureDisabled`
come from `load` itself.


## Lint reports for people

`bpmnkit_lint::report` turns a `LintReport` into a string:

| Function | For |
|---|---|
| `to_text(&report, &TextStyle { color, max })` | terminals and logs; `max: 0` prints all |
| `to_markdown(&report)` | PR comments |
| `to_slack_mrkdwn(&report)` | Slack; `&`, `<` and `>` are escaped |

`check_findings_to_text`, `check_findings_to_markdown` and `check_findings_to_slack_mrkdwn` do
the same for DMN and form `CheckFinding`s. See the `lint_report` example.

---
Source: https://bpmnkit.com/docs/rust/embedding
