# Connect an external identity provider — Known limitations

- **Same username across providers resolves to the same principal.** If a user has an account with the same username in your IdP and in Camunda's built-in provider, Operate, Tasklist, and Admin treat them as the same principal for authorization purposes. User-tied setups (one role or authorization per specific username) work as expected. Group- or mapping-rule-based assignments that assume the two providers' users are distinct may not behave as expected.
- **Built-in mapping rules remain editable.** Mapping rules that Camunda manages for internal purposes, such as the **Support Access** mapping rule, remain visible and editable by cluster admins once you configure an external identity provider. Changes to these rules either self-restore on the next pod restart, or require Camunda Support to use the built-in provider to sign in and revert them. Avoid editing these rules.
- **Issuer URL must be a public, plain HTTPS address.** Camunda requires an issuer URL that's reachable from the public internet, uses `https`, and contains no credentials, query string, or fragment. An internal, VPN-only, or non-routable address, or a URL that doesn't meet this format, is rejected before Camunda attempts to contact your provider.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/connect-external-identity-provider
