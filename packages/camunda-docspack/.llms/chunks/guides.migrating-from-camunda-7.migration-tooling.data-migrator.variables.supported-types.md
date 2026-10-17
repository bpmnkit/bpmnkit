# Variables — Supported types

The following table shows how the migrator handles different Camunda 7 variable types:

| Camunda 7 Type                 | Example Value         | Migration Behavior      | Camunda 8 Result  | Interceptor Type                   |
| ------------------------------ | --------------------- | ----------------------- | ----------------- | ---------------------------------- |
| String                         | `"hello world"`       | Direct migration        | String value      | `StringValue`, `PrimitiveValue`    |
| Boolean                        | `true`, `false`       | Direct migration        | Boolean value     | `BooleanValue`, `PrimitiveValue`   |
| Integer                        | `42`, `1234`          | Direct migration        | Number value      | `IntegerValue`, `PrimitiveValue`   |
| Long                           | `123456789L`          | Direct migration        | Number value      | `LongValue`, `PrimitiveValue`      |
| Double                         | `3.14159`             | Direct migration        | Number value      | `DoubleValue`, `PrimitiveValue`    |
| Short                          | `(short) 1`           | Direct migration        | Number value      | `ShortValue`, `PrimitiveValue`     |
| Null                           | `null`                | Direct migration        | Null value        | `NullValueImpl`                    |
| Date                           | `new Date()`          | Converted to ISO format | String (ISO 8601) | `DateValue`, `PrimitiveValue`      |
| Java Object serialized as JSON | Serialized JSON       | Converted to Map        | JSON object       | `ObjectValue`, `SerializableValue` |
| Spin JSON                      | `SpinJsonNode`        | Converted to Map        | JSON object       | `SpinValue`, `SerializableValue`   |
| Spin XML                       | `SpinXmlElement`      | Converted to String     | String (raw XML)  | `SpinValue`, `SerializableValue`   |
| Java Object serialized as XML  | XML serialized object | Converted to String     | String (raw XML)  | `ObjectValue`, `SerializableValue` |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
