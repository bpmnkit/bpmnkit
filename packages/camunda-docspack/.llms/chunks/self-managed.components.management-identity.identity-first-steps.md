# Get started with Management Identity

Learn more about starting Management Identity, accessing the UI, default users, the home screen, and more.

Get started with Management Identity in Self-Managed by learning how to open and log in to the Management Identity interface.

The following table shows which installation methods start Management Identity and Keycloak. For the Docker Compose files, see [choose a Docker Compose configuration](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration#choose-a-docker-compose-configuration).

| Installation method                                                | Starts Management Identity                                          | Starts Keycloak                                                                                                                                                                                               |
| :----------------------------------------------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Docker Compose, full (`docker-compose-full.yaml`)                  | Yes                                                                 | Yes                                                                                                                                                                                                           |
| Docker Compose, standalone Camunda Hub (`docker-compose-hub.yaml`) | Yes                                                                 | Yes                                                                                                                                                                                                           |
| Docker Compose, lightweight (`docker-compose.yaml`)                | No                                                                  | No                                                                                                                                                                                                            |
| Helm                                                               | Yes, when you set `identity.enabled: true`. The default is `false`. | No. The chart doesn't deploy Keycloak. Deploy it with the [Keycloak operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) and connect the Helm chart to it. |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/identity-first-steps
