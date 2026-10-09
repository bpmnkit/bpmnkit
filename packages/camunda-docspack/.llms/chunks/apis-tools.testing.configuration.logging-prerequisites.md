# Configuration — Logging — Prerequisites

CPT provides an optional [LangChain4j](https://docs.langchain4j.dev/) integration module that ships with preconfigured
support for major LLM providers: OpenAI, Anthropic, Amazon Bedrock, Azure OpenAI, and OpenAI-compatible APIs.
LangChain4j requires Java 17+. You can provide your own LLM integration through a
custom `ChatModelAdapter` instead (see [custom ChatModelAdapter](#custom-chatmodeladapter)).

**Tip**
For a guided walkthrough of setting up and testing AI agents, see [test your AI agents](https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents).

Camunda Process Test Spring includes the LangChain4j providers as a transitive dependency. No additional
dependency is needed.

Add the `camunda-process-test-langchain4j` dependency to your project:

```xml

<dependency>
    <groupId>io.camunda</groupId>
    <artifactId>camunda-process-test-langchain4j</artifactId>
    <scope>test</scope>
</dependency>
```

If you provide a custom `ChatModelAdapter` (see [custom ChatModelAdapter](#custom-chatmodeladapter)), this dependency
is not required.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
