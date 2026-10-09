# Agent definitions and instances — Agent definitions

An AI agent definition is a first-class, queryable resource that Camunda creates when you deploy a process containing one or more agents. Use the [Agent Definition API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-agent-definition.api) to get an agent definition by key, or the [search endpoint](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-agent-definitions.api) to list agent definitions filtered by any of their properties.

Camunda creates one agent definition per agent element in a deployed process, analogous to how a [DRD](https://docs.camunda.io/docs/next/reference/glossary#drd-decision-requirements-diagram) deployment creates one decision definition per decision. An agent definition is a **structural descriptor** of the agent, not a store of its runtime configuration.

An agent definition is bound to a specific process definition version. Deploying a new version of a process creates a new agent definition for each of its agent elements, in the same way that each process version has its own process definition. With agent definitions, you can inventory the agents deployed to your cluster, aggregate per-agent metrics in Optimize, and confirm that an agent exists before starting one of its instances.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances
