# Embedding the Rust crates — FEEL and DMN results in chat

`Value::to_feel_string()` is FEEL's `string()` (`Display` prints `null` instead of `None`).
`Value::to_json_string()` / `to_json()` and `Value::from_json_str()` / `from_json()` convert to and
from JSON; `Context::from_json_str(body)` turns a request body into FEEL variables. Text forms keep
every digit of a number; `serde_json::Value` holds f64.

`bpmnkit_dmn::report::{result_to_text, result_to_markdown, result_to_slack_mrkdwn}(title, &result)`
print a decision result: a single value, one hit (a context) or many hits (rows, the union of
their keys as columns). Slack has no tables, so rows go in an aligned code block.

---
Source: https://bpmnkit.com/docs/rust/embedding
