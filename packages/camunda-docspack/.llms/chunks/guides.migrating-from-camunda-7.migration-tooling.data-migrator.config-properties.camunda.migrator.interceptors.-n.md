# Configuration property reference — `camunda.migrator.interceptors.[n]`

Prefix: `camunda.migrator.interceptors.[n]`

There are two types of interceptors:

- **VariableInterceptors** for [runtime migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables#transformation)
- **EntityInterceptors** for [history migration](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history#entity-transformation)

The configuration is the same for both types.

| Property     | Type      | Description                                                                                                                                   |
| :----------- | :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `class-name` | `string`  | **Required.** Fully qualified class name of the interceptor (built-in or custom).                                                             |
| `enabled`    | `boolean` | Whether the interceptor is enabled. Default: `true` for all interceptors.                                                                     |
| `properties` | `map`     | Custom properties (key:value pairs) to configure the interceptor. Properties call setter methods on the interceptor class and pass the value. |

### Built-in interceptors

The following built-in interceptors are available and can be disabled:

**Validators (reject unsupported types):**

- `io.camunda.migration.data.impl.interceptor.ByteArrayVariableValidator`
- `io.camunda.migration.data.impl.interceptor.FileVariableValidator`
- `io.camunda.migration.data.impl.interceptor.ObjectJavaVariableValidator`

**Transformers (convert supported types):**

- `io.camunda.migration.data.impl.interceptor.PrimitiveVariableTransformer`
- `io.camunda.migration.data.impl.interceptor.StringVariableTransformer`
- `io.camunda.migration.data.impl.interceptor.NullVariableTransformer`
- `io.camunda.migration.data.impl.interceptor.DateVariableTransformer`
- `io.camunda.migration.data.impl.interceptor.ObjectJsonVariableTransformer`
- `io.camunda.migration.data.impl.interceptor.ObjectXmlVariableTransformer`
- `io.camunda.migration.data.impl.interceptor.SpinJsonVariableTransformer`
- `io.camunda.migration.data.impl.interceptor.SpinXmlVariableTransformer`

**Entity transformers:**

- `io.camunda.migration.data.impl.interceptor.history.entity.ProcessInstanceTransformer`
- `io.camunda.migration.data.impl.interceptor.history.entity.ProcessDefinitionTransformer`
- `io.camunda.migration.data.impl.interceptor.history.entity.FlowNodeTransformer`
- `io.camunda.migration.data.impl.interceptor.history.entity.UserTaskTransformer`
- `io.camunda.migration.data.impl.interceptor.history.entity.IncidentTransformer`
- `io.camunda.migration.data.impl.interceptor.history.entity.VariableTransformer`
- `io.camunda.migration.data.impl.interceptor.history.entity.DecisionInstanceTransformer`
- `io.camunda.migration.data.impl.interceptor.history.entity.DecisionDefinitionTransformer`
- `io.camunda.migration.data.impl.interceptor.history.entity.DecisionRequirementsDefinitionTransformer`

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties
