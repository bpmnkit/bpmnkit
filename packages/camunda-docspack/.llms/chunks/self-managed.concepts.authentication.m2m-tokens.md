# Machine-to-machine (M2M) tokens

A **machine-to-machine (M2M)** token is a token requested by one service so it can communicate with another service acting as itself.

In [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview), we provide the ability to assign permissions to an application. This functionality allows an application to perform the `client_credentials` flow to retrieve a JWT token with permissions.

The token generated can then be used to communicate with other applications in Camunda without
the need for user intervention.

**Tip: Want to learn how to generate an M2M token?**
Head to our guide, [generating M2M tokens](https://docs.camunda.io/docs/next/self-managed/components/management-identity/authentication)
to find out more!

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/m2m-tokens
