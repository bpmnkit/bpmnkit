# Customize the AI Agent connector — Extend the AI Agent connector — Custom chat model provider

Add support for an LLM provider that the connector doesn't include by registering a `ChatModelFactory` bean. The AI Agent connector routes requests to your factory when a process uses the **Custom implementation** model provider with a matching **Provider type**.

A custom provider needs two pieces:

- A `ChatModelFactory` bean: `supports(...)` decides whether the factory handles a configuration, and `create(...)` builds the `ChatModel`.
- A `ChatModel`: `execute(...)` performs one round-trip against the provider and returns a `ChatResult`. The connector calls `close()` once the agent request is done.

The following skeleton handles the provider type `my-provider`:

```java
@Component
public class MyChatModelFactory implements ChatModelFactory {

    public static final String PROVIDER_TYPE = "my-provider";

    @Override
    public boolean supports(ChatModelConfiguration configuration) {
        return configuration instanceof CustomProviderConfiguration custom
            && PROVIDER_TYPE.equals(custom.providerType());
    }

    @Override
    public ChatModel create(ChatModelConfiguration configuration) {
        final var custom = (CustomProviderConfiguration) configuration;
        // custom.model() is the model ID, custom.parameters() the provider parameters
        return new MyChatModel(custom.model(), custom.parameters());
    }
}
```

```java
public class MyChatModel implements ChatModel {

    public MyChatModel(String model, Map<String, Object> parameters) {
        // set up your provider client
    }

    @Override
    public ChatResult execute(ChatRequest request) {
        // 1. Convert request.snapshot() to your provider's request format.
        // 2. Call the provider.
        // 3. Convert the response to an AssistantMessage and fill in the AgentMetrics
        //    (model calls, token usage).
        return new ChatResult.Completed(assistantMessage, metrics);
    }

    @Override
    public void close() {
        // release provider client resources
    }
}
```

Return `ChatResult.Continuation` instead of `ChatResult.Completed` if the provider pauses mid-turn and must be called again to continue the same turn.

**Note**
The connector throws an error if no factory, or more than one factory, supports a configuration. Make sure `supports(...)` only matches your own provider type.

To use the provider in a process:

1. Apply the new **AI Agent Task** or **AI Agent Sub-process** element template, version 2.
2. In the **Model provider** group, set **Provider** to **Custom implementation**.
3. Set **Provider type** to the value your factory matches (`my-provider` in the example above).
4. Set **Model** to the model ID your implementation expects.
5. (Optional) Set **Provider parameters** to a FEEL context that your factory reads, for example `={apiKey: "{{secrets.MY_API_KEY}}"}`.

To build on a built-in provider instead of calling an API yourself, inject the built-in factory bean, such as `OpenAiChatModelFactory`, and call it directly from your factory.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-customization
