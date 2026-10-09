# Property changes in Camunda 8.9

Configuration property changes and backwards compatibility information for new Camunda 8.9 properties and legacy properties.

Changes to component configuration properties introduced in Camunda 8.9.


## About unified configuration property changes

In Camunda 8.9, all remaining [unified configuration property changes](https://docs.camunda.io/docs/next/versioned_docs/version-8.8/reference/announcements-release-notes/880/whats-new-in-88) are complete.

**Info**
To learn more about the property changes introduced in Camunda 8.8, see [property changes in Camunda 8.8](https://docs.camunda.io/docs/next/versioned_docs/version-8.8/self-managed/components/orchestration-cluster/core-settings/configuration/configuration-mapping).

### New properties and backwards compatibility

Backwards compatibility between new Camunda 8.9 unified properties and existing legacy properties is as follows:

| Type                                                                                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :--------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Breaking change | New unified property with an existing equivalent legacy property or set of properties.Backwards compatibility is **not** supported.You should move legacy properties marked with breaking change to the new unified set before upgrading to Camunda 8.9.You can keep legacy properties in your configuration file as long as they match the new unified configuration equivalent property. However, this is not recommended as it can lead to misconfiguration. If the values do not match, the application will not start, and an error will be logged. |
| Direct mapping                                              | New unified property with a direct mapping to an existing equivalent legacy property or set of properties.Backwards compatibility is supported as follows:If you have defined the new property, it is used.If you have not defined the new property, the legacy property is used.                                                                                                                                                                                                                                                                        |
| New                                                                    | New unified property without an existing equivalent legacy property.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

### Recommended actions

**As part of upgrading to Camunda 8.9, replace any legacy properties shown in the [Camunda 8.9 property changes table](#camunda-89-property-changes) below with the equivalent new unified configuration property.**

You can define configuration properties as environment variables using [Spring Boot conventions](https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables). To define an environment variable, convert the configuration property to uppercase, remove any dashes, and replace any delimiters (.) with \_. For example:

| Property                                   | Environment variable                    |
| :----------------------------------------- | :-------------------------------------- |
| `camunda.api.grpc.address`                 | `CAMUNDA_API_GRPC_ADDRESS`              |
| `camunda.api.grpc.min-keep-alive-interval` | `CAMUNDA_API_GRPC_MINKEEPALIVEINTERVAL` |

### Example

In this example, an application uses the following legacy configuration:

```
camunda.database.url=http://prod-db.com:54321
camunda.operate.opensearch.url=http://prod-db.com:54321
camunda.tasklist.opensearch.url=http://prod-db.com:54321
```

Remove the legacy properties and add the corresponding new property:

```
camunda.data.secondary-storage.opensearch.url=http://prod-db.com:54321
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/configuration-mapping
