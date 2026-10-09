# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Convert an existing release — Step 3: Update the release's values

Set these values on the existing release. Leave the release name, namespace, broker configuration, secondary storage configuration, and every index prefix unchanged.

| Value                                                                                          | Set to                                                                                                                                                                                               |
| :--------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `global.topology.mode`                                                                         | `orchestration`                                                                                                                                                                                      |
| `global.identity.auth.enabled`                                                                 | `true`                                                                                                                                                                                               |
| `global.identity.service.url`                                                                  | The Management Identity service in the Hub namespace                                                                                                                                                 |
| `global.identity.auth.type`, and the issuer, token, and JWKS URLs under `global.identity.auth` | The same provider type and endpoints as the Hub release. See [authentication and authorization](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index) for your provider |
| `global.identity.keycloak.url`                                                                 | With Keycloak only: the Keycloak the Hub release uses                                                                                                                                                |
| `identity.enabled`                                                                             | `false`                                                                                                                                                                                              |
| `console.enabled`, `webModeler.enabled`                                                        | `false`                                                                                                                                                                                              |

Disable the bundled identity and database subcharts. The 8.8 and 8.9 charts reject all three listed for them in the `orchestration` role, and the 8.7 chart rejects all four. On the 8.7 chart, keep `zeebe.enabled`, `operate.enabled`, and `tasklist.enabled` set to `true`:

| Chart | Set to `false`                                                                                              |
| :---- | :---------------------------------------------------------------------------------------------------------- |
| 8.9   | `identityPostgresql.enabled`, `webModelerPostgresql.enabled`, and `identityKeycloak.enabled`                |
| 8.8   | `identityPostgresql.enabled`, `webModelerPostgresql.enabled`, and `identityKeycloak.enabled`                |
| 8.7   | `identityKeycloak.enabled`, `identityPostgresql.enabled`, `postgresql.enabled`, `executionIdentity.enabled` |

Then set each component's client ID, audience, client secret, and redirect URL to the values in the cluster record. For the client secret, set `existingSecret` and `existingSecretKey` to the Secret the record uses for that component:

| Chart    | Values                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.8, 8.9 | `orchestration.security.authentication.oidc.clientId`, `.audience`, `.redirectUrl`, and `.secret`; `connectors.security.authentication.oidc.clientId` and `.secret`; `global.identity.auth.optimize.clientId`, `.audience`, `.redirectUrl`, and the secret keys; and the Connectors client ID in `orchestration.security.initialization.defaultRoles.connectors.clients`                                                                  |
| 8.7      | `global.identity.auth.zeebe`, `.operate`, and `.tasklist`: the record's orchestration client ID, audience, and secret keys, the same in all three. `.operate.redirectUrl` and `.tasklist.redirectUrl`: the record's orchestration `redirectUrl` followed by `/operate` and `/tasklist`. `global.identity.auth.connectors`: client ID and secret keys. `global.identity.auth.optimize`: client ID, audience, secret keys, and redirect URL |

On chart 8.7, a record with `architecture: legacy` registers only `/operate/identity-callback` and `/tasklist/identity-callback` under its orchestration `redirectUrl`. Serve Operate and Tasklist at `/operate` and `/tasklist` on that host, or browser sign-in fails.

On the 8.7, 8.8, and 8.9 charts, Optimize stays in this release. The `optimize` role that runs it as its own release needs the 8.10 chart. Move Optimize to its own release after you upgrade the cluster to 8.10.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
