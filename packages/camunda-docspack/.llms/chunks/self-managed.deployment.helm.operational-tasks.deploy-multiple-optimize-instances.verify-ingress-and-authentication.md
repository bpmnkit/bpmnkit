# Deploy multiple Optimize instances with Helm — Verify Ingress and authentication

The two releases create separate Ingress objects with the same host and different paths. `ingress-nginx` merges these rules into one virtual host:

| Release           | Path               | Callback URL                                                 |
| ----------------- | ------------------ | ------------------------------------------------------------ |
| `platform`        | `/optimize-team-a` | `https://<host>/optimize-team-a/api/authentication/callback` |
| `optimize-team-b` | `/optimize-team-b` | `https://<host>/optimize-team-b/api/authentication/callback` |

Check the generated rules:

```bash
kubectl get ingress --namespace "$NAMESPACE" \
  --selector app.kubernetes.io/part-of=camunda-platform
kubectl describe ingress --namespace "$NAMESPACE" \
  --selector app.kubernetes.io/instance=platform
kubectl describe ingress --namespace "$NAMESPACE" \
  --selector app.kubernetes.io/instance=optimize-team-b
```

Check each authentication redirect:

```bash
curl --silent --show-error --dump-header - --output /dev/null \
  --location --max-redirs 5 \
  "https://$CAMUNDA_HOST/optimize-team-a" \
  | tr -d '\r' | grep -i '^location:.*client_id=optimize-team-a'

curl --silent --show-error --dump-header - --output /dev/null \
  --location --max-redirs 5 \
  "https://$CAMUNDA_HOST/optimize-team-b" \
  | tr -d '\r' | grep -i '^location:.*client_id=optimize-team-b'
```

Both commands must print a redirect to the configured OIDC provider with the intended `client_id`. Complete a browser login to both URLs with a user assigned the `Optimize` role.

Using the same host for multiple Ingress objects is controller-specific. This guide supports `ingress-nginx`. If your controller doesn't merge same-host rules, use separate hosts and update `global.host`, each Optimize `redirectUrl`, the custom client's `rootUrl`, and the Keycloak callback URI.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
