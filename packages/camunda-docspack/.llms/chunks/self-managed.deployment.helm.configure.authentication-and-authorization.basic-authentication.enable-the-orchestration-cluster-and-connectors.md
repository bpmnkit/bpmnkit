# Set up the Helm chart with basic authentication — Enable the Orchestration Cluster and Connectors

The Orchestration Cluster and Connectors are enabled, by default, with Basic authentication. No additional configuration is required—simply deploy the Helm chart, and these components will be available.

### Default users

Two users are created by default:

| Username    | Password    | Role         | Description                                                                         |
| ----------- | ----------- | ------------ | ----------------------------------------------------------------------------------- |
| `demo`      | `demo`      | `admin`      | Initial administrative user                                                         |
| `connector` | `connector` | `connectors` | Used by the Connectors component to authenticate with the Orchestration Cluster API |

For details on configuring initial users and their roles, see [Orchestration Cluster Admin initialization](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview#option-3-configuration).

**Note: Helm arrays**
In Helm, arrays must be overwritten in full. If you change these configuration settings, keep in mind that the default array must be configured in your custom `values.yaml` if you want to keep those users and role assignments. For example, when adding the user `foo` or assigning roles to `foo`, keep also the values for the demo and connectors user.

### Connect to the cluster

To access the Orchestration Cluster and Connectors from your local machine using `kubectl port-forward`, refer to [Accessing components without Ingress](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/accessing-components-without-ingress).

Log in with the default credentials:

- **Username:** `demo`
- **Password:** `demo`

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/basic-authentication
