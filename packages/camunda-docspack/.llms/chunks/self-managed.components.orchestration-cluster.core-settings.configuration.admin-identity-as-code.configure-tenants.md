# Admin: Identity as Code — Configure tenants

### env

```bash
CAMUNDA_SECURITY_INITIALIZATION_TENANTS_0_TENANT_ID=tenantId
CAMUNDA_SECURITY_INITIALIZATION_TENANTS_0_NAME="test tenant"
CAMUNDA_SECURITY_INITIALIZATION_TENANTS_0_DESCRIPTION="test tenant description"
CAMUNDA_SECURITY_INITIALIZATION_TENANTS_0_CLIENTS='R1,R2,R3,R4'
CAMUNDA_SECURITY_INITIALIZATION_TENANTS_0_GROUPS='R1,R2,R3,R4'
CAMUNDA_SECURITY_INITIALIZATION_TENANTS_0_MAPPING_RULES='R1,R2,R3,R4'
CAMUNDA_SECURITY_INITIALIZATION_TENANTS_0_ROLES='R1,R2,R3,R4'
CAMUNDA_SECURITY_INITIALIZATION_TENANTS_0_USERS='UserA,UserB,UserC'
```

### helm

```yaml
orchestration:
  extraConfiguration:
    - file: identity-as-code.yaml
      content: |
        camunda:
          security:
            initialization:
              tenants:
                - tenantId: tenantId
                  name: test tenant
                  description: test tenant description
                  clients:
                    - R1
                    - R2
                    - R3
                    - R4
                  groups:
                    - R1
                    - R2
                    - R3
                    - R4
                  mappingRules:
                    - R1
                    - R2
                    - R3
                    - R4
                  roles:
                    - R1
                    - R2
                    - R3
                    - R4
                  users:
                    - UserA
                    - UserB
                    - UserC
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/admin-identity-as-code
