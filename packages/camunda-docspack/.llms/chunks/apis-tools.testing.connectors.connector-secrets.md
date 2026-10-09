# Connectors — Connector secrets

If you use [Connectors secrets](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#using-secrets) in your processes, you can
add the secrets to the test runtime in the following way.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    connectors-enabled: true
    connectors-secrets:
      GITHUB_TOKEN: ghp_secret
      SLACK_TOKEN: xoxb-secret
```

Or, on your test class:

```java
@SpringBootTest(
    properties = {
        "camunda.process-test.connectors-enabled=true",
        "camunda.process-test.connectors-secrets.GITHUB_TOKEN=ghp_secret",
        "camunda.process-test.connectors-secrets.SLACK_TOKEN=xoxb-secret"
    }
)
@CamundaSpringProcessTest
public class MyProcessTest {
    //
}
```

In your `/camunda-container-runtime.properties` file:

```properties
connectorsEnabled=true

connectorsSecrets.GITHUB_TOKEN=ghp_secret
connectorsSecrets.SLACK_TOKEN=xoxb-secret
```

Or, via JUnit extension:

```java
// No annotation: @CamundaProcessTest
public class MyProcessTest {

    @RegisterExtension
    private static final CamundaProcessTestExtension EXTENSION =
        new CamundaProcessTestExtension()
            .withConnectorsEnabled(true)
            .withConnectorsSecret("GITHUB_TOKEN", "ghp_secret")
            .withConnectorsSecret("SLACK_TOKEN", "xoxb-secret");
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/connectors
