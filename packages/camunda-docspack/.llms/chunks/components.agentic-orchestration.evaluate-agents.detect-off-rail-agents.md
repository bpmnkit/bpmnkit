# Detect off-rail agents

Use agent health indicators and limit proximity warnings to identify a stuck or looping AI agent before it fails.

Use agent health indicators and limit proximity warnings to identify a stuck or looping AI agent before it fails.


## About

An agent can go off-rail without failing outright, for example, by getting stuck repeating a tool call or reasoning in circles. Left unnoticed, it keeps consuming tokens and model calls until it hits its configured limit.

In this guide, you will learn how to read an agent instance's [state and usage metrics](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-states-and-metrics) to catch this early, and how to respond to limit proximity warnings.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/detect-off-rail-agents
