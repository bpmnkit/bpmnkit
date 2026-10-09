# Property reference — Licensing

Installations of Camunda 8 Self-Managed that require a license can provide their license key to the components. See [licensing](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/licensing).

  
### application.yaml

### `camunda.license`

| Property              | Description                                                                 | Default value | Overridable per Physical Tenant |
| :-------------------- | :-------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `camunda.license.key` | Your Camunda 8 license key, if your installation requires a license. | Null          | No                              |

  
### env

### `CAMUNDA_LICENSE`

| Property              | Description                                                                 | Default value | Overridable per Physical Tenant |
| :-------------------- | :-------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `CAMUNDA_LICENSE_KEY` | Your Camunda 8 license key, if your installation requires a license. | Null          | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
