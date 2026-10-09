# Connect Camunda to Ping Identity (PingFederate or PingOne) — Assign users

### pingfederate

User access is controlled by access policies. Ensure your PingFederate access policy permits your admin user to authenticate to the Camunda Identity and Camunda Orchestration Cluster clients before first startup.

### pingone

In the PingOne admin console, open each application, and under **Access**, ensure the admin user's population or the relevant group is assigned. Confirm the user is in the **Active** state.


## Troubleshooting

For issues common to any OIDC provider, see [Troubleshoot OIDC authentication](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc). The following are specific to Ping:

**`invalid_client` during code exchange**
Ping returned an error exchanging the authorization code for tokens. Verify the client authentication method configured in Ping, either **Client Secret Post** or **Client Secret Basic**, matches what Camunda sends. PingFederate defaults to **Client Secret Basic**, so check your client configuration if you changed it.

**`aud` claim mismatch, or missing entirely**
See [Audience configuration requires Ping-side setup](#audience-configuration-requires-ping-side-setup). This is the most common cause with PingFederate, since a shared Access Token Manager can't produce a per-client audience.

**Token signature validation fails on API calls, but interactive login succeeds**
The access token and ID token are signed with different keys. See [Determine whether you need separate signing keys](#determine-whether-you-need-separate-signing-keys).

**PingFederate: `error=server_error, error_description=There are no authentication methods available for OAuth on the authorization redirect`**
PingFederate has no IdP adapter registered as an authentication source for the OAuth authorization server. Check **System > OAuth Settings > Authorization Server > IdP Adapter Mapping**, and confirm the same adapter is also listed under **Authentication Policies > Default Authentication Sources**. Only authorization code login redirects are affected, because a client credentials grant doesn't need an authentication source. This error typically appears only on a PingFederate instance configured from scratch, since an existing deployment already has a working authentication policy.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/ping-identity
