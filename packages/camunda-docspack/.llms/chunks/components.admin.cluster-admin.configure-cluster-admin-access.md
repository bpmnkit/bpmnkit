# Cluster admin — Configure cluster admin access

Assign cluster admin access using one of two methods. Which one applies is determined by `camunda.security.authentication.method`, not by choice: only the chain matching your cluster's authentication method is instantiated.

The cluster admin chain is stateless in both modes. An existing web application session cookie can never authenticate a `/cluster/v2/**` request.

Under OIDC, tokens are issued by the cluster's default provider. For the `client_credentials` flow and request examples, see [Orchestration Cluster API authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication).

### basic

Define one or more cluster admin users directly in configuration:

```yaml
camunda:
  security:
    cluster-admin:
      basic:
        users:
          - name: cluster-operator
            password: <password>
```

### oidc

Match cluster admin against a claim in the access token, such as a specific client, group, or custom claim:

```yaml
camunda:
  security:
    cluster-admin:
      oidc:
        clients:
          - cluster-admin-client
        groups:
          - cluster-operators
        # claims:
        #   - name: <claim-name>
        #     value: <claim-value>
```

**Warning**
Under OIDC, configure at least one client, group, or claim. If none are configured, every bearer token is denied on `/cluster/v2/**` and the API becomes unreachable. Matching on `clients` or `groups` also requires the provider's `client-id-claim` and `groups-claim` to be set under `camunda.security.authentication.oidc`, otherwise startup fails.

Under Basic authentication, an empty or absent user list is accepted silently and leaves no cluster admin provisioned. Only a malformed entry, such as a duplicate or blank name or password, fails startup.

---
Source: https://docs.camunda.io/docs/next/components/admin/cluster-admin
