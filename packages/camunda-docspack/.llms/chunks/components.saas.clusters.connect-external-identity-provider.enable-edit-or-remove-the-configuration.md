# Connect an external identity provider — Enable, edit, or remove the configuration

- **Enable** the toggle to let users sign in through the configured provider. Enabling or disabling this setting restarts your cluster; your cluster is briefly unavailable while it restarts.
- **Disable** the toggle to stop accepting sign-ins from your provider. Camunda retains the configuration and client secret, so you can re-enable it later without entering the details again.
- **Edit** the configuration to change any field. Leave **Client secret** blank to keep the current secret. Saving an edit doesn't immediately restart the cluster: the new secret syncs to the cluster in the background, which can take up to a minute.
- **Delete configuration** permanently removes the provider configuration and its client secret, and restarts your cluster. To use the provider again, enter the full configuration and a new client secret.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/connect-external-identity-provider
