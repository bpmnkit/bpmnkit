# Configuration — Testcontainers runtime — Multi-tenancy

Multi-tenancy is disabled by default. You can enable multi-tenancy in the following way:

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    # Enable multi-tenancy
    multi-tenancy-enabled: true
```

By enabling multi-tenancy, the runtime enables Basic Auth security and creates a default user with username/password
`demo` with admin rights to interact with the runtime.

A process test using multi-tenancy could look like the following example:

```java

@SpringBootTest
@CamundaSpringProcessTest
public class MyProcessTest {

    private static final String DEFAULT_USERNAME = "demo";

    private static final String TENANT_ID_1 = "tenant-1";
    private static final String TENANT_ID_2 = "tenant-2";

    @Autowired
    private CamundaClient client;
    @Autowired
    private CamundaProcessTestContext processTestContext;

    private CamundaClient clientForTenant1;

    @BeforeEach
    void setupTenants() {
        // create tenants
        client.newCreateTenantCommand().tenantId(TENANT_ID_1).name(TENANT_ID_1).send().join();
        client.newCreateTenantCommand().tenantId(TENANT_ID_2).name(TENANT_ID_2).send().join();

        // assign the default user to the tenants
        client
                .newAssignUserToTenantCommand()
                .username(DEFAULT_USERNAME)
                .tenantId(TENANT_ID_1)
                .send()
                .join();
        client
                .newAssignUserToTenantCommand()
                .username(DEFAULT_USERNAME)
                .tenantId(TENANT_ID_2)
                .send()
                .join();

        // create a client for tenant 1
        clientForTenant1 =
                processTestContext.createClient(
                        clientBuilder -> clientBuilder.defaultTenantId(TENANT_ID_1));
    }

    @Test
    void createProcessInstance() {
        // given
        clientForTenant1
                .newDeployResourceCommand()
                .addResourceFromClasspath("bpmn/order-process.bpmn")
                .send()
                .join();

        // when
        final var processInstance =
                clientForTenant1
                        .newCreateInstanceCommand()
                        .bpmnProcessId("order-process")
                        .latestVersion()
                        .variable("order_id", "order-1")
                        .send()
                        .join();

        // then
        assertThatProcessInstance(processInstance).isCreated();

        Assertions.assertThat(processInstance.getTenantId()).isEqualTo(TENANT_ID_1);
    }
}
```

In your `/camunda-container-runtime.properties` file:

```properties
# Enable multi-tenancy
multiTenancyEnabled=true
```

Alternatively, you can register the JUnit extension manually and use the fluent builder:

```java
package com.example;

import io.camunda.process.test.api.CamundaProcessTestExtension;
import org.junit.jupiter.api.extension.RegisterExtension;

// No annotation: @CamundaProcessTest
public class MyProcessTest {

    @RegisterExtension
    private static final CamundaProcessTestExtension EXTENSION =
            new CamundaProcessTestExtension()
                    // Enable multi-tenancy
                    .withMultiTenancyEnabled(true);
}
```

By enabling multi-tenancy, the runtime enables Basic Auth security and creates a default user with username/password
`demo` with admin rights to interact with the runtime.

A process test using multi-tenancy could look like the following example:

```java

@CamundaProcessTest
public class MyProcessTest {

    private static final String DEFAULT_USERNAME = "demo";

    private static final String TENANT_ID_1 = "tenant-1";
    private static final String TENANT_ID_2 = "tenant-2";

    private CamundaClient client;
    private CamundaProcessTestContext processTestContext;

    private CamundaClient clientForTenant1;

    @BeforeEach
    void setupTenants() {
        // create tenants
        client.newCreateTenantCommand().tenantId(TENANT_ID_1).name(TENANT_ID_1).send().join();
        client.newCreateTenantCommand().tenantId(TENANT_ID_2).name(TENANT_ID_2).send().join();

        // assign the default user to the tenants
        client
                .newAssignUserToTenantCommand()
                .username(DEFAULT_USERNAME)
                .tenantId(TENANT_ID_1)
                .send()
                .join();
        client
                .newAssignUserToTenantCommand()
                .username(DEFAULT_USERNAME)
                .tenantId(TENANT_ID_2)
                .send()
                .join();

        // create a client for tenant 1
        clientForTenant1 =
                processTestContext.createClient(
                        clientBuilder -> clientBuilder.defaultTenantId(TENANT_ID_1));
    }

    @Test
    void createProcessInstance() {
        // given
        clientForTenant1
                .newDeployResourceCommand()
                .addResourceFromClasspath("bpmn/order-process.bpmn")
                .send()
                .join();

        // when
        final var processInstance =
                clientForTenant1
                        .newCreateInstanceCommand()
                        .bpmnProcessId("order-process")
                        .latestVersion()
                        .variable("order_id", "order-1")
                        .send()
                        .join();

        // then
        assertThatProcessInstance(processInstance).isCreated();

        Assertions.assertThat(processInstance.getTenantId()).isEqualTo(TENANT_ID_1);
    }
}
```

**Info**
You should assign the default user (`demo`) to all tenants to ensure that the assertions can access all data.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
