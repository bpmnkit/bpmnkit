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
- **Drop, degenerate answers:** an answer of nothing but `!` (gpt-oss-120b's token 0, about 1 draft in 20 in the benchmarks) is given up on before it reaches the reader. The fallback model answers instead, or the reader is told to try again.
- **More near misses repaired:** a line naming its node by label, a line without the colon after its id, headers written as text, and a system named in the singular ("Google Sheet").
- **From the fourth benchmark:** a service of the API index written as the alias (`stripe POST /v1/refunds`) is read as a REST call to it. Several inputs in one `|` part (`region=… functionName=…`) are split, and a `*` copied from a card is dropped. In Drop, a line naming a flow (`start > summarize:`) is read as one for its last node, and a line that copied the node's kind (`service Run AWS Lambda …`) gets the node's first card.
- **Drafting repairs:** `parseProcessText` reads an id written with spaces before its bracket (`call back[…]`) as one id, and makes a catch event named for a call it makes ("Send to SQS") a service task. `selectConnectors` ranks the request's system first on a task that names one the request does not ("Post summary to Slack" when the request says Teams). Drop's drafting prompt asks for the system the description names.
