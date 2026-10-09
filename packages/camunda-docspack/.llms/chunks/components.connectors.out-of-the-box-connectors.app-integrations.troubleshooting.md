# App Integrations connector — Troubleshooting

### Connector not configured

When app integrations are not set up for the environment, every job fails immediately with the error code `APP_INTEGRATIONS_NOT_CONFIGURED` and raises an incident.

This failure is **not retried**. The **Retries** and **Retry backoff** settings on the task do not apply, because no amount of retrying can supply missing configuration. Only processes using this connector are affected. The connector runtime keeps serving every other connector.

Resolving it is an administrator task. See [prerequisites](#prerequisites).

| Environment  | Cause                                                              | Fix                                                                                                                                                                                                        |
| :----------- | :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SaaS         | **Enable app integrations extensions** is off for the cluster.     | Ask an organization administrator to enable it in the [cluster settings](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/settings#enable-app-integrations-extensions).                                     |
| Self-Managed | The connector runtime is not configured to reach app integrations. | Complete the [App Integrations connection settings](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#connection-settings) and redeploy the runtime.                                         |
| Self-Managed | The runtime authenticates with OAuth, but no cluster ID is set.    | Set the cluster ID to the cluster's UUID and redeploy the runtime. See [choose an authentication method](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#choose-an-authentication-method). |

The incident message names the missing setting, so read it before changing configuration.

### Other error codes

| Code                       | Cause                                                                                                                                                |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VALIDATION_ERROR`         | Additional content is **Form** but no linked form reached the job, or an Adaptive Card or Block Kit payload is not valid JSON of the expected shape. |
| `IO_ERROR`                 | The request could not be serialized, or the response could not be parsed.                                                                            |
| `501`                      | Slack is not configured on the App Integrations deployment the runtime is pointed at. It is not a process modeling error.                            |
| HTTP status, such as `401` | App integrations returned an error. The error code is the HTTP status.                                                                               |

---
---

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
