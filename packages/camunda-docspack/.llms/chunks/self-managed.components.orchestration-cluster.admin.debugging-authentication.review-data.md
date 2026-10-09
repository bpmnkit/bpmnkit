# Debugging the authentication flow — Review data

To review the assignment of users and clients to roles, groups, or tenants—as well as which authorizations are in place—you can use the [Admin UI](https://docs.camunda.io/docs/next/components/admin/admin-introduction).

If you do not have access to the API, you can also check the same data in the following Elasticsearch/OpenSearch indexes:

- `camunda-authorization`
- `camunda-group`
- `camunda-mapping-rule`
- `camunda-role`
- `camunda-tenant`
- `camunda-user`
- `camunda-web-session`


## Review configuration

To review the effective configuration of your Orchestration Cluster, you can call the [Spring Boot Actuator endpoint](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints) at:

```
<server>:<port>/actuator/configprops
```

For example, with a Camunda 8 Run installation, this endpoint is available at `http://localhost:9600/actuator/configprops`.

In other setups, replace `http://localhost:9600` with the URL to your Orchestration Cluster's actuator port and endpoint. Note that the actuator port differs from the Orchestration Cluster API port and may not always be accessible, depending on your deployment setup.

Here is an excerpt from an example installation:

```json
{
  ...
  "camunda.security-io.camunda.application.commons.security.CamundaSecurityConfiguration$CamundaSecurityProperties": {
    "prefix": "camunda.security",
    "properties": {
      ...
      "authentication": {
        "method": "OIDC",
        "authenticationRefreshInterval": "PT30S",
        "unprotectedApi": false,
        "oidc": {
          "issuerUri": "https://myoidcprovider.example.com",
          "clientId": "my-oidc-client",
          "clientSecret": "******",
          "grantType": "authorization_code",
          "redirectUri": "http://localhost:8080/sso-callback",
          "scope": [
            "openid",
            "profile"
          ],
          "usernameClaim": "preferred_username",
          "clientIdClaim": "oid",
          "authorizeRequest": {}
        }
      }
      ...
    }
  }
}
```

In the response, review the settings in the `camunda.security` section, compare them against the [configuration reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#authentication), and confirm they match your intended values.

This is especially useful if you are applying the configuration via Helm values or environment variables and want to double-check that your configuration was applied correctly.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/debugging-authentication
