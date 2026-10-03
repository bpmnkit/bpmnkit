# @bpmnkit/connectors — Picking cards for a diagram

`selectConnectors({ text, tasks })` picks the cards a model should see when it connects a
diagram, per task and in code. `text` is what the person asked for; `tasks` are the diagram's
nodes. It returns only tasks with a candidate, so an empty answer means there is nothing to
connect.

A card is a candidate for a task when:
- **the task's name names the system** ("Post summary to **Slack**");
- **the request names the system,** the task is a task rather than an event, and no other
  task's name claims that system; or
- **the task's name shares a word with the connector's name,** other than a common verb.

Beyond those rules:
- **REST fallback.** The REST connector is offered for a task that asks for an HTTP call
  ("Fetch …", "Call endpoint") when nothing else fits. It is also offered for a task with no
  connector of its own when the request asks for a REST call ("check the stock with a REST
  call").
- **Synonyms.** A few words requests use for what templates call something else, such as
  "notify" for sending a message, change the ranking only.
- **Variety.** Each further card of one template ranks lower. The Email connector's IMAP
  operations do not crowd out SendGrid when the request names it.
- **Systems nobody named.** A connector that names a system the task and request do not
  ranks lower: "Azure OpenAI" for a request that says OpenAI.
- **The request wins.** A task whose name names a system the request does not ("Post summary
  to Slack" for a request that says Teams) gets the request's system first, ranked by what the
  request asks of it.
- **Deprecated templates** are never offered.
- **Caps.** At most three cards per task and eight in all. Every task keeps its best card
  before any task gets a second.

---
Source: https://bpmnkit.com/docs/packages/connectors
