# Orchestration Cluster authentication in Self-Managed — Basic authentication

With Basic authentication, Orchestration Cluster components are protected with a username and password. User management is handled within the built-in Admin service.

**Note**
This is the default authentication method for all installation options: [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run), [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose), [Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/index), and [Manual installation](https://docs.camunda.io/docs/next/self-managed/deployment/manual/install).

### Example configuration

  
### env

```yaml
CAMUNDA_SECURITY_AUTHENTICATION_METHOD=basic
```
  
  
### yaml

```yaml
camunda.security.authentication.method: basic
```
  
  
### helm

```yaml
orchestration.security.authentication.method=basic
```
  

### Security considerations

While Basic authentication provides a simple layer of protection suitable for development or testing environments, it has several security limitations:

- **No multi-factor authentication (MFA):** Basic authentication does not support MFA, increasing the risk of unauthorized access through credential stuffing attacks, where attackers use stolen credentials from other services.
- **No account locking:** The system does not lock accounts after multiple failed login attempts, leaving it vulnerable to brute-force attacks where an attacker can try to guess passwords repeatedly without being blocked.
- **Insecure password recovery:** The password recovery process for administrators can be insecure and may require direct, risky manual intervention with the system.
- **No single sign-on (SSO):** It leads to a higher likelihood of weak or reused passwords.

#### Mitigation and recommendations

For a secure, production-ready setup, Camunda **strongly recommends using [OIDC](#oidc)**. OIDC delegates authentication to a dedicated identity provider (IdP), allowing you to leverage advanced security features such as MFA, SSO, and password policies.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster
