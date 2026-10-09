# Customize the AI Agent connector — Extend the AI Agent connector — Custom conversation storage

The AI Agent connector includes a set of default storage backends for conversation history, but you can also implement your own to meet specific needs. Like other components, you can register a bean that implements the `ConversationStore` interface to provide your own storage implementation.

A custom store needs three pieces:

- A `ConversationStore` bean: The entry point. Its `type()` value is referenced from the element template.
- A `ConversationSession` returned by `createSession(...)`: Performs the actual load and store for a single agent turn. The caller manages its lifecycle via `try-with-resources`, so override `close()` if your session holds external resources (connections, clients).
- A `ConversationContext` implementation: The storage cursor persisted as part of the `agentContext` process variable. It must be annotated with `@JsonTypeName` and registered with the runtime `ObjectMapper`.

The following example shows how to implement a custom store using a Spring Data JPA repository. The value returned by the `type()` method is used to identify the store type in the AI Agent connector configuration.

```java
@Component
public class MyConversationStore implements ConversationStore {

    public static final String TYPE = "my-conversation";

    private final MyConversationRepository repository;

    public MyConversationStore(MyConversationRepository repository) {
        this.repository = repository;
    }

    @Override
    public String type() {
        return TYPE;
    }

    @Override
    public ConversationSession createSession(
            AgentExecutionContext executionContext, AgentContext agentContext) {
        return new MyConversationSession(repository, executionContext);
    }

    @Override
    public void onJobCompleted(
            AgentExecutionContext executionContext, AgentContext committedContext) {
        // Best-effort hook fired after Zeebe accepted the job completion. Optional: use
        // this to update a projection, archive the previous record, emit an event, etc.
    }

    @Override
    public void onJobCompletionFailed(
            AgentExecutionContext executionContext,
            AgentContext failedContext,
            JobCompletionFailure failure) {
        // Best-effort hook fired after Zeebe rejected the job completion (or the
        // connector itself raised an error). The record written by storeMessages during
        // this job is now an orphan — optional: delete it here so orphans do not
        // accumulate.
    }
}
```

The session reads and writes the conversation messages for a single agent turn. `loadMessages` returns the message history that the incoming `ConversationContext` references; `storeMessages` persists the updated message list and returns a new `ConversationContext` pointing to the newly written record. The caller assembles the full `AgentContext` from the returned context.

```java
public class MyConversationSession implements ConversationSession {

    @Override
    public ConversationLoadResult loadMessages(AgentContext agentContext) {
        // Load the messages referenced by the ConversationContext in agentContext.
    }

    @Override
    public ConversationContext storeMessages(
            AgentContext agentContext, ConversationStoreRequest request) {
        // Persist request.messages() to a new record and return a ConversationContext
        // pointing at it. Never mutate the record the previous context points to —
        // see the storage contract note below.
    }
}
```

The `ConversationContext` is the storage cursor. It is serialized as part of the `agentContext` process variable, so it must be annotated with `@JsonTypeName` and contain everything needed to locate the stored data on the next turn:

```java
@JsonTypeName("my-conversation")
public record MyConversationContext(String conversationId, UUID recordId)
        implements ConversationContext {}
```

Register the subtype with the connector runtime's `ObjectMapper` instances so the connector can deserialize the context back from the process variable. The runtime builds its own mappers, which Spring Boot's `Jackson2ObjectMapperBuilderCustomizer` and `JsonMapperBuilderCustomizer` beans don't configure. Use a `BeanPostProcessor` that registers the subtype on every `ObjectMapper` bean instead:

```java
@Component
public class ConversationContextSubTypesBeanPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (bean instanceof ObjectMapper objectMapper) {
            objectMapper.registerSubtypes(MyConversationContext.class);
        }
        return bean;
    }
}
```

**Tip: Serialize with the connector object mapper**
If your store serializes messages to JSON, use the connector runtime's `ObjectMapper` bean (qualifier `@ConnectorsObjectMapper`) instead of creating your own. It already supports the connector data types that messages can contain, such as document references.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-customization
