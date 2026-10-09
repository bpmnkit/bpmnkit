# Camunda components troubleshooting — Identity `contextPath`

Camunda 8 Self-Managed can be accessed externally via the [combined Ingress setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup#configuration). In that configuration, Camunda Identity is accessed using a specific path, configured by setting the `contextPath` variable, for example `https://camunda.example.com/identity`.

For security reasons, Camunda Identity requires secure access (HTTPS) when a `contextPath` is configured.

**Note**
Due to limitations, the Identity `contextPath` approach is unavailable when using a browser in Incognito mode.


## Camunda Hub database schema

The Camunda Hub `restapi` component requires a [database connection](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#database). This connection should not point to the same database as Keycloak does.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
