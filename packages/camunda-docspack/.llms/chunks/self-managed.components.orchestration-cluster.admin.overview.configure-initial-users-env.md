# Admin in Self-Managed — Configure initial users — env

```shell
CAMUNDA_SECURITY_INITIALIZATION_USERS_0_USERNAME=<Your chosen username>
CAMUNDA_SECURITY_INITIALIZATION_USERS_0_PASSWORD=<Your chosen password>
CAMUNDA_SECURITY_INITIALIZATION_USERS_0_NAME=<The name of the first user>
CAMUNDA_SECURITY_INITIALIZATION_USERS_0_EMAIL=<The email address of the first user>

# add more users as desired by repeating the variables with an incremented index,
# like CAMUNDA_SECURITY_INITIALIZATION_USERS_1_USERNAME
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview
