# Starting configuration for Identity — Mappers

| Name             | Protocol Mapper                   | Description                                                                                               |
| :--------------- | :-------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| email            | oidc-usermodel-property-mapper    | Adds the email user attribute to the `access`, `ID`, and `user info` tokens using the claim name `email`. |
| full name        | oidc-full-name-mapper             | Adds the user's full name to the `access`, `ID`, and `user info` tokens.                                  |
| permissions      | oidc-usermodel-client-role-mapper | Adds the user's client roles to the `access` token with the claim name `permissions.${client_id}`.        |
| audience resolve | oidc-audience-resolve-mapper      | Adds the audiences the user has access to in the `audience` claim.                                        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/starting-configuration
