# Mapping rules

Map your auth data to Camunda-specific data using mapping rules.

Use mapping rules to dynamically assign Management Identity entities to your users based on claims in your JWT tokens.

**Note**
You can only use mapping rules if Management Identity is configured to use [OIDC-based authentication](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider).


## About mapping rules

You can assign two types of entities with mapping rules:

- Tenants
- Roles

**Note**

A `Default` mapping rule is created during startup using the [IDENTITY_INITIAL_CLAIM_NAME and IDENTITY_INITIAL_CLAIM_VALUE environment variables](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#oidc-configuration) to allow an initial user access to the Identity interface. Once you have access to the Identity interface, configure the additional mapping rules to ensure your users have the correct access to the Camunda components.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/mapping-rules
