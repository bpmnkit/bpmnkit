# Deploy multiple Optimize instances with Helm — Prepare the reference values

The Helm repository contains two values files that are rendered in chart tests:

- `values-platform.yaml` enables the platform and registers both Optimize clients.
- `values-optimize-only.yaml` enables only the second Optimize instance.

Set the chart version you will install, then download both files from the matching release tag. Camunda chart release tags use the format `camunda-platform-8.10-<chart-version>`.

```bash
export CHART_VERSION="<15.x chart version for Camunda 8.10>"
export HELM_SOURCE_REF="camunda-platform-8.10-$CHART_VERSION"
export HELM_VALUES_BASE_URL="https://raw.githubusercontent.com/camunda/camunda-platform-helm/$HELM_SOURCE_REF/charts/camunda-platform-8.10/test/integration/scenarios/chart-full-setup/values/features/multi-optimize"

curl -fsSLo values-platform.yaml \
  "$HELM_VALUES_BASE_URL/values-platform.yaml"
curl -fsSLo values-optimize-only.yaml \
  "$HELM_VALUES_BASE_URL/values-optimize-only.yaml"
```

Update these values in both files before installation:

| Value                                                    | Required change                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| `global.host`                                            | Set the shared browser-facing host.                                 |
| `global.ingress.className`                               | Set the `ingress-nginx` class used by both releases.                |
| `global.ingress.tls.secretName`                          | Set the existing TLS Secret for the shared host.                    |
| `global.identity.keycloak.*`                             | Set the in-cluster Keycloak service, port, context path, and realm. |
| `global.identity.auth.publicIssuerUrl`                   | Set the issuer URL reachable from a user's browser.                 |
| `global.identity.auth.issuerBackendUrl`                  | Set the issuer URL reachable from Camunda pods.                     |
| `global.identity.auth.camundaHub.redirectUrl`            | Set the browser-facing Camunda Hub URL in `values-platform.yaml`.   |
| `global.identity.auth.optimize.redirectUrl`              | Set each Optimize instance's browser-facing root URL.               |
| `identity.clients[].rootUrl` for `optimize-team-b`       | Set the second Optimize client's browser-facing root URL.           |
| `orchestration.security.authentication.oidc.redirectUrl` | Set the browser-facing Orchestration Cluster URL.                   |
| `optimize.database.elasticsearch.url.*`                  | Set the shared Elasticsearch endpoint.                              |
| `orchestration.data.secondaryStorage.elasticsearch.url`  | Set the same Elasticsearch endpoint in `values-platform.yaml`.      |
| Every `existingSecret` and `existingSecretKey`           | Match the Secrets managed in your namespace.                        |

The files assume the release names in this guide. If you change `platform`, also change `global.identity.service.url` in `values-optimize-only.yaml` to the generated Management Identity service name.

### Use an external OIDC provider instead of Keycloak

The reference files use Keycloak, where Management Identity reads `identity.clients` and provisions `optimize-team-b`. A generic external OIDC provider doesn't use this automatic provisioning path.

To use another OIDC provider:

1. Follow the [external OIDC provider guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-oidc-provider) for the provider endpoints, claims, and existing-secret values.
1. Register `optimize-team-a` and `optimize-team-b` as separate confidential clients in the provider before installing either release.
1. Configure these callback URLs:

- `https://<host>/optimize-team-a/api/authentication/callback`
- `https://<host>/optimize-team-b/api/authentication/callback`

1. Configure both clients for the `optimize-api` audience and the claims required by your Camunda authorization mapping.
1. Remove the Keycloak-specific `identity.clients` entry and `global.identity.keycloak` configuration from the reference files.
1. Keep the distinct client IDs, existing-secret references, context paths, and Optimize index prefixes.

### Use OpenSearch instead of Elasticsearch

The reference files use Elasticsearch. For OpenSearch, make all of the following changes in both files:

- Disable `optimize.database.elasticsearch` and enable `optimize.database.opensearch`.
- Configure `optimize.database.opensearch.url`, authentication, and TLS by following the [Optimize OpenSearch guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-opensearch).
- In `values-platform.yaml`, set `orchestration.data.secondaryStorage.type: opensearch` and configure the same OpenSearch endpoint.
- Replace `CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX` with `CAMUNDA_OPTIMIZE_OPENSEARCH_SETTINGS_INDEX_PREFIX` for both Optimize instances and their migration containers.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
