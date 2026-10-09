# History — Custom transformation — Create a custom entity interceptor

Here's an example of a custom entity interceptor which is only called for process instances:

```java
public class ProcessInstanceEnricher
    implements EntityInterceptor<HistoricProcessInstance, ProcessInstanceDbModel.ProcessInstanceDbModelBuilder> {

    /**
     * Restrict this interceptor to only handle process instances.
     */
    @Override
    public Set<Class<?>> getTypes() {
        return Set.of(HistoricProcessInstance.class);
    }

    @Override
    public void execute(HistoricProcessInstance entity,
                        ProcessInstanceDbModel.ProcessInstanceDbModelBuilder builder) {
        // Custom conversion logic
        // For example, add custom metadata or modify the conversion
      builder.processDefinitionId(entity.getProcessDefinitionKey());
    }
}
```

#### Access Camunda 7 process engine

To retrieve information from Camunda 7 entities, use the `EntityConversionContext` parameter which provides access to the `processEngine`.

Use it to access services such as `RepositoryService` and `RuntimeService`. Fetch additional data as needed from other Camunda 7 entities.

```java
public class ProcessInstanceEnricher
    implements EntityInterceptor<HistoricProcessInstance, ProcessInstanceDbModel.ProcessInstanceDbModelBuilder> {

    @Override
    public Set<Class<?>> getTypes() {
        return Set.of(HistoricProcessInstance.class);
    }

    /**
     * Alternative execute signature with EntityConversionContext access.
     * This signature gives you access to the process engine and other context.
     */
    @Override
    public void execute(EntityConversionContext<HistoricProcessInstance,
                                                ProcessInstanceDbModel.ProcessInstanceDbModelBuilder> context) {
        // Access the entity and builder from context
        HistoricProcessInstance entity = context.getC7Entity();
        ProcessInstanceDbModel.ProcessInstanceDbModelBuilder builder = context.getC8DbModelBuilder();

        // Use ProcessEngine to retrieve deployment information from Camunda 7 process engine
        ProcessEngine processEngine = context.getProcessEngine();

        // Example: Retrieve the deployment ID from the process definition
        String deploymentId = processEngine.getRepositoryService()
            .createProcessDefinitionQuery()
            .processDefinitionKey(entity.getProcessDefinitionKey())
            .singleResult()
            .getDeploymentId();

        // Custom conversion logic using the retrieved data
        // ...
    }
}
```

**Note:** The `EntityInterceptor` interface provides two `execute` method signatures:

- `execute(C7 entity, C8 builder)` - Simple type-safe signature for basic transformations
- `execute(EntityConversionContext<C7, C8> context)` - Full signature with access to process engine and other context

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
