# Install app integrations — Step 3: Configure the App Integrations exporter

The App Integrations backend requires a Zeebe exporter to be configured in your Camunda orchestration cluster. This exporter streams process data to the App Integrations backend.

Add the following configuration to your orchestration cluster Helm chart values:

```yaml
orchestration:
  exporters:
    appIntegrations:
      apiKey:
        secret:
          existingSecret: app-integrations-secret
          existingSecretKey: apiKey
  extraConfiguration:
    - file: application.app-int.yaml
      content: |
        zeebe:
          broker:
            exporters:
              appIntegrations:
                className: "io.camunda.exporter.appint.AppIntegrationsExporter"
                args:
                  url: <your-app-integrations-url>/api/event/exporter/batch
```

- Replace `<your-app-integrations-url>` with the base URL of your App Integrations backend. The URL must point to the `/api/event/exporter/batch` endpoint (for example, `https://app-integrations.camunda.your-domain.com/api/event/exporter/batch`).

- The `args.url` must include the full path `/api/event/exporter/batch`. This is the batch event ingestion endpoint of the App Integrations backend. The exporter will POST batches of process events to this endpoint.

- The `existingSecret` references a Kubernetes Secret containing the API key. Create this secret in your cluster before deploying:

  ```bash
  kubectl create secret generic app-integrations-secret --from-literal=apiKey=<your-exporter-api-key>
  ```

**Note**
The same API key must be set in the `exporter.apiKey` field of the App Integrations [configuration file](#step-4-create-the-configuration-file) so that the backend can authenticate with the exporter endpoint.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
