# Initialize tenants for Optimize — Before you begin

Before you begin, [configure a database](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#database-configuration). Management Identity requires a database to support multi-tenancy

When deploying Camunda 8 with Docker, you can programmatically configure tenants in Management Identity in two ways:

- `application.yaml`
- Environment variables

When using Helm to deploy Camunda 8, you must configure tenants using environment variables. Configuration using [Helm values](https://artifacthub.io/packages/helm/camunda/camunda-platform#parameters) is not supported.


## Initialize tenants in Management Identity

First, enable the Management Identity multi-tenancy flag:

### yaml

```yaml
identity:
  flags:
    multi-tenancy: "true"
```

### env

```sh
MULTITENANCY_ENABLED=true
```

With multi-tenancy enabled, initialize your tenants:

### yaml

```yaml
identity:
  tenants:
    - name: My tenant
      tenantId: my-tenant
      members:
        - type: USER
          username: username
        - type: GROUP
          group-name: group name
        - type: APPLICATION
          application-id: application-id
```

Each member type has a corresponding property you use to set the member identifier:

| Member type   | Property         |
| ------------- | ---------------- |
| `USER`        | `username`       |
| `GROUP`       | `group-name`     |
| `APPLICATION` | `application-id` |

In some contexts, like the Management Identity UI, the "Application ID" is referred to as the "Client ID".

### env

```sh
IDENTITY_TENANTS_0_NAME="My tenant"
IDENTITY_TENANTS_0_TENANTID="my-tenant"
IDENTITY_TENANTS_0_MEMBERS_0_TYPE="USER"
IDENTITY_TENANTS_0_MEMBERS_0_USERNAME="username"
IDENTITY_TENANTS_0_MEMBERS_1_TYPE="GROUP"
IDENTITY_TENANTS_0_MEMBERS_1_GROUPNAME="group name"
IDENTITY_TENANTS_0_MEMBERS_2_TYPE="APPLICATION"
IDENTITY_TENANTS_0_MEMBERS_2_APPLICATIONID="application-id"
```

Each member type has a corresponding property you use to set the member identifier:

| Member type   | Property                                     |
| ------------- | -------------------------------------------- |
| `USER`        | `IDENTITY_TENANTS_0_MEMBERS_0_USERNAME`      |
| `GROUP`       | `IDENTITY_TENANTS_0_MEMBERS_0_GROUPNAME`     |
| `APPLICATION` | `IDENTITY_TENANTS_0_MEMBERS_0_APPLICATIONID` |

In some contexts, like the Management Identity UI, the "Application ID" is referred to as the "Client ID".

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/initialize-tenants
