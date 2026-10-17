# History — Custom transformation — Limit interceptors by entity type

Entity interceptors can be restricted to specific entity types using the `getTypes()` method. Use Camunda 7 historic entity classes:

```java
// Example 1: Handle multiple specific types
public class MultiEntityInterceptor
    implements EntityInterceptor<Object, Object> {

    @Override
    public Set<Class<?>> getTypes() {
        // Handle only specific types
        return Set.of(
            ProcessDefinition.class,            // Process definitions
            HistoricProcessInstance.class,      // Process instances
            HistoricActivityInstance.class,     // Flow nodes/activities
            HistoricTaskInstance.class,         // User tasks
            HistoricVariableInstance.class,     // Variables
            HistoricIncident.class,             // Incidents
            HistoricDecisionInstance.class      // Decision instances
        );
    }

    @Override
    public void execute(Object entity, Object builder) {
        // Handle different entity types
        if (entity instanceof HistoricProcessInstance) {
            // Process instance logic
        } else if (entity instanceof HistoricActivityInstance) {
            // Flow node logic
        }
        // etc.
    }
}

// Example 2: Universal interceptor (handles all entity types)
public class EntityLogger
    implements EntityInterceptor<Object, Object> {

    @Override
    public Set<Class<?>> getTypes() {
        return Set.of(); // Empty set = handle all types
    }

    @Override
    public void execute(Object entity, Object builder) {
        // This will be called for all entity types
        System.out.println("Converting entity: " + entity.getClass().getSimpleName());
    }
}
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
