# Management API — Exporters API

The Exporters API allows for enabling, disabling or deleting configured exporters. By default, all configured exporters are enabled.

The enable and disable functionality is specifically useful for [dual region deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops) operations.

- **Enabled**: Records are exported to the exporter. The log is compacted only after the records are exported.
- **Disabled**: Records are _not_ exported to the exporter, and the log is compacted.

**Info**
You can find the OpenAPI spec for this API in the [GitHub repository](https://github.com/camunda/camunda/blob/main/dist/src/main/resources/api/cluster/exporter-api.yaml).

**Note**
The `camunda‐zeebe‐gateway` service on port 9600 exposes the exporter endpoints.

### Enable an exporter

Enable a configured, disabled exporter:

```bash
POST actuator/exporters/{exporterId}/enable
```

When you enable the exporter, you can also optionally initialize it from another exporter using `initializeFrom`:

```bash
POST actuator/exporters/{exporterId}/enable
{
    initializeFrom: {anotherExporterId}
}
```

`initializeFrom` accepts an existing exporter's ID. Both the exporter you're enabling and the exporter you're initializing from must be the same [type](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/exporters). For example, you can't use an Elasticsearch exporter's ID to initialize an OpenSearch exporter.

After you enable the exporter, new records will be exported to it.

### Disable an exporter

To disable an exporter, send the following request to the gateway's management API:

```
POST actuator/exporters/{exporterId}/disable
```

After disabling the exporter, no records will be exported to this exporter. Other exporters continue exporting.

Removing an exporter from the cluster configuration through Helm values only drops it from the static configuration. For example, disabling Optimize removes the Elasticsearch or OpenSearch exporter. The exporter is still declared in the dynamic cluster configuration, which prevents log compaction and increases disk usage. To fully deactivate it, explicitly disable it using the request above, and confirm that every broker reports the exporter as `DISABLED` (see [Monitor an exporter](#monitor-an-exporter)).

### Delete an exporter

To delete an exporter permanently from the system, first remove the configuration of the exporter from the application. Then send the following request to the gateway's management API:

```
DELETE actuator/exporters/{exporterId}
```

If the configuration is deleted, the exporter remains in the system but enters a blocked state. This prevents log compaction and thus increases the disk usage.

- To fully remove the exporter, it must be deleted using the Management API to ensure all references to it are removed.
- To re-add the exporter, restore its configuration in the application properties and restart the system.

Alternatively, if you no longer wish to use an exporter, you can disable it using the management API. The exporter can be re-enabled at any time without requiring a system restart.

### Monitor an exporter

All requests to change the state of the exporters are processed asynchronously. To monitor the status of the exporters, send the following request to the gateway's management API:

```
GET actuator/exporters/
```

The response is a JSON object that lists all configured exporters with their status:

```json
[
  {
    "exporterId": "elasticsearch0",
    "status": "ENABLED"
  },
  {
    "exporterId": "elasticsearch1",
    "status": "DISABLED"
  }
]
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api
