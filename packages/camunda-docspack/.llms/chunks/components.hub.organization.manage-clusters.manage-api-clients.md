# Manage API clients

Let's create a client and manage our API clients.

To interact with an orchestration cluster from the outside, every client application must authenticate itself. An **OAuth Flow** is therefore used for authentication:

![auth-flow](./img/client-auth.png)

The application authenticates itself with OAuth service using `Client Id` and `Client Secret`, OAuth service validates this information and returns an access token, and the application can then use this access token to interact with an orchestration cluster.

The client configuration is shown at the bottom of the cluster detail view. Create a new client and all necessary information is displayed.

For the `Client Id` and `Client Secret`, a client application can request an access token at the authentication URL (**Steps 1 and 2**). The access token is necessary to interact with an orchestration cluster (**Step 3**).

**Note**
Access tokens have a validity period that can be found in the access token. After this time, a new access token must be requested.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-api-clients
