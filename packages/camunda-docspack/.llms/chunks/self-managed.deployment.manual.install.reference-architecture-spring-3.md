# Camunda manual installation — Reference architecture — spring

```yaml
camunda:
  security:
    initialization:
      users:
        - username: connectors
          password: connectors
          name: Connectors User
          email: connectors@company.com
      default-roles:
        connectors:
          users:
            - connectors
```

  

#### Configure the license key

If your Camunda 8 Self-Managed installation requires a license, provide the license key in one of the following ways:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
