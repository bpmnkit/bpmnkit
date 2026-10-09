# History — Custom transformation — Type-safe API

The `EntityInterceptor` interface uses Java generics to provide compile-time type safety:

```java
public interface EntityInterceptor<C7, C8> {
    void execute(C7 entity, C8 builder);
    // ...
}
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
