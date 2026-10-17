# Variables — Unsupported types

When a process instance contains unsupported variable types, the migrator will:

- Skip the entire process instance
- Log a detailed error message indicating the variable type that caused the skip
- Mark the instance as skipped for potential retry after manual intervention

The following Camunda 7 variable types are **not supported** and will cause the process instance migration to be skipped:

| Camunda 7 Type          | Example                                                                                                                              | Interceptor Type                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Byte Array              | `"hello".getBytes()`                                                                                                                 | `BytesValue`, `PrimitiveValue`     |
| File                    | `FileValue` objects                                                                                                                  | `FileValue`                        |
| Java Serialized Objects | Java objects serialized as `application/x-java-serialized-object` like `List`, `Set`, `Map`, `float`, `byte`, `char` or custom types | `ObjectValue`, `SerializableValue` |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
