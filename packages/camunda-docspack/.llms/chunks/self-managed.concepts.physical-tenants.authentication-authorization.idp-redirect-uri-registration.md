# Authentication and authorization for Physical Tenants — IdP redirect URI registration

When users log in to a non-default Physical Tenant via a browser (for example, `https://your-cluster/physical-tenants/tenanta/operate`), the OAuth redirect URI includes the tenant path prefix, such as `/physical-tenants/tenanta/sso-callback`. Your IdP must be configured to allow this URI.

Register the redirect URI for each Physical Tenant you add. For example, in Keycloak, add `/physical-tenants/{tenantId}/sso-callback` to the allowed redirect URIs for the relevant client. Some IdPs support wildcard matching for redirect URIs, which simplifies configuration when adding many tenants.

This is standard procedure for registering a new application with an IdP. The exact configuration depends on your IdP and how you expose the tenant URL (path prefix, subdomain, or other pattern).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization
