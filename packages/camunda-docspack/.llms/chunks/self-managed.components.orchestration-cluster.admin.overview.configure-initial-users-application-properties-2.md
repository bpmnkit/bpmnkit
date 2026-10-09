# Admin in Self-Managed — Configure initial users — application-properties

```yaml
camunda:
  security:
    initialization:
      defaultRoles:
        <role>:
          users:
            - <username>
            # add more users to this list as desired
          clients:
            - <client id>
            # add more clients to this list as desired
          groups:
            - <group id>
            # add more groups to this list as desired
          mappings:
            - <mapping id>
            # add more mappings to this list as desired
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview
