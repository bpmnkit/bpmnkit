# Customize the AI Agent connector — Extend the AI Agent connector — Customize individual components

Each component of the AI Agent connector is registered as a default Spring bean. You can override any default component by registering your own implementation as a Spring bean in your custom project.

The following sections show how to add a custom chat model provider and a custom conversation store.

**Tip**
You can also use other Spring mechanisms to customize the AI Agent connector, such as using Aspect Oriented Programming (AOP) to intercept and modify method calls.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-customization
