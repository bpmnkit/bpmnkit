# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Review changed chart defaults

The following chart 15.x changes apply on `helm upgrade` without any change to your values file. Review each change against your deployment.

#### Set the public issuer URL explicitly

The default of `global.identity.auth.publicIssuerUrl` changed from `http://localhost:18080/auth/realms/camunda-platform` to an empty string. If your 8.9 values file sets neither `global.identity.auth.publicIssuerUrl` nor `global.identity.auth.issuer`, the components receive an empty issuer and a relative authorization URI after the upgrade. The chart reports no error. Before you upgrade, set the issuer URL that your users' browsers reach:

```yaml
global:
  identity:
    auth:
      publicIssuerUrl: https://keycloak.example.com/auth/realms/camunda-platform
```

#### Connectors and Management Identity use per-pod ephemeral volumes

Chart 15.x replaces the persistent volume claim (PVC) that the chart manages for Connectors and Management Identity with a per-pod ephemeral volume. The [Web Modeler REST API received the same change](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index#web-modeler-restapi-ephemeral-volume). The volume provides storage only for `/tmp`, so you lose no data.

| Setting                                          | Upgrade behavior                                                                                                            |
| :----------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `persistence.enabled: false` (default)           | No change.                                                                                                                  |
| `persistence.enabled: true`, no `existingClaim`  | Each pod has its own claim, created with the pod and removed with it. Helm removes the shared claim that it created in 8.9. |
| `persistence.enabled: true`, `existingClaim` set | No change. The pods still mount your existing claim.                                                                        |

This applies to `connectors.persistence` and `identity.persistence`. If you set `persistence.selector` to bind pre-provisioned volumes, provision one matching volume for each pod. Also provision one more matching volume for the extra pod during a rollout.

#### Connectors probes use the per-probe scheme

In chart 14.x, the Connectors startup, readiness, and liveness probes used the top-level `connectors.scheme`. They ignored the per-probe `scheme` values. In chart 15.x, they use `connectors.startupProbe.scheme`, `connectors.readinessProbe.scheme`, and `connectors.livenessProbe.scheme`. They ignore `connectors.scheme`.

The per-probe default is empty. An empty value becomes `HTTPS` when the chart detects that Connectors serves TLS. In all other cases, the value becomes `HTTP`.

The chart detects TLS from these sources, in this order. First, the chart checks the last `SERVER_SSL_ENABLED` entry in `connectors.env`. A value of `true` or `false` in this entry wins over the other sources. Second, the chart checks `global.tls.connectors.enabled: true`. Third, the chart checks `server.ssl.enabled: true` in `connectors.extraConfiguration` or `connectors.configuration`.

- If you set `connectors.scheme`, move the value to the per-probe keys.
- Remove per-probe `scheme` values that you copied from the chart 14.x defaults (`HTTP`). Chart 14.x ignored them. Chart 15.x uses them, so a Connectors pod that serves TLS never becomes ready.
- If Connectors serves TLS, chart 15.x also requires the certificate in your values file. See [Render fails because TLS is enabled without a certificate](#render-fails-because-tls-is-enabled-without-a-certificate).

#### Remove environment variables the chart now sets

Chart 15.x sets these environment variables itself. If your values file sets the same names, remove them from `identity.env`, `optimize.env`, or `camundaHub.restapi.env`. Duplicate names fail `helm upgrade` when Helm applies the release server-side. By default, Helm v4 applies a release server-side if you installed the release with Helm v4.

| Component                                                   | Environment variables                                                                                                                                                  |
| :---------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Management Identity (`global.identity.auth.type: KEYCLOAK`) | `CAMUNDA_CONNECTORS_CLIENT_ID`, `CAMUNDA_ORCHESTRATION_CLIENT_ID`, `CAMUNDA_OPTIMIZE_CLIENT_ID`                                                                        |
| Optimize                                                    | `VALUES_OPTIMIZE_CLIENT_SECRET` when Optimize authenticates and you configure its client secret, and `SERVER_SERVLET_CONTEXT_PATH` when you set `optimize.contextPath` |
| Camunda Hub REST API                                        | `CAMUNDA_HUB_PUSHER_APPID`, `CAMUNDA_HUB_PUSHER_KEY`, `CAMUNDA_HUB_PUSHER_SECRET`, and `SPRING_MAIL_PASSWORD` when you configure `camundaHub.restapi.mail.secret`      |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
