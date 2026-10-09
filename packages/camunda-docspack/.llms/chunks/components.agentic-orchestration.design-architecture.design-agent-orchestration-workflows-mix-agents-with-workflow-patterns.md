# Design and architecture — Design agent orchestration workflows — Mix agents with workflow patterns

**(1)**
    **Process flow within tools**: Full BPMN control inside ad-hoc sub-processes for ultimate flexibility.

**(2)**
    **Agents pivot instantly with external messages and timers**: During execution, agents can be influenced by events like external messages or timers, enabling on-the-fly adjustments.

**(3)**
    **Event-driven agent reconfiguration**: Sub-workflows handle new data, guiding the next AI steps.

**(4)**
    **Agents orchestrate sub-workflow**: A tool doesn't need to be a single tool - it can be a whole subprocess.

**(5)**
    **Multi-agent orchestration**: Agents orchestrate other agents for streamlined, scalable solutions. This agent-to-agent pattern runs inside Camunda's [agentic orchestration](https://docs.camunda.io/docs/next/components/agentic-orchestration/agentic-orchestration-overview), as one of the tools available to an agent. It is not the same as agentic orchestration itself, which is Camunda's overall model for orchestrating agents, people, and systems. With the [A2A Client connector](https://docs.camunda.io/docs/next/components/early-access/alpha/a2a-client/a2a-client) implements this pattern, an agent can call a remote agent using the Agent-to-Agent (A2A) protocol.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture
