# Camunda components troubleshooting

Troubleshooting considerations in Platform deployment.


## Keycloak requires SSL for requests from external sources

When deploying Camunda to a provider, it is important to confirm the IP ranges used
for container to container communication align with the IP ranges Keycloak considers "local". By default, Keycloak considers all IPs outside those listed in their
[external requests documentation](https://www.keycloak.org/docs/latest/server_admin/#_ssl_modes)
to be external and therefore require SSL.

As the [Camunda Helm Charts](https://artifacthub.io/packages/helm/camunda/camunda-platform) currently do
not provide support for the distribution of the Keycloak TLS key to the other containers, we recommend viewing the solution available in the
[Identity documentation](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/troubleshoot-identity#solution-2-management-identity-making-requests-from-an-external-ip-address).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
