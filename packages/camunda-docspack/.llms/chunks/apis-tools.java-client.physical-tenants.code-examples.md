# Physical Tenants — Code examples

### Create a process instance scoped to a Physical Tenant

```java
teamaClient.newCreateInstanceCommand()
    .bpmnProcessId("order-process")
    .latestVersion()
    .send()
    .join();
```

The process instance is created within Physical Tenant `teama`. No additional API parameter is needed — the client's `physicalTenantId` determines the target.

### Register a job worker

### single

```java
teamaClient.newWorker()
    .jobType("shipOrder")
    .handler(new ShipOrderHandler())
    .open();
```

This worker only polls Physical Tenant `teama` — the targeting comes from the client, on whichever protocol it uses.

### multi

There's no single worker registration that spans Physical Tenants. Open the same job type on each client instance:

```java
Stream.of(teamaClient, teambClient)
    .forEach(client -> client.newWorker()
        .jobType("shipOrder")
        .handler(new ShipOrderHandler())
        .open());
```

Each registration opens an independent polling loop against its own client's Physical Tenant. Inside the handler, call `activatedJob.getPhysicalTenantId()` to find out which Physical Tenant the job belongs to — this is populated on every `ActivatedJob`, whether the job arrived over gRPC or REST, and returns the ID of the Physical Tenant the activation request was routed to, which is the default Physical Tenant when the request did not target one:

```java
public class ShipOrderHandler implements JobHandler {
  @Override
  public void handle(JobClient client, ActivatedJob job) {
    String physicalTenantId = job.getPhysicalTenantId();
    // route or log based on physicalTenantId as needed
  }
}
```

### Update a variable scoped to a Physical Tenant

```java
teamaClient.newSetVariablesCommand(processInstanceKey)
    .variables(Map.of("status", "shipped"))
    .send()
    .join();
```

`processInstanceKey` values are only valid within the Physical Tenant that created them — using a key from `teamb` against `teamaClient` fails, since the instance doesn't exist from `teama`'s perspective.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/physical-tenants
