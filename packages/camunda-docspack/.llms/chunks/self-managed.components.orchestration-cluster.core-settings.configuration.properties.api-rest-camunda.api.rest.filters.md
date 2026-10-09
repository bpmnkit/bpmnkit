# Property reference — API - REST — `camunda.api.rest.filters`

| Property                              | Description                                                                                                                                                                                                                               | Default value | Overridable per Physical Tenant |
| :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `camunda.api.rest.filters[]`          | This property is part of Camunda's REST filter system, which allows you to add filters to REST requests and responses.The property is a list of filter configurations, each requiring an `id`, `jar-path` and `class-name`. | No entries    | No                              |
| `camunda.api.rest.filters[].id`       | The unique identifier for a particular REST filter configuration.                                                                                                                                                                  | Null          | No                              |
| `camunda.api.rest.filters.jar-path`   | The file path to a JAR file that contains a custom REST filter implementation.                                                                                                                                                     | Null          | No                              |
| `camunda.api.rest.filters.class-name` | Set the fully qualified class name of a custom REST filter implementation that should be loaded and executed by the Camunda REST server.                                                                                           | Null          | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
