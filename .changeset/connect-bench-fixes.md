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
- **From the fifth benchmark:** a bracket left open is closed where the name ends, and an id declared again after an arrow with a name of several words is a new node. `selectConnectors` leaves out an API card when the dedicated connector covers the request as well as the index does, and leaves out connectors that only share a word with a task that names its system. In Drop, `with` lines run together on one line are split.
- **From the sixth benchmark:** the resolver reads an SDK call (`chat.completions.create`) as the operation it starts with, and keeps the path an `api=` line completes over a FEEL `url=`. `isConnectorAlias` is exported. In Drop, a line with the node's id in the alias's place, a copied `[declaration]`, a label before the alias, a flow with free text, or an alias no connector has is repaired, and a misplaced line may take a task from a line whose connector is not offered there.
- **From the seventh and eighth benchmarks:** `parseProcessText` reads numbers as ids (`n1`), a line starting with an arrow as continuing the path above, and a space before an arrow's label. `selectConnectors` gives a service only the request names to no task that names another system. The resolver spells an API path's words as the service does, reads `${x}` inside FEEL as `x`, and reads an operation the connector lacks as the one sharing the longest start with it. Drop splits a flow of connector steps written on one line, and drops the connect guide's example lines when a model copies them.
- **Bench:** a golden prompt's `mustContainTaskTypes` entry may list alternatives. Prompt 10 accepts SendGrid or the Email connector, and prompt 20 the OpenAI or the AI Agent connector.
- **From the ninth benchmark:** `parseProcessText` reads a kind and a name without brackets after an arrow as a declaration. `selectConnectors` no longer makes a connector a candidate by a generic word alone (request, document, file, data, report, record, form). In Drop, a `with` line naming no connector gets the node's first card.
- **API ranking:** `rankApiOperations` no longer counts the parts of a service's name ("git" and "hub" of GitHub) and weighs a word most of a service's operations share down, so "List failed GitHub Actions runs" ranks the workflow runs endpoint first. `selectConnectors` lets a dedicated connector's operation cover a task only when its verb and resource fit, and compares the same words in its request check. Drop's drafting prompt asks for tasks named in the description's own words.
- **From the tenth benchmark:** the resolver reads an API card's summary written where the path goes as that operation. In Drop, an unknown alias read as a REST first card keeps the line's method and path, with the task's API.
- **Drafting:** the line format gains `each=<list>` (a multi-instance task or sub-process) and `after=<duration>` (a timer's duration; also read from a timer's name), carried by `CompactElement.multiInstance` and `CompactElement.timerDuration`. An attribute written before the bar is read. The guide's example shows a parallel split, `each=` and a timer boundary. Drop's drafting prompt gives a REST call an error boundary.
- **Drafting, after the bench:** the guide's example is its original four lines again, as glm copied example lines into unrelated processes; parallel work, deadlines and `each=` are taught as rules. A pass-through `and`/`or` node named like a step becomes a task, and pass-through gateways left by a removal are removed too.
- **Drafting repairs:** a step named for each or every item ("Send email to each stakeholder") is multi-instance over the list, and a DMN decision's unlabelled outcomes split with an xor instead of running in parallel. Drop reads a diagram line copied before the colon as a `with` line, and keeps a copied guide example where its connector was offered.
- **More drafting repairs:** `after=` on an event that is not a timer makes it one, ISO durations are read in lower case, and a boundary without `on=` that one task is drawn into goes on that task.
- **Drop checks each draft against its request:** when the request names a DMN decision, a time limit, a failure or REST call to handle, parallel work, a step per list item, a person's work or a message to wait for that the draft has no element for, one change request asks for exactly that, and its answer is kept only when it fills a gap without losing an element. `bench:generate` runs the same check (`--no-check` to leave it out).
