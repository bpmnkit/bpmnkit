# On-device generation in Chrome

The public web editor can turn a short description into a new diagram using Chrome's built-in
model, Gemini Nano, through the Prompt API. The model runs on your device: no account, no server,
and nothing you type leaves your machine.

The model never writes BPMN XML. It writes BPMN Kit's line-based process text, which
`parseProcessText` repairs and the editor draws while the text streams in.


## What it does

- A **Generate** button and a **Generate** dock tab appear in the editor. Where the browser has no
  on-device model, neither appears and nothing is logged.
- Type a description (up to 2,000 characters) and press Generate. A **new tab** opens, named from the
  `# Process name` line, and its diagram grows as lines arrive. Your open diagrams are never changed.
- When the run ends, the panel lists the parser's problems and fixes. The tab holds a valid,
  laid-out diagram.
- **Stop** aborts the run and keeps what was drawn. Switching to another tab during a run also stops it,
  so no frame lands in the wrong diagram.

Limits: English only, and generate only. There is no editing of an existing diagram and no chat.

---
Source: https://bpmnkit.com/docs/guides/ai-on-device
