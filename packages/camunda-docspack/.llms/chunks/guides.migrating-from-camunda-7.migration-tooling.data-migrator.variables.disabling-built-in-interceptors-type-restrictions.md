# Variables — Disabling built-in interceptors — Type restrictions

Variable interceptors can be restricted to specific variable types using the `getTypes()` method. You can find a complete list of available variable types for restriction as subinterfaces of the `TypedValue` interface in the [JavaDoc](https://docs.camunda.org/javadoc/camunda-bpm-platform/7.24/org/camunda/bpm/engine/variable/value/TypedValue.html#:~:text=All%20Known%20Subinterfaces%3A).

```java
@Override
public Set<Class<?>> getTypes() {
    // Handle only specific types
    return Set.of(
        BooleanValue.class,      // Boolean values
        IntegerValue.class,      // Integer values
        LongValue.class,         // Long values
        DoubleValue.class,       // Double values
        ShortValue.class,        // Short values
        StringValue.class,       // String values
        PrimitiveValue.class,    // String, Integer, Boolean, etc.
        DateValue.class,         // Date variables
        ObjectValue.class        // JSON, XML, Java serialized objects
    );
}
```

```java
// Or handle all types (default behavior)
@Override
public Set<Class<?>> getTypes() {
    return Set.of(); // Empty set = handle all types
}
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
