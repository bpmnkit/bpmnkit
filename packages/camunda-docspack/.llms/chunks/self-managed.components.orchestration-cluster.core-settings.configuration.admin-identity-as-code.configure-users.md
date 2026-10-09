# Admin: Identity as Code — Configure users

When configuring users, never hardcode the password. Resolve it from a vault instead.

### env

```bash
CAMUNDA_SECURITY_INITIALIZATION_USERS_0_EMAIL=john.doe@example.com
CAMUNDA_SECURITY_INITIALIZATION_USERS_0_NAME="john doe"
CAMUNDA_SECURITY_INITIALIZATION_USERS_0_PASSWORD=*****
CAMUNDA_SECURITY_INITIALIZATION_USERS_0_USERNAME=john.doe
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
              users:
                - email: john.doe@example.com
                  name: John Doe
                  password: "*****"
                  username: john.doe
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/admin-identity-as-code
