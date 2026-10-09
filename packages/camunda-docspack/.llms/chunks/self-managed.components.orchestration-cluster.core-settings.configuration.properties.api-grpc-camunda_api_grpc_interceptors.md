# Property reference — API - gRPC — `CAMUNDA_API_GRPC_INTERCEPTORS`

| Property                                    | Description                                                                                                                                          | Default value | Overridable per Physical Tenant |
| :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `CAMUNDA_API_GRPC_INTERCEPTORS`             | List of gRPC interceptor configurations.Each entry requires `ID`, `JARPATH`, and `CLASSNAME`.                                          | No entries    | No                              |
| `CAMUNDA_API_GRPC_INTERCEPTORS_0_ID`        | The unique identifier for a particular gRPC interceptor configuration.                                                                        | Null          | No                              |
| `CAMUNDA_API_GRPC_INTERCEPTORS_0_JARPATH`   | The file path to a JAR file that contains a custom gRPC interceptor implementation.                                                           | Null          | No                              |
| `CAMUNDA_API_GRPC_INTERCEPTORS_0_CLASSNAME` | Set the fully qualified class name of a custom gRPC interceptor implementation that should be loaded and executed by the Camunda gRPC server. | Null          | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
