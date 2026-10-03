---
"@bpmnkit/core": patch
"@bpmnkit/connectors": patch
"@bpmnkit/drop": patch
---

Connect pass fixes from its first real benchmark.

- **Card selection** (`selectConnectors`):
  - A connector the request names is no longer crowded out by another connector's operations, so SendGrid shows up for an email task.
  - A connector naming a system nobody asked for ranks lower (Azure OpenAI for "OpenAI").
  - Deprecated templates are no longer offered.
  - A task that names only an API ("Call Stripe REST API") gets endpoints that match the request.
  - A REST call the request asks for reaches the task it is for.
- **The `with`-line resolver** now repairs:
  - a line copied from an API card's head;
  - `{{variable}}` and `${variable}` written instead of FEEL;
  - a `{{param}}` in a path;
  - a path written without `api=`.

  A short alias no longer matches another connector two letters away.
- **Drop:**
  - A line is matched to its node by id in any case. If the id names no node, or a node no card was offered for, the line goes to the task its connector fits; with several, to the one whose name shares the line's words.
  - A second line for a node is reported.
  - A line missing its `with` is kept.
- **More resolver repairs:** a line starting with an HTTP method is read as a REST call, and `==#channel` is read as the text it is.
