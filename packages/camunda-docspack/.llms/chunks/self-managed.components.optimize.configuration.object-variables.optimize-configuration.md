# Object and list variable support — Optimize configuration

As of Camunda 8.10, the import of object variable values is disabled by default. It can be enabled using the `zeebe.includeObjectVariableValue` configuration. Alternatively, this can be set using the `CAMUNDA_OPTIMIZE_ZEEBE_INCLUDE_OBJECT_VARIABLE` environment variable.

When enabled, each flattened property and the raw object itself are stored as separate variables. As a result, object-heavy processes can significantly increase Optimize's storage and CPU usage.
See [Impact of Optimize](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment#impact-of-optimize) for sizing guidance.

When disabled (the default), Optimize logs a `WARN` on startup as a reminder, and object variables are neither flattened nor stored.

Depending on where the imported object variables originate, the following configuration is required to ensure that your system produces object variable data that Optimize can import correctly:

If you are creating object variables using a Zeebe process, ensure date properties within the JSON object are stored using a common **date format** (for example `yyyy-MM-dd'T'HH:mm:ss.SSSZ`) other than unix timestamps. If Optimize imports unix timestamp date properties, these properties cannot be identified and parsed as dates and will instead be persisted as number variables.

External variables of type object require an additional field called `serializationDataFormat` which specifies which data format was used to serialize the given object.

Refer to the [external object variable API section](https://docs.camunda.io/docs/next/apis-tools/optimize-api/external-variable-ingestion) for further details on how to ingest external variables.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/object-variables
