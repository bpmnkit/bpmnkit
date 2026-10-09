# Test your AI agents with CPT — Step 1: Prepare the example AI agent blueprint

Place the BPMN file and any associated forms for your AI agent process in the `src/main/resources` directory of your Spring Boot project. Create it if it does not already exist.

You can organize files into subdirectories such as `bpmn/` and `forms/`.


## Step 2: Configure the LLM provider and connectors

Judge assertions send a process variable and a natural language expectation to a configured LLM, which scores how well they match. The assertion passes if the score meets a configurable threshold. This avoids brittle string-matching on free-text AI output.

For this testing style, first configure both the connector runtime and the judge LLM. The goal is to keep the AI agent and LLM interaction real while disabling outbound connector execution for the tool calls you want to control in the test.

### Configure the connector runtime

Add the following connector runtime configuration to your test configuration, for example in `src/test/resources/application.yaml` or as inline properties on `@SpringBootTest`. For the full property reference, see the [CPT configuration docs](https://docs.camunda.io/docs/next/apis-tools/testing/configuration).

```yaml
camunda:
  process-test:
    assertion:
      timeout: PT1M
    connectors-enabled: true
    connectors-env-vars:
      CAMUNDA_CONNECTOR_POLLING_ENABLED: "false"
      CONNECTOR_OUTBOUND_DISCOVERY_DISABLED: "true"
      CONNECTOR_OUTBOUND_DISABLED: "io.camunda:http-json:1"
```

With this setup:

- The assertion timeout is increased to one minute. AI agent processes involve LLM interactions and typically take longer than standard BPMN processes.
- CPT starts the connector runtime needed by the AI agent process.
- Outbound connector executions, such as the HTTP JSON connector, are disabled so tool behavior can be controlled by the test with conditional behavior.

If your AI agent tools use different outbound connectors, adjust `CONNECTOR_OUTBOUND_DISABLED` accordingly.

### Configure the LLM provider

Configure the LLM provider for the judge. The judge does not need the same provider or model as your AI agent. A lighter model often works well since the judge context is much smaller.

```yaml
camunda:
  process-test:
    connectors-secrets:
      AWS_BEDROCK_ACCESS_KEY: ${AWS_LLM_BEDROCK_ACCESS_KEY}
      AWS_BEDROCK_SECRET_KEY: ${AWS_LLM_BEDROCK_SECRET_KEY}
    judge:
      chat-model:
        provider: "amazon-bedrock"
        model: "eu.anthropic.claude-haiku-4-5-20251001-v1:0"
        region: "eu-central-1"
        credentials:
          access-key: ${AWS_LLM_BEDROCK_ACCESS_KEY}
          secret-key: ${AWS_LLM_BEDROCK_SECRET_KEY}
```

**Note: Bedrock IAM requirements**
The AWS principal must have `bedrock:InvokeModel` permission on each model ARN you configure, and each model must be [enabled for access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access-modify.html) in the configured region. If you also configure an embedding model through Bedrock for [semantic similarity assertions](#verify-with-semantic-similarity), it requires a separate IAM grant.

Use this provider for [Ollama](https://ollama.com/).

```yaml
camunda:
  process-test:
    judge:
      chat-model:
        provider: "openai-compatible"
        model: "gpt-oss:20b"
        base-url: "http://localhost:11434/v1"
```

**Tip: Manage secrets safely**
Avoid committing credentials to your test configuration files. CPT properties support [Spring's external configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html), so you can inject secrets through environment variables, CI/CD secret stores, or other techniques. See the [CPT configuration reference](https://docs.camunda.io/docs/next/apis-tools/testing/configuration) for details.

The AI agent can still interact with the configured LLM provider, while the test controls the tool executions.

For the full property reference, see [judge configuration](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#judge-configuration).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
