# Property reference — API - REST — `CAMUNDA_API_REST_FILTERS`

| Property                               | Description                                                                                                                                                                                                                               | Default value | Overridable per Physical Tenant |
| :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `CAMUNDA_API_REST_FILTERS`             | This property is part of Camunda's REST filter system, which allows you to add filters to REST requests and responses.The property is a list of filter configurations, each requiring an `id`, `jar-path` and `class-name`. | No entries    | No                              |
| `CAMUNDA_API_REST_FILTERS_0_ID`        | The unique identifier for a particular REST filter configuration.                                                                                                                                                                  | Null          | No                              |
| `CAMUNDA_API_REST_FILTERS_0_JARPATH`   | The file path to a JAR file that contains a custom REST filter implementation.                                                                                                                                                     | Null          | No                              |
| `CAMUNDA_API_REST_FILTERS_0_CLASSNAME` | Set the fully qualified class name of a custom REST filter implementation that should be loaded and executed by the Camunda REST server.                                                                                           | Null          | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
