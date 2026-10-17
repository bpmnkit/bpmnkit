# Variables — Disabling built-in interceptors — Creating a custom variable interceptor

Here's an example of a custom variable interceptor which is only called for string variables:

```java
public class MyVariableInterceptor implements VariableInterceptor {

    /**
     * Restrict this interceptor to only handle string variables.
     */
    @Override
    public Set<Class<?>> getTypes() {
        return Set.of(StringValue.class);
    }

    @Override
    public void execute(VariableContext context) {
      // Access the variable name
      String name = context.getName();

      // Get the Camunda 7 value
      Object c7Value = context.getC7Value();

      // Get the Camunda 7 entity
      VariableInstanceEntity variableInstance = context.getEntity();

      // Transform and set the Camunda 8 value
      context.setC8Value(transformedValue);
    }

}
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
