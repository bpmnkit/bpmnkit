# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Enable Hub

Replace the legacy enablement keys with `camundaHub.enabled`. Move overrides directly under `camundaHub`:

```yaml
# Before (8.9)
console:
  enabled: true
webModeler:
  enabled: true
  restapi:
    resources:
      requests:
        memory: 1Gi

# After (8.10)
camundaHub:
  enabled: true
  restapi:
    resources:
      requests:
        memory: 1Gi
```

The legacy `webModeler.enabled` key remains a compatibility shim in 8.10. It deploys Hub and emits a deprecation warning. Existing `webModeler.*` settings remain fallback values. However, migrate them to the equivalent flattened `camundaHub.*` paths.

Don't nest settings under `camundaHub.webModeler` or `camundaHub.console`. If you nest settings under either key, the chart fails the render.

The setting `camundaHub.enabled: true` also enables the Console feature. If your 8.9 release ran only Web Modeler, Hub shows Console's cluster pages after the upgrade.

#### Merge `webModeler` and `camundaHub` values

The chart deep-merges `camundaHub.*` over `webModeler.*`, and a value under `camundaHub` wins:

- Maps merge key by key, so a map under `camundaHub` can't remove a key that `webModeler` sets.
- Lists don't merge. A list under `camundaHub`, such as `camundaHub.restapi.env`, `extraVolumes`, `extraConfiguration`, `tolerations`, or `initContainers`, replaces the whole list under `webModeler`. When you move a list, move all of its entries.
- If you set a scalar under `camundaHub` where `webModeler` has a map, or the reverse, the chart fails the render.

#### Deploy Camunda Hub for a Console-only release

`console.enabled: true` doesn't deploy anything on its own in 8.10. Hub runs only when `camundaHub.enabled` or `webModeler.enabled` is `true`. `console.enabled` has an effect only when Hub runs through the legacy `webModeler.enabled`. Then it enables the Console feature inside Hub. With `camundaHub.enabled: true`, the Console feature is always enabled, and `console.enabled: false` doesn't disable it.

If your 8.9 release ran Console without Web Modeler, do these steps. Set `camundaHub.enabled: true`. Keep Management Identity configured as it was for Console. Add the settings Hub needs:

| Setting                           | Helm key                                                                                                                                                                                                         |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| External PostgreSQL database      | `camundaHub.restapi.externalDatabase.*`. The chart doesn't check this setting at render time.                                                                                                                    |
| Sender address for Hub emails     | `camunda.hub.mail.from-address` in `camundaHub.restapi.extraConfiguration`. The render fails without this setting.                                                                                               |
| SMTP server for Hub emails        | `spring.mail.*` in `camundaHub.restapi.extraConfiguration`. Hub sends no emails without this setting.                                                                                                            |
| Public URL for the login callback | `global.identity.auth.camundaHub.redirectUrl`. It replaces `global.identity.auth.console.redirectUrl`.                                                                                                           |
| Path Hub is served on             | `camundaHub.contextPath`. Set this key when the chart renders your Ingress or Gateway API routes. Without this key, the shared Ingress has no Hub path, and the Kubernetes API server rejects the Hub HTTPRoute. |

If you use an external OIDC provider, Hub authenticates with the client ID `web-modeler` and the audiences `web-modeler-api` and `web-modeler-public-api`. Hub uses these values unless you set `global.identity.auth.camundaHub.clientId`, `clientApiAudience`, and `publicApiAudience`. Register Hub's applications in your provider. The Console application doesn't cover them. See [connect to an OIDC provider](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider#configuration).

A Console-only release has no 8.9 Hub database, so the release doesn't need the database migration phases. Run the one-step upgrade in [Run the Helm upgrade](#run-the-helm-upgrade).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
