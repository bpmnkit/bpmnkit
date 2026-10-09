# Databricks connector — Configure authentication

| Type                                                    | Use                                                                                                                                                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OAuth machine-to-machine (M2M) with a service principal | Recommended for production. Client credentials are sent as a Basic authentication header to `https://<workspace>/oidc/v1/token` with `scope=all-apis`. Access tokens are valid for one hour. |
| Personal access token                                   | Testing only.                                                                                                                                                                                |

The OAuth token endpoint is derived from the workspace URL, so it does not need to be configured separately.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks
