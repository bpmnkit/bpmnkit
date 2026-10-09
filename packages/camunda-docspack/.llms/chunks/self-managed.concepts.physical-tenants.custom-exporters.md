# Custom exporters for Physical Tenants

Learn how to assign a globally-defined custom exporter to specific Physical Tenants, or declare an exporter that is private to one tenant.


## About

Learn how custom exporters interact with Physical Tenants: exporters defined once at the root level and assigned to specific tenants, and exporters a tenant declares only for itself.

For the base exporter configuration properties (`camunda.data.exporters.*`), see the [Orchestration Cluster configuration properties](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundadataexporters) reference.


## Two ways to use a custom exporter with Physical Tenants

- **Global exporter, assigned to specific tenants**: Define the exporter once under the root `camunda.data.exporters.<exporter-id>.*` catalog, then list its ID under `camunda.physical-tenants.<tenant-key>.data.exporters-assigned` for every tenant that should run it. A tenant can only adjust the exporter's `args`; the `class-name` and `jar-path` always come from the root definition.

- **Tenant-private exporter**: Declare the exporter entirely under `camunda.physical-tenants.<tenant-key>.data.exporters.<exporter-id>.*`, using an ID that does not exist in the root catalog. The exporter is not shared with, or visible to, other tenants.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/custom-exporters
