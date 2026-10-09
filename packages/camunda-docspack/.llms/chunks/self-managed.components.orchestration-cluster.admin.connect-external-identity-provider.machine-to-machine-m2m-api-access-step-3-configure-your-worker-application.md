# Connect Admin to an identity provider — Machine-to-machine (M2M) API access — Step 3: Configure your worker application

Depending on your application type (for example, standalone Java application, Spring Boot application), the configuration steps may vary.
Refer to the documentation of your chosen Camunda Client for details on how to configure authentication using client credentials.

- Orchestration Cluster REST and gRPC API clients: See [REST API authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication#oidc-based-authentication-using-client-credentials).
- Java Client: See [Java client authentication](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started.md?authentication=oidc-self-managed#step-2-connect-to-your-camunda-8-cluster).
- Spring Boot Starter: See [Spring Boot Starter authentication](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started.md?authentication=oidc#step-3-configure-the-camunda-8-connection).
- Connectors: See [Connector authentication](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration).
- **Audience Validation**: If you have configured the audiences property for the Orchestration Cluster (`camunda.security.authentication.oidc.audiences`), the Orchestration Cluster will validate the audience claim in the token against the configured audiences. Make sure your token has the correct audience from the Orchestration Cluster above, or add your audience in the Orchestration Cluster configuration.

**Note**
As per default authorizations are enabled, your application will only be able to retrieve the topology, with other requests requiring you to configure [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) for the client. You should use your `client id` when configuring authorizations.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
