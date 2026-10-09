# Authentication

Web Modeler API is a REST API and provides access to Web Modeler data. Requests and responses are in JSON notation.

All Web Modeler API requests require authentication. To authenticate, generate a [JSON Web Token (JWT)](https://jwt.io/introduction/) depending on your environment and include it in each request.

**Note**
Clients using a valid generated token have access to all resources within an organization, similar to [organization admin and owner access](https://docs.camunda.io/docs/next/components/hub/organization/users-and-roles#elevated-workspace-access).

While there's no project-level access control enforced in the API, access is still dependent on the [CRUD operations assigned](#generate-a-token).

---
Source: https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/authentication
