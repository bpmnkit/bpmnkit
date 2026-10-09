# Restore troubleshooting — API error reference

| Code  | Meaning                                                                                             |
| ----- | --------------------------------------------------------------------------------------------------- |
| `400` | Invalid restore input (for example, legacy backup, backup not complete, compatibility check failed) |
| `404` | Cluster or backup was not found                                                                     |
| `409` | Another restore is already in progress                                                              |
| `501` | Restore feature flag is not enabled                                                                 |
| `500` | Internal server or Kubernetes API error                                                             |

---
Source: https://docs.camunda.io/docs/next/components/saas/restore-troubleshooting
