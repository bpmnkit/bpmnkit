# Customize the AI Agent connector — Extend the AI Agent connector — Customize individual components

**Tip**
Instead of the example below, you can also use other Spring mechanisms to customize the AI Agent connector, such as using Aspect Oriented Programming (AOP) to intercept and modify method calls.

Each component of the AI Agent connector is registered as a Spring bean and annotated with the `@ConditionalOnMissingBean` annotation. This means you can override any component by defining your own bean of the same type in your custom project.

For example, to customize the agent initialization logic, you can create a new bean that implements the `AgentInitializer` interface and register it in your Spring context. In the example below, this is done using the `@Component` annotation, but other Spring Boot mechanisms—like `@Bean` producer methods—work as well.

The following example wraps the default initialization implementation with additional logging, but you can insert any custom logic as needed:

```java

@Component
public class MyCustomAgentInitializer implements AgentInitializer {

    private static final Logger LOGGER = LoggerFactory.getLogger(MyCustomAgentInitializer.class);

    private final AgentInitializer delegate;

    public MyCustomAgentInitializer(
        AgentToolsResolver agentToolsResolver,
        GatewayToolHandlerRegistry gatewayToolHandlers) {
        this.delegate = new AgentInitializerImpl(agentToolsResolver, gatewayToolHandlers);
    }

    @Override
    public AgentInitializationResult initializeAgent(AgentExecutionContext executionContext) {
        LOGGER.info(">>> Initializing agent");

        final var result = delegate.initializeAgent(executionContext);

        LOGGER.info("<<< Agent initialized. Result: {}", result);

        return result;
    }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-customization
