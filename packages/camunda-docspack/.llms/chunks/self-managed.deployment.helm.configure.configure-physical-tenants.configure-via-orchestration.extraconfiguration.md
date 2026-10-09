# Configure Physical Tenants in Helm chart — Configure via `orchestration.extraConfiguration`

If you'd rather keep the Physical Tenant configuration in its own file instead of folding it into a single `orchestration.configuration` block, use `orchestration.extraConfiguration`. Each entry mounts as its own file and, with `springImport` left at its default (`true`), is merged into the pod's Spring configuration alongside the base `application.yaml`:

```yaml
orchestration:
  extraConfiguration:
    - file: physical-tenants.yaml
      content: |
        camunda:
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

This still requires the base `camunda.security.authentication` and `camunda.document` configuration (shown in the `orchestration.configuration` example above) to be set elsewhere — through `orchestration.configuration` or your own base `application.yaml` — since `extraConfiguration` only adds to that configuration, it doesn't replace it.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-physical-tenants
