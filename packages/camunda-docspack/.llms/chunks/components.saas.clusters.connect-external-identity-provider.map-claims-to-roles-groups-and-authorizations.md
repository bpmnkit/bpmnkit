# Connect an external identity provider — Map claims to roles, groups, and authorizations

The external identity provider configuration has no groups claim. Instead, use [mapping rules](https://docs.camunda.io/docs/next/components/admin/mapping-rules) in the Orchestration Cluster Admin UI to map claims from your provider's access tokens to [roles](https://docs.camunda.io/docs/next/components/admin/role), [groups](https://docs.camunda.io/docs/next/components/admin/group), [tenants](https://docs.camunda.io/docs/next/components/admin/tenant), or [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations). Mapping rules become available in Admin as soon as you configure an external identity provider for the cluster.


## Considerations for Microsoft Entra ID

Console doesn't let you change the order Camunda uses to resolve a token to a user or to a client. By default, Camunda checks the **Client ID claim** first: if the claim is present in a token, Camunda treats the request as coming from a client; otherwise, it falls back to the **Username claim**.

Microsoft Entra ID includes an `azp` (authorized party) claim in both user and application tokens. If you set **Client ID claim** to `azp`, user sign-ins can be misidentified as client authentications. Leave **Client ID claim** blank unless you specifically need machine-to-machine (M2M) authentication through this provider, and if you do set it, use a claim that only appears in your application tokens.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/connect-external-identity-provider
