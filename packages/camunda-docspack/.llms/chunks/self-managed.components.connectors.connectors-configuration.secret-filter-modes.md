# Configuration — Secret filter — Modes

Configure the secret filter with the `camunda.connector.secret-resolver.secret-filter.mode` property:

| Mode       | Behavior                                                                                                                                                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `STRICT`   | Enforces the allow-list unconditionally. If the process definition cannot be retrieved, the Zeebe job fails and retries are triggered. This is the default. Choose this mode when strict secret isolation is required.                                                                                                 |
| `LAX`      | Enforces the allow-list when the process definition is available. Falls back to allowing all secrets if the process definition cannot be retrieved (for example, due to an API outage or an eventual-consistency delay). Choose this mode when uninterrupted job processing matters more than strict secret isolation. |
| `DISABLED` | All secrets resolve freely, matching the behavior before this feature was introduced. Choose this mode only for troubleshooting, or if a custom secret provider needs unrestricted access.                                                                                                                             |

The allow-list is derived automatically from the fields of the deployed connector element. No manual configuration of individual secrets is required.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
