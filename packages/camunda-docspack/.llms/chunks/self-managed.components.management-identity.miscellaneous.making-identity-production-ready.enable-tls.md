# Prepare Identity for production — Enable TLS

A safe and healthy exchange of secure data requires Transport Layer Security (TLS).

- TLS support for Identity can be enabled by setting configuration values. Refer to [Spring - Configure SSL](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.webserver.configure-ssl) for more information.
- To enable TLS alongside Keycloak, refer to the Keycloak documentation regarding [TLS enablement](https://www.keycloak.org/server/enabletls).


## Setting Identity URL

To ensure authentication flows are successful, the `IDENTITY_URL` should be set to the URL of the Identity service.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/making-identity-production-ready
