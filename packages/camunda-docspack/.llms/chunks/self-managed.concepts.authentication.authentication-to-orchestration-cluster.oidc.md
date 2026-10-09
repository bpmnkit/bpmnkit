# Orchestration Cluster authentication in Self-Managed — OIDC

With OIDC, authentication is delegated to an [external Identity Provider (IdP)](https://docs.camunda.io/docs/next/components/concepts/access-control/connect-to-identity-provider) using OpenID Connect (OIDC).

This is the **recommended method for production environments**.

- [Users](https://docs.camunda.io/docs/next/components/admin/user) are managed in your external IdP and [mapped through rules](https://docs.camunda.io/docs/next/components/concepts/access-control/mapping-rules) in Admin.
- [User groups](https://docs.camunda.io/docs/next/components/admin/group) can be managed in Admin or configured to use groups from your IdP.
- [Clients](https://docs.camunda.io/docs/next/components/admin/client) are managed in your external IdP and [mapped through rules](https://docs.camunda.io/docs/next/components/concepts/access-control/mapping-rules) in Admin.

Using OIDC provides several security benefits:

- **Centralized user management:** Manage all users and their access from a single, central IdP.
- **Single Sign-On (SSO):** Provide a seamless login experience for your users across multiple applications.
- **Enhanced security:** Enforce MFA, password rotation policies, and other advanced security measures offered by your IdP.

**Info**
For more information, see [connect Orchestration Cluster Admin to an external IdP](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider).

### Example configuration

  
### env

```yaml
CAMUNDA_SECURITY_AUTHENTICATION_METHOD=oidc
``` 
  
  
### yaml

```yaml
camunda.security.authentication.method: oidc
```
  
  
### helm

```yaml
orchestration.security.authentication.method=oidc
```
  

If OIDC authentication is enabled, additional configuration values must be set. See [supported OIDC configuration properties](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#oidc-configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster
