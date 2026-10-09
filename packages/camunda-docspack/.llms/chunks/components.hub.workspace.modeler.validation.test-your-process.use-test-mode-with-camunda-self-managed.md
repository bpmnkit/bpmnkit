# Test your process — Use Test mode with Camunda Self-Managed

After selecting the **Test** tab in Self-Managed, the Test view opens directly. The environment selection and deployment flow is the same as in SaaS, see [opening the Test tab](#opening-the-test-tab).

### Limitations {#self-managed-limitations}

- The environment variables `CAMUNDA_CUSTOM_CERT_CHAIN_PATH`, `CAMUNDA_CUSTOM_PRIVATE_KEY_PATH`, `CAMUNDA_CUSTOM_ROOT_CERT_PATH`, and `CAMUNDA_CUSTOM_ROOT_CERT_STRING` can be set in Docker or Helm chart setups. However, these configurations have not been tested with Test mode's behavior, and therefore are not supported when used with Test mode.
- Test mode cannot check the presence of connector secrets in Self-Managed setups.
  If a secret is missing, Test mode will show an incident at runtime.
  Learn more about [configuring connector secrets](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#secrets).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
