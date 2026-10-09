# Java client — What can you build with it? — Step 3: Start building your process application

With a connected client, you are ready to build your process application. Below are the core operations you’ll typically perform, along with guidance on the next steps.

#### Essential operations

**Deploy a process:**

```java
final DeploymentEvent deploymentEvent = client.newDeployResourceCommand()
    .addResourceFromClasspath("process.bpmn")
    .execute();
```

This deploys your BPMN process definition to the cluster. Place your `.bpmn` files in `src/main/resources` and reference them by filename.

**Start a process instance:**

```java
final ProcessInstanceEvent processInstanceEvent = client.newCreateInstanceCommand()
    .bpmnProcessId("my-process")
    .latestVersion()
    .variables(Map.of("orderId", "12345", "amount", 100.0))
    .execute();
```

This creates a new instance of your process. The `bpmnProcessId` should match the Process ID from your BPMN file, and you can pass initial variables as a Map.

For a comprehensive example demonstrating these steps, see the [DeployAndComplete example](https://github.com/camunda-community-hub/camunda-8-examples/blob/main/camunda-client-plain-java/src/main/java/io/camunda/example/e2e/process/DeployAndComplete.java) in the Camunda 8 examples repository. This example illustrates a complete workflow from process deployment to job completion.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started
