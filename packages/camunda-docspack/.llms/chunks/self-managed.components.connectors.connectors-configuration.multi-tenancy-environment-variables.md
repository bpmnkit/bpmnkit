# Configuration — Multi-tenancy — Environment variables

The Connector Runtime uses the following environment variables to configure multi-tenancy:

| Name                                     | Description                                                                                                                                                                              | Default value |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| CAMUNDA_CLIENT_TENANTID                  | The default tenant ID used to communicate with Zeebe. Changing this value will set a new default tenant ID used for fetching jobs and publishing messages.                               | `<default>`   |
| CAMUNDA_CLIENT_WORKER_DEFAULTS_TENANTIDS | The default tenant IDs (comma separated) used to activate jobs. To run the Connector Runtime in a setup where a single runtime serves multiple tenants, add each tenant ID to this list. | `<default>`   |

If you are using an embedded version of the Connector Runtime, you can specify the tenant information in your Spring configuration like in this example `application.properties` file:

```bash
camunda.client.tenant-id=myTenant
camunda.client.worker.defaults.tenant-ids=myTenant
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
