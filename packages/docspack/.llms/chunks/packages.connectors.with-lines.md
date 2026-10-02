# @bpmnkit/connectors — `with` lines

In the [line format](/docs/packages/core#connectors-with-lines), a model configures a connector
with a `with` line:

```
with post: slack postMessage | channel=#ops | text== "Order " + orderId | token=xoxb-123
```

`applyConnectorLines(definitions, lines)` applies the lines from `parseProcessText` or a change
script. Each line goes through `applyTemplateToElement`, so a plain task becomes the connector's
service task and inbound templates work on events.

`resolveConnectorLine` repairs what a model gets nearly right and reports the rest:

- **A misspelt alias.** One within two letters of a real alias is read as that one (`slak` →
  `slack`).
- **The operation.** It is matched exactly, or by its last dotted part (`postMessage` →
  `chat.postMessage`). It may also be given as the input that selects it.
- **A short key.** A key the operation lacks, but that is the end of one it has, is read as that
  one (`channel` → `data.channel`).
- **Values without a key.** `http POST https://…` sets `method` and `url`.
- **Results.** `result=name` sets the result variable; `result=name: expr` sets the result
  expression `={name: expr}`, under whatever key the operation uses for it.
- **Credentials.** A credential written as a value becomes a `{{secrets.…}}` placeholder: the
  diagram never carries one.
- **API index calls.** With `{ apis }` as the last argument, an `http` line that names a
  service (`http POST /v1/customers | api=stripe`), or calls a URL under its base URL, is
  completed from the index:
  - the base URL goes before the path;
  - each `{param}` of the path reads the variable of the same name;
  - the service's authentication is set with a `{{secrets.STRIPE_TOKEN}}` placeholder,
    unless the line sets its own;
  - the headers the endpoint needs are added, such as Notion's `Notion-Version` or a form
    body's `Content-Type`.

  A call the index does not have is kept, and becomes a question to check the method and
  URL.

A required input the line left out becomes a **question** (`AppliedConnectorLines.questions`),
with a line to finish, and the rest of the line is still applied. A line for a node that already
carries the same connector changes only the inputs it names, so the answer to a question keeps
everything else.

- **Writing back.** `connectorLineFor(element, definitions)` writes an element's connector back
  as a line. Applying that line again gives the same element.
- **Prompting.** `CONNECT_GUIDE` is the system prompt that teaches the format to the pass that
  configures a finished diagram's connectors.

---
Source: https://bpmnkit.com/docs/packages/connectors
