# Configure Physical Tenants in Helm chart — Prerequisites

- A running Camunda 8 Self-Managed Helm deployment.
- Read the [Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index) and [configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference) first — this page only shows how to deliver that same configuration through Helm.


## Configure via `orchestration.configuration`

Set `orchestration.configuration` to the full `application.yaml` content, including the root-level and per-tenant `camunda.physical-tenants.*` blocks:

```yaml
orchestration:
  configuration: |
    camunda:
      data:
        secondary-storage:
          rdbms:
            url: jdbc:postgresql://db/default
      document:
        default-store-id: shared-s3
        aws:
          shared-s3:
            bucket-name: company-docs-bucket
            bucket-path: default/

      security:
        authentication:
          method: oidc
          providers:
            oidc:
              corp-idp:
                issuer-uri: https://corp-idp.example.com/realms/camunda
                client-id: camunda-client
                client-secret: ${CORP_IDP_CLIENT_SECRET}
                audiences:
                  - camunda-api
                username-claim: preferred_username

      physical-tenants:
        default:
          cluster:
            partition-count: 3
          document:
            default-store-id: shared-s3
            assigned:
              - shared-s3
          security:
            authentication:
              providers:
                assigned:
                  - corp-idp

        riskprod:
          cluster:
            partition-count: 3
          data:
            secondary-storage:
              rdbms:
                url: jdbc:postgresql://db/riskprod
          document:
            default-store-id: shared-s3
            assigned:
              - shared-s3
            aws:
              shared-s3:
                bucket-path: riskprod/ # distinct path, no collision with default
          security:
            authentication:
              providers:
                assigned:
                  - corp-idp
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

Every explicitly configured tenant needs its own `security.initialization` block when authorization is enabled; it is not inherited from the root or from other tenants.

This is the same configuration shape as the [configuration reference's application.yaml example](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference#configuration-examples) — `orchestration.configuration` renders as-is into the pod's `application.yaml`.

Secrets referenced with `${VARIABLE}` syntax (like `${CORP_IDP_CLIENT_SECRET}` above) still resolve from the pod's environment. Supply them through `orchestration.env` or `orchestration.envFrom` alongside `orchestration.configuration`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-physical-tenants
