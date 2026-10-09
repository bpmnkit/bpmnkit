# Configuration reference — Configuration examples

### application.yaml

```yaml
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

  database:
    url: jdbc:postgresql://db/default

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
        # inherits bucket-path: default/ from root
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
      database:
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

### Environment variables

Spring environment variable mapping follows canonical property conversion. For example, a root-level property and its per-tenant override:

```bash
CAMUNDA_DATA_SECONDARYSTORAGE_RDBMS_URL=jdbc:postgresql://db/default
CAMUNDA_PHYSICALTENANTS_RISKPROD_DATA_SECONDARYSTORAGE_RDBMS_URL=jdbc:postgresql://db/riskprod
```

If YAML and environment variables are used together, use the same normalized tenant key in both forms.

**Note: Related pages**

- [Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index)
- [Provisioning and lifecycle](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle)
- [Multi-tenancy overview](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/index)
- [Cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) for configuring access to cluster-wide operations

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference
