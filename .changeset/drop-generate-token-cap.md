---
"@bpmnkit/drop": patch
---

Describe-to-diagram caps output at 600 tokens for models that do not reason: glm-4.7-flash, gemma-4 and granite. In the benchmark, the longest real diagram was 191 tokens. One answer that "thought aloud" instead ran to the old 2,048-token cap, taking 37 s and about 11× the usual neurons. Reasoning models keep 2,048.
