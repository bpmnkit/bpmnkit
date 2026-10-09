# Camunda components metrics — Available metrics — Process processing metrics

The following metrics are related to process processing:

| Metric                                     | Description                                                                                                                                                                                                                        |
| :----------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zeebe_stream_processor_records_total`     | The number of events processed by the stream processor. The `action` label separates processed, skipped, and written events.                                                                                                       |
| `zeebe_exporter_events_total`              | The number of events processed by the exporter processor. The `action` label separates exported and skipped events.                                                                                                                |
| `zeebe_element_instance_events_total`      | The number of occurred process element instance events. The `action` label separates the number of activated, completed, and terminated elements. The `type` label separates different BPMN element types.                         |
| `zeebe_job_events_total`                   | The number of job events. The `action` label separates the number of created, activated, timed out, completed, failed, and canceled jobs.                                                                                          |
| `zeebe_incident_events_total`              | The number of incident events. The `action` label separates the number of created and resolved incident events.                                                                                                                    |
| `zeebe_pending_incidents_total`            | The number of currently pending incidents, that is, not resolved.                                                                                                                                                                  |
| `zeebe_process_definitions_draining_count` | The number of process definitions currently draining, that is, deleted but retained until their running process instances finish. Metric type: gauge, reported on the partition leader.Labels: `physicalTenant`, `partition`. |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
