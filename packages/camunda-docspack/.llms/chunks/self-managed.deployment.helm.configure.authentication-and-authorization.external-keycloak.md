# Set up the Helm chart with an external Keycloak instance

Learn how to connect the Camunda Helm chart to an external Keycloak instance.

**Caution: Admin access required**
The external Keycloak setup requires administrative access to the Keycloak server.

**Info: Bitnami subcharts removed in Camunda 8.10**
Earlier releases provided Web Modeler's database through the `webModelerPostgresql` Bitnami subchart. As of Camunda 8.10 (Helm chart `15.x`), the bundled Bitnami subcharts are removed: provide PostgreSQL with the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment) or a managed database, as shown in the examples below.

The Camunda Helm chart can connect to an external Keycloak instance that acts as the identity management service for authentication and authorization.  
With minimal configuration for administrative access, the Management Identity component can automatically configure the Keycloak realm and required entities on startup—simplifying setup and reducing the learning curve.

Use this guide if you already have an existing Keycloak instance and want Camunda to automatically configure the required Keycloak entities.

If you prefer to run Keycloak inside your cluster and deploy it with the Keycloak operator, see the [internal Keycloak guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak).

**Tip: Private or internal CA**
If your external Keycloak instance presents a certificate signed by a private or internal certificate authority, Camunda components won't trust it by default. Configure [TLS trust](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls#external-oidc-issuer-with-private-ca) before or alongside this guide to avoid `PKIX path building failed` errors.

Before you begin, ensure you’re running a Keycloak version that’s supported by your Camunda release. See [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments#component-requirements).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak
