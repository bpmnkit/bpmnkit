---
"@bpmnkit/drop": minor
---

Describe a process, get a diagram. The new "Describe a process" section on `/drop` sits behind the AI review's closed-beta passcode. It sends a plain-language description to Workers AI and draws the BPMN line by line as the model writes it. The reader can then share the result like any upload.

Answers are cached in D1, and the daily neuron budget is charged from the model's reported usage. `AI_GENERATE_MODEL` picks the model. Migration `0007_ai_generations`.
