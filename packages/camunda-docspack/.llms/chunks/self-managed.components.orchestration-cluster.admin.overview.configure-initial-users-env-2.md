# Admin in Self-Managed — Configure initial users — env

```shell
CAMUNDA_SECURITY_INITIALIZATION_DEFAULTROLES_<role>_USERS_0=<username>
CAMUNDA_SECURITY_INITIALIZATION_DEFAULTROLES_<role>_CLIENTS_0=<client id>
CAMUNDA_SECURITY_INITIALIZATION_DEFAULTROLES_<role>_GROUPS_0=<group id>
CAMUNDA_SECURITY_INITIALIZATION_DEFAULTROLES_<role>_MAPPINGS_0=<mapping id>

# add more members as desired by repeating the variables with an incremented index,
# like CAMUNDA_SECURITY_INITIALIZATION_DEFAULTROLES_<role>_USERS_1
```

Replace `<role>` with the ID of the role you want to configure.

**Note: Helm deployments**

When you deploy with Helm, configure these properties via an `application.yaml` file using [application configs](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs) (for example with `orchestration.extraConfiguration`), rather than as dedicated Helm values.

Here is an example how to configure a user `demo` to become a member of the admin role:

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview
