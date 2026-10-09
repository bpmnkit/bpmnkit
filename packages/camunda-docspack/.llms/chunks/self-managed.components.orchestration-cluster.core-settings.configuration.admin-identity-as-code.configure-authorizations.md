# Admin: Identity as Code — Configure authorizations

### env

```bash
CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_OWNER_TYPE=USER
CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_OWNER_ID=john.doe
CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_RESOURCE_TYPE=RESOURCE
CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_RESOURCE_ID=*
CAMUNDA_SECURITY_INITIALIZATION_AUTHORIZATIONS_0_PERMISSIONS=CREATE,READ
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
              authorizations:
                - ownerType: USER
                  ownerId: john.doe
                  resourceType: RESOURCE
                  resourceId: "*"
                  permissions:
                    - CREATE
                    - READ
```


## Configure groups

### env

```bash
CAMUNDA_SECURITY_INITIALIZATION_GROUPS_0_GROUP_ID=test-group
CAMUNDA_SECURITY_INITIALIZATION_GROUPS_0_NAME="Test Group"
CAMUNDA_SECURITY_INITIALIZATION_GROUPS_0_DESCRIPTION="A cool test group!"
CAMUNDA_SECURITY_INITIALIZATION_GROUPS_0_CLIENTS="ClientA,ClientB,ClientC"
CAMUNDA_SECURITY_INITIALIZATION_GROUPS_0_MAPPING_RULES="RuleA,RuleB,RuleC"
CAMUNDA_SECURITY_INITIALIZATION_GROUPS_0_USERS="UserA,UserB,UserC"
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
              groups:
                - groupId: test-group
                  name: Test Group
                  description: A cool test group!
                  clients:
                    - ClientA
                    - ClientB
                    - ClientC
                  mappingRules:
                    - RuleA
                    - RuleB
                    - RuleC
                  users:
                    - UserA
                    - UserB
                    - UserC
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/admin-identity-as-code
