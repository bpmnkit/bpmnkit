# Use the Camunda Helm Toolkit — Use the local Web UI

Start the toolkit in Docker to migrate and validate files through your browser.

```bash
docker run --rm --pull always \
  -p 127.0.0.1:8080:8080 \
  camunda/camunda-helm-toolkit:SNAPSHOT
```

Open [the local toolkit](http://localhost:8080) in your browser. If port 8080 is occupied, change the first port in the mapping and use that port in the browser URL.

1. Select **Migrate** and upload or paste your override files.
2. Select source version **8.9**. The toolkit chooses the next minor version, **8.10**, as the target.
3. Run the migration and review the findings alongside the YAML. Select a finding to locate the affected configuration.
4. Select the target-version document to inspect the migrated output. To correct it, select **Edit migrated**, make your changes, and select **Validate again**.
5. Download each migrated document. The download uses the document currently displayed, so confirm you're viewing the target version rather than the original input.

For a configuration check without migration, select **Validate**, provide your overrides, and choose their Camunda version. Stop the container with `Ctrl+C` when you're finished.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
