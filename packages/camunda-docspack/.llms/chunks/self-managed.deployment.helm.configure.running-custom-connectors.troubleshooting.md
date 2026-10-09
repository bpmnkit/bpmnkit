# Run custom connectors in Helm charts — Troubleshooting

If your custom connector does not start:

- Verify that your connector JAR is present in the `/opt/custom` folder in the pod.
- Confirm that the original connector JAR matches the one in `/opt/custom`. A file size check is often sufficient, but you can also compare checksums if needed.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/running-custom-connectors
