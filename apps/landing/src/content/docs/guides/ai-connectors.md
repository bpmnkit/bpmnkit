---
title: Connectors in AI Generation
description: How BPMN Kit turns "post the open GitHub issues to Slack" into an executable process — connector cards, with lines, the offline API index, and a dry run that proves it runs.
sidebar:
  order: 9
---

A generated diagram is only useful in Camunda 8 if its calls to outside systems are
configured connectors: the right template, the inputs it needs, credentials as secrets. BPMN
Kit does this in code wherever it can and asks a model only for what code cannot know. All
the connector data ships in the packages, so nothing is fetched at run time.

## Two passes

1. **The shape.** A model writes the process in the
   [line format](/docs/packages/core#parseprocesstexttext-and-createprocesstextstream): tasks,
   gateways, events. Each call to an outside system is its own service task.
2. **The connectors.** A second, small call configures them. Code picks the connector cards
   each task could use and sends only those. The model answers with `with` lines only, and
   code applies them.

The second pass is skipped without a model call when no task matches a connector. A pure
approval flow costs nothing extra.

## Connector cards

The 133 Camunda connector templates are bundled in
[`@bpmnkit/core/connectors`](/docs/packages/connectors). A template with several operations
becomes one **card** per operation, with only the inputs that operation uses:

```
slack chat.postMessage — Slack Outbound Connector: Post message | token*(secret) data.text* data.channel* | optional: data.thread resultVariable resultExpression(=FEEL)
```

`*` marks a required input. `(secret)` takes a `{{secrets.NAME}}` placeholder.

- **Picking cards.** `selectConnectors({ text, tasks })` picks the cards for each task, in
  code. A card fits when the task's name names the system ("Post summary to **Slack**"), or
  when the request names it and no other task does.
- **Searching.** `findConnectorCards(query)` searches all cards.
- **From a terminal.** `casen connector cards "post a message to slack"` prints them.

## `with` lines

A `with` line configures one node:

```
with notify: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops | data.text== "Order " + orderId + " failed"
with fetch: http GET https://api.example.com/orders | result=order: response.body
```

`applyConnectorLines` resolves the line against the catalog and applies the template. A
plain task becomes the connector's service task. The resolver repairs what models get nearly
right:

- a misspelt alias;
- a short key (`channel` for `data.channel`);
- a credential written as a value, which becomes a secret placeholder.

A required input the line left out becomes a **question**, with a line for the reader to
finish. The [`with` lines reference](/docs/packages/connectors#with-lines) has the details.

## Any HTTP API

Most systems have no dedicated connector. The REST connector reaches them, but only with the
right base URL, path and authentication. The
[API index](/docs/packages/connector-gen#api-index) has these for about 80 APIs, built offline
from their OpenAPI specs. A task that names one of them gets an **API card** next to the REST
connector:

```
api stripe — Stripe API https://api.stripe.com auth=bearer secret=STRIPE_TOKEN
POST /v1/customers — Create a customer | form body: name email description address balance business_name
```

The model writes `api=stripe` and the path:

```
with customer: http POST /v1/customers | api=stripe | body=={email: email}
```

The line then gets:

- the base URL;
- the `{params}` of the path as FEEL, from variables of the same name;
- the authentication, with a `{{secrets.STRIPE_TOKEN}}` placeholder;
- the headers the endpoint needs, such as Stripe's form encoding or Notion's
  `Notion-Version`.

A call the index does not have is kept, as a question to check the URL. A dedicated
connector still wins when it covers the task. GitHub's connector creates issues; the index
lists workflow runs.

## Proving it runs

A diagram that parses is not yet a process that runs. Two checks follow every connected
result:

- **Dry run.** [`dryRun`](/docs/guides/testing-processes#dry-run) runs the process once from
  start to end. Every connector answers an empty HTTP 200, and every other job completes.
  Messages are delivered and timers fire. It says whether the run reached the end, or where
  it stopped and why.
- **Secrets.** `listSecrets` lists every secret the diagram reads, so you can create them in
  the cluster before deploying.

## Where you meet it

- **[Drop](/docs/guides/drop).** "Describe a process" drafts the diagram, connects it, and
  shows the secrets and the dry run. A shared diagram has **Add connectors** while editing.
- **CLI.**
  - `casen connector cards "<request>"` prints connector cards.
  - `casen connector api "<request>"` prints the endpoints of an indexed API.
  - `casen synth --check` dry-runs a compiled plan and lists its secrets.
- **The proxy's MCP server.** It is used by the AI chat and by your own agents:
  - `find_connectors { query }` returns cards and API endpoints.
  - `add_connector { processId, id, alias, operation, values }` configures a node through
    the same resolver.
- **Studio.** **Try it** runs a model on the local engine. GET requests go out for real;
  every other connector and task is simulated.

## Keeping the data current

- **Connector templates.** They come from Camunda's marketplace registry.
- **API index.** It is built from the connector-gen catalog's specs.

A weekly workflow refreshes both and opens a pull request when something changed. Specs that
state a non-commercial, copyleft or proprietary license are not indexed.
