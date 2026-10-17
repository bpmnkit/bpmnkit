# Variables — Disabling built-in interceptors — Entity type filtering

In addition to filtering by variable type, interceptors can also filter by the source entity type. This is useful when you want different behavior for history/runtime process variables and decision inputs/outputs.

#### Available entity types

- `VariableInstanceEntity.class`: runtime process variables
- `HistoricVariableInstanceEntity.class`: historic process variables
- `HistoricDecisionInputInstanceEntity.class`: decision input variables
- `HistoricDecisionOutputInstanceEntity.class`: decision output variables

#### Example: process variables only

```java
public class ProcessVariableInterceptor implements VariableInterceptor {

    @Override
    public Set<Class<? extends ValueFields>> getEntityTypes() {
        // Only handle process variables (runtime and history)
        return Set.of(
            VariableInstanceEntity.class,
            HistoricVariableInstanceEntity.class
        );
    }

    @Override
    public void execute(VariableContext context) {
        // This is only called for process variables
        // not for decision inputs/outputs
    }
}
```

#### Example: decision variables only

```java
public class DecisionVariableInterceptor implements VariableInterceptor {

    @Override
    public Set<Class<? extends ValueFields>> getEntityTypes() {
        // Only handle decision inputs and outputs
        return Set.of(
            HistoricDecisionInputInstanceEntity.class,
            HistoricDecisionOutputInstanceEntity.class
        );
    }

    @Override
    public void execute(VariableContext context) {
        // This is only called for decision variables
    }
}
```

#### Default behavior

```java
// Empty set = handle all entity types
@Override
public Set<Class<? extends ValueFields>> getEntityTypes() {
    return Set.of();
}
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
