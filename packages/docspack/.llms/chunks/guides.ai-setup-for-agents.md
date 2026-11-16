# AI setup — for agents

For an agent. Humans: [AI setup — for humans](/docs/guides/ai-setup-for-humans).


## Procedure

```sh
casen agent-card bpmn          # 1. read once: templates, options, traps. Add --text for the full line format
# 2. Write <name>.txt with the Write tool (not a heredoc), from the card's template
casen build <name>.txt --deploy    # 3. run once; omit --deploy to only build and lint
```

Other cards: `casen agent-card dmn`, `casen agent-card form`. No `casen` on PATH:
`npm i -D @bpmnkit/cli`, then `npx casen …`. Camunda questions: `npx bpmnkit-docs ask "<q>" --pack @bpmnkit/camunda-docspack`.

---
Source: https://bpmnkit.com/docs/guides/ai-setup-for-agents
