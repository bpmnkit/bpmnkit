# Cluster variables — Required permissions

Managing cluster variables requires permissions on the `CLUSTER_VARIABLE` resource type. These permissions are the same for every kind, and there is no additional permission for a `SECRET_REFERENCE`-kind variable.

| Action                    | Required permission |
| ------------------------- | ------------------- |
| Create a cluster variable | `CREATE`            |
| View a cluster variable   | `READ`              |
| Update a cluster variable | `UPDATE`            |
| Delete a cluster variable | `DELETE`            |

The resource identifier is the variable name, or `*` for all cluster variables. See [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#available-resources) for how to grant these permissions.

---
Source: https://docs.camunda.io/docs/next/components/admin/cluster-variables
