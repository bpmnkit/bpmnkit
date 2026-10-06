---
"@bpmnkit/drop": minor
---

Open a generated draft in the editor, and keep changing it there with an AI chat.

- **Open in editor** on describe-to-diagram stores the draft as a drop, like Get a share link, and goes to it with `#edit`: the page claims the editor on arrival and opens the AI chat beside it.
- **Ask AI** while editing (on when `AI_PASSCODE` and `AI_FEEDBACK_MODEL` are set) takes a request in your own words, about the selected elements or the whole diagram. It goes through `POST /drop/api/ai-edit` — which now takes `{ xml, request, elementIds? }` besides `threadIds` — and its change script is applied with the layout kept, as one editor change that Undo reverts.
