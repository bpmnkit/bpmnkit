# Configuration variables — License configuration

See [licensing](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/licensing).


## OIDC configuration

Claims are name/value pairs used to represent an individual identity. Configure your initial claim and value to match the claim used with your OIDC provider.

For example, to use your Microsoft Entra unique account ID, set `IDENTITY_INITIAL_CLAIM_NAME` to `oid`, and `IDENTITY_INITIAL_CLAIM_VALUE` to the ID.

**Caution**
Once set, you cannot update your initial claim name and value using environment or Helm values. You must change these values directly in the database.

| Environment variable                             | Description                                                                                                                                                                                                                                                                                           | Default value                 |
| :----------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------- |
| `IDENTITY_INITIAL_CLAIM_NAME`                    | The type of claim to use for the initial user. Examples can include `oid`, `name` or `email`.                                                                                                                                                                                                         | `oid`                         |
| `IDENTITY_INITIAL_CLAIM_VALUE`                   | The value of the claim to use for the initial user. For the default `oid`, the value usually corresponds to the unique ID of your user account.                                                                                                                                                       |                               |
| `CAMUNDA_ORCHESTRATION_CLUSTER_PING_CLAIM_NAME`  | The claim used to identify the identity that calls the [clusters endpoint](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#camunda-hub-ping-configuration) (also known as ping) to register the Orchestration Cluster with Camunda Hub.                                  | `sub`                         |
| `CAMUNDA_ORCHESTRATION_CLUSTER_PING_CLAIM_VALUE` | The expected value of the claim above. See the note below before relying on the default with a non-Keycloak OIDC provider.                                                                                                                                                                            | `service-account-<client-id>` |
| `KEYCLOAK_INIT_ORCHESTRATION_CLIENT_ID`          | The client ID of the Orchestration Cluster application that Management Identity registers in Keycloak. It supplies the `<client-id>` in the default `CAMUNDA_ORCHESTRATION_CLUSTER_PING_CLAIM_VALUE` (`service-account-<client-id>`). If `CAMUNDA_ORCHESTRATION_CLIENT_ID` is set, it takes priority. | `orchestration`               |

### Ping client claim for non-Keycloak providers

The default `CAMUNDA_ORCHESTRATION_CLUSTER_PING_CLAIM_VALUE` (`service-account-<client-id>`) is a Keycloak-specific naming convention for a client's service account subject. The OIDC specification doesn't define it. Other OIDC providers can populate the `sub` claim differently for a client credentials grant (for example, some reuse the client ID directly). In that case the mapping rule no longer matches, and the ping request fails closed.

If you don't use Keycloak, set `CAMUNDA_ORCHESTRATION_CLUSTER_PING_CLAIM_VALUE` (and `CAMUNDA_ORCHESTRATION_CLUSTER_PING_CLAIM_NAME`, if your provider doesn't use `sub`) to match the actual subject value your provider issues for the Orchestration Cluster's service account.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables
