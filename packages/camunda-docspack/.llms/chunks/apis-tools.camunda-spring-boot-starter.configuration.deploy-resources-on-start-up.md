# Configuration — Deploy resources on start-up

To deploy process models at application startup, use the `@Deployment` annotation:

```java
@Deployment(resources = "classpath:demoProcess.bpmn")
public class MyRandomBean {
  // make sure this bean is registered
}
```

**Note: Multi-client applications**
In a [multi-client](#multi-client-configuration-physical-tenants) application, every `@Deployment` resource is deployed to **all** configured clients — one `CamundaPostDeploymentSpringEvent` is published per client. For a multi-tenant application, this means your BPMN lands in every configured Physical Tenant, which is often what you want, but shouldn't come as a surprise. The same applies to `@ClusterVariables` processing.

### Specify resources to deploy

This annotation uses the [Spring resource loader](https://docs.spring.io/springframework/reference/core/resources.html) and can deploy multiple files at once. For example:

```java
@Deployment(resources = {"classpath:demoProcess.bpmn" , "classpath:demoProcess2.bpmn"})
```

Or, define wildcard patterns:

```java
@Deployment(resources = "classpath*:/bpmn/**/*.bpmn")
```

The resource loader automatically searches the entire classpath, including dependency JARs. To deploy only the resources packaged with the annotated class, use:

```java
@Deployment(resources = "classpath*:/bpmn/**/*.bpmn", ownJarOnly = true)
```

You can also set this globally:

```yaml
camunda:
  client:
    deployment:
      own-jar-only: true
```

### Specify the tenant to deploy to

To adjust the tenant to deploy to, set the `tenantId` property of the `@Deployment` annotation:

```java
@Deployment(resources = "classpath:demoProcess.bpmn", tenantId = "myTenant")
public class MyRandomBean {
  // make sure this bean is registered
}
```

By default, the starter uses the `tenantId` from `camunda.client.tenant-id`.

### Disable deployment

To disable the deployment of annotations, you can set:

```yaml
camunda:
  client:
    deployment:
      enabled: false
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
