# Admin in Self-Managed — Configure initial users — application-properties

```yaml
camunda:
  security:
    initialization:
      users:
        - username: <Your chosen username>
          password: <Your chosen password>
          name: <The name of the first user>
          email: <The email address of the first user>
        # add more users to this list as desired
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview
