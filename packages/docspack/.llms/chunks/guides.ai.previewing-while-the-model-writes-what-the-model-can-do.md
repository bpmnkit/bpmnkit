# AI Integration — Previewing While the Model Writes — What the model can do

The proxy runs your installed `claude`, `copilot` or `gemini` CLI for the AI panel, but not as
a coding agent. The model gets no shell, no file access and no web access, and none of your
own MCP servers, settings or plugins. What it can do depends on the request:

| Request | The model gets |
|---|---|
| AI panel chat, improve, explain (`/chat`) | The diagram tools of the proxy's MCP server, which change only the diagram held in that server's memory. The result comes back as the `xml` event; nothing is written to your project. |
| Create form or decision (`/chat`), improve with operations (`/improve`, `casen lint --ai`), Operate chat, incident assist, AI search, `casen ask` | No tools. The model answers with text or JSON, and the proxy does the rest. |

Every tool call that changes the diagram ends with a deploy check, so the model sees what Camunda 8
would refuse while it can still fix it. The diagram `/chat` and `/improve` return goes through the
[deploy gate](/docs/guides/deploy-gate): one that would not deploy comes back as an `error` event
with the gate's lines and no `xml`. A request can send `"placeholders": true` to get placeholder
values filled instead (listed in a `placeholders` event), or `"validate": false` to get the diagram
as a draft with the gate's message in a `deployability` event. The editor's AI panel does the
latter: it inserts the draft and shows the message under the answer, and the deploy pane refuses
the draft until it deploys.

Everything that comes from the request — your chat text, the diagram, an incident's variables —
reaches the model inside `<untrusted-input>` tags, and the system prompt tells it to treat that
as data. A diagram that says "ignore your instructions" is still just a diagram.

---
Source: https://bpmnkit.com/docs/guides/ai
