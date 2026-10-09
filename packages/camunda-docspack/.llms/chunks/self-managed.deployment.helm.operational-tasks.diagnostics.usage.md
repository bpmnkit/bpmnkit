# Helm chart diagnostics — Usage

1. Save the following script as `camunda-collect-diagnostics.sh` for example.
2. Make the script executable:

```bash
chmod +x camunda-collect-diagnostics.sh
```

3. Execute the script, replacing `<namespace>` with the namespace of your Camunda deployment:

```bash
./camunda-collect-diagnostics.sh --namespace <namespace>
```

4. **Review the generated `.zip` archive** and remove any sensitive or personally identifiable information (PII) before sharing.

5. Share the reviewed `.zip` archive with Camunda Support.

#### Required/Optional flags

| Flag                           | Description                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| `--namespace <namespace>`      | **(Required)** Kubernetes namespace of your Camunda deployment.         |
| `--skip-es-os`                 | Skip Elasticsearch/OpenSearch diagnostics entirely.                     |
| `--export-post-importer-queue` | Export Operate post-importer queue documents (not exported by default). |
| `--es-user <user>`             | Username for Elasticsearch/OpenSearch Basic authentication.             |
| `--es-password <password>`     | Password for Elasticsearch/OpenSearch Basic authentication.             |
| `--es-port <port>`             | Elasticsearch/OpenSearch port (default: `9200`).                        |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/diagnostics
