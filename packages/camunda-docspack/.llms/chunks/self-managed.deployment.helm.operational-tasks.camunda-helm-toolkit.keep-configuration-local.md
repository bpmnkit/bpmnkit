# Use the Camunda Helm Toolkit — Keep configuration local

With the local Docker setup above, your YAML is processed by the container on your machine.

The Web UI has no authentication. Keep the `127.0.0.1` port binding and don't expose the service on a shared network. Downloading the image requires registry access; processing files doesn't require access to your Kubernetes cluster.

Treat input files, migrated files, and reports as potentially sensitive. They can contain configuration values, including credentials. Review them before sharing or committing them.

After reviewing the results, continue with [upgrading Camunda 8.9 to 8.10 using Helm](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100). The toolkit doesn't replace backups, non-production testing, or the required deployment and data-migration steps.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
