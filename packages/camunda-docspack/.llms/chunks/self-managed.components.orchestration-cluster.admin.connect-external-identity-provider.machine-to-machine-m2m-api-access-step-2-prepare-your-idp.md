# Connect Admin to an identity provider — Machine-to-machine (M2M) API access — Step 2: Prepare your IdP

Next, configure a client in your IdP:

1. Register a new application/client for your job worker in your IdP.
   - Create a new application/client in your IdP.
   - Configure the necessary scopes (for example, `openid`).
   - Create a new client secret.
   - Ensure that the client's access tokens include the client id claim as configured in the previous step.
2. Note the **client ID**, **client secret**, and **authorization URI** as these are required during Camunda configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
