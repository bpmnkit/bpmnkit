# Admin in Self-Managed — Configure initial users — helm

```yaml
orchestration:
  security:
    initialization:
      users:
        - username: <Your chosen username>
          password: <Your chosen password>
          name: <The name of the first user>
          email: <The email address of the first user>
        # add more users to this list as desired
```

**Note**
By default, a user is not assigned to any roles and therefore has no permissions. See the following section to learn how to assign a user to a role via configuration.

#### Assign users, clients, groups, or mapping rules to roles via configuration

The orchestration cluster provides a number of [built-in roles](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#default-roles) with predefined permissions for easier setup.

To assign users, clients, groups, or [mapping rules](https://docs.camunda.io/docs/next/components/concepts/access-control/mapping-rules) to roles, add the appropriate properties to your `application.yaml` or set them as environment variables.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview
