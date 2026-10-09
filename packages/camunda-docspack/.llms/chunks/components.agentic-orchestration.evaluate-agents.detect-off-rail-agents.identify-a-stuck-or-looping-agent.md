# Detect off-rail agents — Identify a stuck or looping agent

No single health indicator proves that an agent is stuck. Look at the combination of state, usage metrics, and duration for the agent instance:

- **State doesn't change over an extended period.** An agent instance stuck in Thinking far longer than a typical model call, or in Tool calling far longer than the tool normally takes to respond, is not progressing through its loop.
- **Tool call count climbs without resolution.** The agent keeps calling the same tool, or a small set of tools, with similar or identical inputs across multiple loops, without the conversation moving toward a final response.
- **Token consumption grows steadily over loop iterations.** Since each loop iteration appends the previous reasoning and tool results to the conversation, a steadily rising token count with no final response is a sign the agent is accumulating context without converging.
- **Execution duration is disproportionate to the task.** The cumulative time the agent instance has spent in `Thinking` and `Tool calling`, not counting time spent `Idle` waiting on external input, is much longer than comparable runs of the same agent, which suggests the agent is caught in a longer-than-expected cycle of loop iterations rather than a single stuck call.

**Note**
An agent that calls the same tool many times can still be legitimately working through a multi-step task. Treat these indicators together, not individually: an agent instance with a stalled state, a climbing tool call count, and a duration that keeps growing without settling is the strongest signal that it's going off-rail.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/detect-off-rail-agents
