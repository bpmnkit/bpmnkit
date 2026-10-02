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
- **Drop:** a line is matched to its node by id in any case, or to the one task its connector fits. A second line for a node is reported.
