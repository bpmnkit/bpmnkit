# Backups — Configure this in Kubernetes with Helm

When you deploy Camunda 8 Self-Managed on Kubernetes, set the backup repository name as an application configuration value.

See [application configurations](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs) for how to provide configuration keys using Helm (for example, via values files or environment variable mappings).


## Configuration parameters

| Configuration key                     | Description                      | Default value |
| ------------------------------------- | -------------------------------- | ------------- |
| `camunda.data.backup.repository-name` | ES / OS snapshot repository name | -             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/backups
