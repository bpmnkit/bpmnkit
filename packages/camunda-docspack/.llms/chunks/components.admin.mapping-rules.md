# Mapping rules

Learn how to create mapping rules for flexible resource access in the Orchestration Cluster for OIDC setups.

Self-Managed only

Mapping rules provide flexible access to Orchestration Cluster resources based on claims in a user's or client's OIDC access token.

**Info**
To learn more, see [mapping rules](https://docs.camunda.io/docs/next/components/concepts/access-control/mapping-rules).


## Create a mapping rule

To create a mapping rule:

1. Log in to Admin in your cluster, and select the **Mapping Rules** tab.
2. Click **Create a mapping rule**, and enter the following details:
   - **Mapping Rule ID**: A unique identifier for the mapping rule.
   - **Mapping Rule name**: A user-friendly name.
   - **Claim name**: The name of a claim in the OIDC access token or a [JSONPath expression](https://www.rfc-editor.org/rfc/rfc9535) that points to a claim in the access token.
   - **Claim value**: The expected value of the claim so that the mapping rule matches an access token.
3. Click **Create mapping rule** to create the role.

You can now assign the role to groups, roles, or tenants, or create and apply authorizations for it.

---
Source: https://docs.camunda.io/docs/next/components/admin/mapping-rules
