# Property reference — Security — `camunda.security.authentication.oidc` (2)

**Caution**
Enabling `prefer-id-token-claims` changes which token's claims are trusted for authorization decisions, from the access token to the ID token and user info response. Audience semantics differ between the two: the access token's audience identifies the API it authorizes access to, while the ID token's audience identifies the client the token was issued to. Only enable this to work around an access token that Camunda cannot validate or that is missing required claims, not as a default choice.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
