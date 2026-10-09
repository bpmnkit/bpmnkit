# Admin in Self-Managed — Configure initial users — Option 2: Create an initial admin user via the Setup endpoint of Orchestration Cluster REST API{#option-2-setup-rest-api}

You can create the first admin user by calling the Setup API endpoint:

`POST /v2/setup/user` ([API documentation](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-admin-user.api))

with the following JSON request body:

```json
{
  "username": "<your chosen username>",
  "password": "<your chosen password>",
  "name": "<the user's full name>",
  "email": "<the user's email address>"
}
```

This endpoint is only available if **no user is assigned to the `admin` role**.

This option is convenient for scripted bootstrap, but for long-lived production environments we recommend keeping the desired state in configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview
