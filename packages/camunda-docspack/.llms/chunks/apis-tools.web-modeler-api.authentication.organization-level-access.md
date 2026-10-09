# Authentication — Organization-level access

API tokens are granted to organization-level _applications_ (Self-Managed) or _clients_ (SaaS) rather than individual _users_. With an API token, you can read, edit, and delete all workspaces ([called "projects" before Camunda 8.10](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api#structure-and-terminology)) and workspace resources in the organization, as long as the application or client has the required Web Modeler API permissions. This is true even if you aren't a member of the workspace and you can't see it in the Camunda Hub user interface.


## Token expiration

Access tokens expire according to the `expires_in` property of a successful authentication response. After this duration, in seconds, you must request a new access token.

---
Source: https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/authentication
