# Set up two isolated Physical Tenants — Configure

Add the following to your Helm values, either inline under `orchestration.configuration` or as a separate file under `orchestration.extraConfiguration`. Both approaches, and the full property list, are covered in [configure Physical Tenants in Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-physical-tenants). This example assumes the base `camunda.security.authentication` block for `default` is already in your values file. The minimum needed is storage and an assigned identity provider:

### rdbms

```yaml
orchestration:
  extraConfiguration:
    - file: physical-tenants.yaml
      content: |
        camunda:
          physical-tenants:
            riskprod:
              # Shared PostgreSQL instance, isolated by schema.
              data:
                secondary-storage:
                  rdbms:
                    url: jdbc:postgresql://db.example.com:5432/camunda?currentSchema=riskprod_schema

              security:
                authentication:
                  providers:
                    assigned:
                      - oidc # reuse the cluster-level OIDC provider
```

### es-os

This example uses `elasticsearch`; substitute `opensearch` if that's your secondary storage type. Use the same type `default` already uses, since a cluster can't mix secondary storage types across Physical Tenants.

```yaml
orchestration:
  extraConfiguration:
    - file: physical-tenants.yaml
      content: |
        camunda:
          physical-tenants:
            riskprod:
              # Shared Elasticsearch/OpenSearch cluster, isolated by index prefix.
              data:
                secondary-storage:
                  elasticsearch:
                    index-prefix: riskprod # must be unique across tenants

              security:
                authentication:
                  providers:
                    assigned:
                      - oidc # reuse the cluster-level OIDC provider
```

Add an authorization block so `riskprod` has an admin role of its own. Every explicitly configured tenant needs one; authorization isn't inherited from the cluster:

Full authorization example for riskprod

```yaml
security:
  initialization:
    roles:
      - roleId: riskprod-admin
        name: Risk Production Admin
        mappingRules:
          - riskprod-admins-mapping
    mappingrules:
      - mapping-rule-id: riskprod-admins-mapping
        claim-name: groups
        claim-value: risk-admins
    authorizations:
      - ownerType: ROLE
        ownerId: riskprod-admin
        resourceType: RESOURCE
        resourceId: "*"
        permissions:
          - CREATE
      - ownerType: ROLE
        ownerId: riskprod-admin
        resourceType: PROCESS_DEFINITION
        resourceId: "*"
        permissions:
          - CREATE_PROCESS_INSTANCE
          - UPDATE_PROCESS_INSTANCE
          - READ_PROCESS_INSTANCE
          - READ_PROCESS_DEFINITION
```

Add this block alongside `security.authentication` above, under the same `riskprod` tenant.

If you're using RDBMS, create the `riskprod_schema` schema on your PostgreSQL instance before applying this. Camunda validates that the schema exists at startup; it does not create it for you. If you're using Elasticsearch/OpenSearch, no manual step is needed: Camunda creates indices under the `riskprod` prefix automatically at startup. See [validation and operations](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation#validation-and-operations).

Now register `riskprod`'s redirect URI in your identity provider. In Keycloak, add `/physical-tenants/riskprod/sso-callback` to the client's allowed redirect URIs. See [identity provider redirect URI registration](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization#idp-redirect-uri-registration).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
