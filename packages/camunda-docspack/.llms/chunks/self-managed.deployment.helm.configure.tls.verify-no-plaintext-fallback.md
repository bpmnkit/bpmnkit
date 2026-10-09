# Configure TLS — Verify no plaintext fallback

```bash
curl -fsSLO https://raw.githubusercontent.com/camunda/camunda-platform-helm/main/scripts/check-no-plaintext-datastore.sh
chmod +x check-no-plaintext-datastore.sh

./check-no-plaintext-datastore.sh \
  --namespace "$NAMESPACE" \
  --kube-context "$KUBE_CONTEXT"
```

Exit code 0 + `[no-plaintext-check] PASS` means no Camunda pod is talking plaintext to a known datastore.


## Updating the CA

```bash
kubectl -n "$NAMESPACE" create secret generic camunda-ca-bundle \
  --from-file=ca.crt=./new-ca-bundle.pem \
  --dry-run=client -o yaml | kubectl -n "$NAMESPACE" apply -f -

kubectl -n "$NAMESPACE" rollout restart \
  statefulset,deployment \
  -l app.kubernetes.io/part-of=camunda-platform
```

The init container re-runs on each pod start and imports the new CA into a fresh truststore.

### Optional: automatic rollout on `helm upgrade`

Set `global.tls.caBundle.autoRollout: true` to stamp a `checksum/ca-bundle` annotation on Java pods so they automatically roll out when the CA Secret changes.

**Caution: Constraints**

- Requires `get` on Secrets in the release namespace — `lookup` fails with `Forbidden` without it.
- Argo CD and Flux render via `helm template` (no cluster access), so the annotation stays constant. Drive restarts from your GitOps stack instead.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls
