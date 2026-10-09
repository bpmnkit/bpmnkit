# Use credentials — Edit or upgrade a credential

Editing a credential opens the same form, pre-filled with its current values. Saving replaces the credential's values on Camunda, which takes effect immediately for every process that references it.

Upgrading a credential opens the same form and shows the fields that the newer credential version adds. Fill them in and save to make the credential usable with the connector version you are modeling against.


## Credential scope {#credential-scope}

A credential you create from Desktop Modeler is stored on the Camunda instance you are connected to, and is not registered centrally. It does not appear on the **Managed in Hub** tab of the [**Credentials** page in Camunda Hub](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index#managed-credentials).

To manage it centrally, find it on the [**Environments only** tab in Camunda Hub](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index#environments-only-credentials) and add it.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/credentials
