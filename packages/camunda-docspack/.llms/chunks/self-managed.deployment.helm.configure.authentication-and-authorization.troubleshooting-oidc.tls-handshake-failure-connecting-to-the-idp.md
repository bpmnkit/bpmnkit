# Troubleshoot OIDC authentication — TLS handshake failure connecting to the IdP

**Observed behavior:** Identity or another component fails to reach the OIDC provider, and logs show an error similar to:

```text
javax.net.ssl.SSLHandshakeException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
```

**Why this happens:** Your OIDC provider's certificate (or the internal Keycloak instance's certificate) is signed by a private or internal certificate authority that isn't in the JVM truststore Camunda components use by default.

**How to fix:** Add your CA to the trust bundle Camunda components use to validate the connection. See [configure TLS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls#external-oidc-issuer-with-private-ca) for the Helm chart's `global.tls.caBundle` overlay, which covers this exact scenario.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc
