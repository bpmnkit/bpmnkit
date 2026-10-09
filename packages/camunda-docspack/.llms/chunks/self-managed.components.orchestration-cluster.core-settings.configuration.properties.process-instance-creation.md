# Property reference — Process instance creation

### application.yaml

### `camunda.process-instance-creation`

| Property                                                           | Description                                                                                                                                                                                                                                                                                                                                                              | Default value | Overridable per Physical Tenant |
| :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `camunda.process-instance-creation.business-id-uniqueness-enabled` | When enabled, process instance creation is rejected if a root process instance of the same process definition is already active with the same business ID.Requires the process instance creation request to include a businessId. See [business ID uniqueness control](https://docs.camunda.io/docs/next/components/concepts/process-instance-creation#uniqueness-control). | `false`       | Yes                             |

  
### env

### `CAMUNDA_PROCESSINSTANCECREATION`

| Property                                                      | Description                                                                                                                                                                                                                                                                                                                                                              | Default value | Overridable per Physical Tenant |
| :------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `CAMUNDA_PROCESSINSTANCECREATION_BUSINESSIDUNIQUENESSENABLED` | When enabled, process instance creation is rejected if a root process instance of the same process definition is already active with the same business ID.Requires the process instance creation request to include a businessId. See [business ID uniqueness control](https://docs.camunda.io/docs/next/components/concepts/process-instance-creation#uniqueness-control). | `false`       | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
