# Set up the Helm chart with an external Keycloak instance — Troubleshooting

For issues common to any OIDC provider, see [Troubleshoot OIDC authentication](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc). The following are specific to external Keycloak:

**Management Identity pod restarts once during first startup**
A single restart during the very first deployment is expected. Immediately after creating the realm, Management Identity can briefly hit `403 Forbidden` while disabling Keycloak's default system clients. This is a timing issue between realm creation and Keycloak's permission propagation, not a misconfiguration, and the automatic pod restart resolves it. Investigate further only if the pod keeps crash-looping past the first retry.

**Management Identity fails to connect to the Keycloak admin API**
The `global.identity.keycloak.*` settings configure the admin API connection used for provisioning, which is separate from the OIDC login flow. Verify `url.protocol`, `url.host`, `url.port`, and `contextPath` together form a URL reachable from inside the cluster:

```bash
kubectl run -it --rm curl --image=curlimages/curl --restart=Never -- \
  curl https://<keycloak-internal-url>/realms/<realm>/.well-known/openid-configuration
```

A valid response confirms the realm is reachable at that URL. If this fails, double check `issuerBackendUrl` from the global configuration step, since it should resolve to the same host.

**Realm already exists, but clients aren't created**
If the realm already existed when Management Identity started, Management Identity doesn't re-create it, but it does still attempt to create any missing clients. If clients are still missing after startup, check the Management Identity logs for provisioning errors. The most common cause is that the admin credentials lack permission to create clients in the existing realm.

**Demo user can't log in**
The `identity-firstuser-password` secret value is only applied when the demo user is first created. If this user already exists from a previous deployment with a different password, changing the secret has no effect on it. Reset the user's password directly in the Keycloak admin console.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak
