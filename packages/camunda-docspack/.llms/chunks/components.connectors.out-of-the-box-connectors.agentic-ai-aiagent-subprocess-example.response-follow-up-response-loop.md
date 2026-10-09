# Example AI Agent Sub-process connector integration — Response follow-up {#response-loop}

Separately from the agent loop for tools, a response follow-up acting on the agent response can be added by re-entering the AI Agent connector with new information. You must model your user prompt so that it adds the follow-up data instead of the initial request.

For example, your **User Prompt** field could contain the following FEEL expression to make sure it acts upon follow-up input:

```feel
=if (is defined(followUpInput)) then followUpInput else initialUserInput
```

With the **AI Agent Sub-process** implementation, the follow-up needs to be modeled to loop back to the AI Agent ad-hoc sub-process:

![AI Agent Sub-process with response follow-up](../img/ai-agent-subprocess-follow-up.png)

**Note**
How you model this type of follow-up greatly depends on your specific use case.

- The example follow-up expects a simple feedback action based on a user task, but this could also interact with other process flows or another agent process.
- Instead of the user task, you could also use another LLM connector to verify the response of the AI Agent. For an example of this pattern, see the [fraud detection example](https://github.com/camunda/connectors/tree/main/connectors/agentic-ai/examples/ai-agent/ad-hoc-sub-process/fraud-detection).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess-example
