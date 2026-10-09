# Configuration — Job worker configuration options — Further job worker configuration options

#### Disable a job worker

You can disable workers via the `enabled` parameter of the `@JobWorker` annotation:

```java
@JobWorker(enabled = false)
public void processOrder() {
  // worker's code - now disabled
}
```

You can also override this setting via your `application.yaml` file:

```yaml
camunda:
  client:
    worker:
      override:
        processOrder:
          enabled: false
```

This is especially useful if you have a bigger code base including many workers, but want to start only some of them. Typical use cases are:

- Testing: You only want one specific worker to run at a time.
- Load balancing: You want to control which workers run on which instance of cluster nodes.
- Migration: There are two applications, and you want to migrate a worker from one to another. With this switch, you can disable workers via configuration in the old application once they are available within the new.

To disable all workers, but still have the Camunda client available, you can use:

```yaml
camunda:
  client:
    worker:
      defaults:
        enabled: false
```

#### Configure jobs in flight

Number of jobs for a worker that are polled from the broker to be worked on in this client:

```java
@JobWorker(maxJobsActive = 64)
public void processOrder() {
  // worker's code
}
```

This can also be configured as property:

```yaml
camunda:
  client:
    worker:
      override:
        processOrder:
          max-jobs-active: 64
```

To configure a global default, you can set:

```yaml
camunda:
  client:
    worker:
      defaults:
        max-jobs-active: 64
```

#### Enable job streaming

Read more about this feature in the [job streaming documentation](https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker#job-streaming).

Job streaming is disabled by default for job workers. To enable job streaming on the Camunda client, configure it as follows:

```java
@JobWorker(streamEnabled = true)
public void processOrder() {
  // worker's code
}
```

This can also be configured as property:

```yaml
camunda:
  client:
    worker:
      override:
        processOrder:
          stream-enabled: true
```

To configure a global default, you can set:

```yaml
camunda:
  client:
    worker:
      defaults:
        stream-enabled: true
```

#### Control tenant usage

Job workers can be configured to work on jobs from specific [tenants](#multi-tenancy) using either [specific tenant IDs](#filtering-by-provided-tenant-IDs) or the [assigned tenants in the engine](#filtering-by-assigned-tenants).

##### Filter by assigned tenants

You can configure a job worker to use the tenants assigned to it in the engine, rather than providing explicit tenant IDs. Use the `tenantFilter` annotation property with `TenantFilter.ASSIGNED`:

```java
@JobWorker(tenantFilter = TenantFilter.ASSIGNED)
public void processOrder() {
  // worker's code
}
```

When `TenantFilter.ASSIGNED` is set, any `tenant-ids` configured via the annotation or YAML are ignored.

You can also override the tenant filter for a specific worker:

```yaml
camunda:
  client:
    worker:
      override:
        processOrder:
          tenant-filter: ASSIGNED
```

To configure a global default:

```yaml
camunda:
  client:
    worker:
      defaults:
        tenant-filter: ASSIGNED
```

##### Filter by provided tenant IDs

The default behaviour is `TenantFilter.PROVIDED`, where the worker retrieves jobs for the tenant IDs explicitly configured. Configure global worker defaults for additional `tenant-ids` to be used by all workers:

```yaml
camunda:
  client:
    worker:
      defaults:
        tenant-ids:
          - <default>
          - foo
```

Additionally, you can set `tenantIds` on the job worker level by using the annotation:

```java
@JobWorker(tenantIds="myOtherTenant")
public void processOrder() {
  // worker's code
}
```

You can also override the `tenant-ids` for each worker:

```yaml
camunda:
  client:
    worker:
      override:
        processOrder:
          tenants-ids:
            - <default>
            - foo
```

##### Physical Tenant fan-out for multi-client applications

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
