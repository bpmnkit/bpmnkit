# Variables — Disabling built-in interceptors — Detecting migration context

Variable interceptors can detect whether they are running in a runtime or history migration context:

```java
@Override
public void execute(VariableContext context) {
    if (context.isRuntime()) {
        // Handle runtime migration
        // Example: Deserialize JSON to Map
    } else if (context.isHistory()) {
        // Handle history migration
        // Example: Keep JSON as string
    }
}
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
