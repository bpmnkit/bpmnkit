# AI Decisions

An [AI agent](/docs/guides/ai-agents) writes text and decides which tools to call. Often a
process step needs less than that: one bounded answer that a gateway can branch on. Which team
gets this ticket? Is this request urgent? How bad is the impact?

A **decision model** answers exactly that kind of question. Cloudflare's
[Clef](https://blog.cloudflare.com/clef-decision-models/) models do not generate text. They
score the options you define in one pass and return a typed answer with a probability for each
option. A gateway can then route on the answer, and route on how sure the model is.

| Step needs | Use |
|---|---|
| Fixed rules over known inputs | A DMN decision (business rule task) |
| A judgement over free text, images or messy data, with a bounded answer | **A decision model** (this guide) |
| Open-ended work: write, research, call tools in a loop | An [AI Agent](/docs/guides/ai-agents) |

---
Source: https://bpmnkit.com/docs/guides/ai-decisions
