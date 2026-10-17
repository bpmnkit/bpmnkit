# Glossary — Agent loop

The feedback loop an [AI agent](#ai-agent) runs to reach its goal: the model reasons over the current context, decides whether to call tools, receives the tool results, and repeats until it returns a final response or reaches a configured limit. The loop is what makes an agent an agent, and it consists of one or more [loop iterations](#loop-iteration).

A [Camunda AI agent](#camunda-ai-agent) runs its loop in Camunda's engine, which activates each tool call as a BPMN activity. An [external agent](#external-agent) runs its loop in an external runtime.

---
Source: https://docs.camunda.io/docs/next/reference/glossary
