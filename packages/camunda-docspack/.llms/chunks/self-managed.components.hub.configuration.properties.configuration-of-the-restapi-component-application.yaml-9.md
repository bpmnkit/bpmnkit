# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
camunda:
  identity:
    base-url: http://identity:8080
    issuer-backend-url: http://keycloak:18080/auth/realms/camunda-platform # optional

  hub:
    security:
      jwt:
        issuer:
          backend-url: http://keycloak:18080/auth/realms/camunda-platform # optional
        audience:
          internal-api: web-modeler-api # default: web-modeler-api
          public-api: web-modeler-public-api # default: web-modeler-public-api
    oauth2:
      client-id: web-modeler
      client:
        fetch-request-credentials: include # optional
        scope: openid email profile # optional
      token.username-claim: name # optional, default: name

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://keycloak.example.com/auth/realms/camunda-platform
          jwk-set-uri: https://keycloak.example.com/auth/realms/camunda-platform/protocol/openid-connect/certs # optional
          jws-algorithms: ES256 # optional
          audiences: web-modeler-api,web-modeler-public-api # optional
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
