# Test your AI agents with CPT — Step 3: Set up the test class

Add the `@Deployment` annotation to your Spring Boot application class to declare which resources CPT should deploy:

```java
@SpringBootApplication
@Deployment(resources = {"classpath*:/bpmn/**/*.bpmn", "classpath*:/forms/**/*.form"})
public class MyApplication {}
```

Then create a test class annotated with `@SpringBootTest` and `@CamundaSpringProcessTest`, and inject the `CamundaClient` and `CamundaProcessTestContext`:

```java
@SpringBootTest(classes = MyApplication.class)
@CamundaSpringProcessTest
class AiAgentProcessTest {

    @Autowired
    private CamundaClient client;

    @Autowired
    private CamundaProcessTestContext processTestContext;
}
```

For the full setup including dependencies and project structure, see [Getting started with Camunda Process Test](https://docs.camunda.io/docs/next/apis-tools/testing/getting-started).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents
