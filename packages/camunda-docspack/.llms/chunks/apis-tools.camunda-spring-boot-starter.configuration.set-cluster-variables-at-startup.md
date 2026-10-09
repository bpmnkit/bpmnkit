# Configuration — Set cluster variables at startup

To set cluster variables at application startup, use the `@ClusterVariables` annotation. Cluster variables are set when the Camunda client starts.

There are three ways to provide the variables:

### From JSON resource files

Provide one or more JSON resource files using the `resources` attribute:

```java
@ClusterVariables(resources = "classpath:cluster-variables.json")
@SpringBootApplication
public class MyApplication { }
```

Multiple files can be provided at once:

```java
@ClusterVariables(resources = {"classpath:vars-a.json", "classpath:vars-b.json"})
@SpringBootApplication
public class MyApplication { }
```

### From a method

Annotate a method with `@ClusterVariables`. The return value is serialized to JSON and set as cluster variables. Any type the configured `JsonMapper` can serialize is supported, for example `Map`, a POJO, or a record:

```java
@ClusterVariables
public MyConfig clusterVariables() {
  return new MyConfig("production", 3);
}
```

### From application properties

Define variables directly in your `application.yaml`:

```yaml
camunda:
  client:
    cluster-variables:
      global:
        environment: production
        maxRetries: 3
```

Variables defined in properties are applied in addition to any annotation-defined variables.

### Specify the tenant to set variables for

To set cluster variables scoped to a specific tenant, use the `tenantId` property of the `@ClusterVariables` annotation:

```java
@ClusterVariables(resources = "classpath:cluster-variables.json", tenantId = "myTenant")
@SpringBootApplication
public class MyApplication { }
```

Or use the `tenant` property in your `application.yaml`:

```yaml
camunda:
  client:
    cluster-variables:
      tenant:
        myTenant:
          environment: staging
          maxRetries: 5
```

By default, the annotation and `global` property set variables in the global scope.

### Disable cluster variable processing

To disable all cluster variable processing (both annotation-based and property-based), set:

```yaml
camunda:
  client:
    cluster-variables:
      enabled: false
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
