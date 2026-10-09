# Admin: Identity as Code — Configure mapping rules

### env

```bash
CAMUNDA_SECURITY_INITIALIZATION_MAPPINGRULES_0_CLAIMNAME=isAllowedToDoStuff
CAMUNDA_SECURITY_INITIALIZATION_MAPPINGRULES_0_CLAIMVALUE=true
CAMUNDA_SECURITY_INITIALIZATION_MAPPINGRULES_0_MAPPINGRULEID=my-mapping-rule
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
              mappingRules:
                - claimName: isAllowedToDoStuff
                  claimValue: "true"
                  mappingRuleId: my-mapping-rule
```


## Configure Roles

### env

```bash
CAMUNDA_SECURITY_INITIALIZATION_ROLES_0_ROLE_ID=test-role
CAMUNDA_SECURITY_INITIALIZATION_ROLES_0_NAME="Test Role"
CAMUNDA_SECURITY_INITIALIZATION_ROLES_0_DESCRIPTION="A cool test role!"
CAMUNDA_SECURITY_INITIALIZATION_ROLES_0_CLIENTS="client1,client2"
CAMUNDA_SECURITY_INITIALIZATION_ROLES_0_GROUPS="group1,group2"
CAMUNDA_SECURITY_INITIALIZATION_ROLES_0_MAPPING_RULES="m1,m2"
CAMUNDA_SECURITY_INITIALIZATION_ROLES_0_USERS="UserA,UserB,UserC"
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
              roles:
                - roleId: test-role
                  name: Test Role
                  description: A cool test role!
                  clients:
                    - client1
                    - client2
                  groups:
                    - group1
                    - group2
                  mappingRules:
                    - m1
                    - m2
                  users:
                    - UserA
                    - UserB
                    - UserC
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/admin-identity-as-code
