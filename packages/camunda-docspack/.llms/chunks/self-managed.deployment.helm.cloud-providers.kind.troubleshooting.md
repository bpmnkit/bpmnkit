# Deploy Camunda 8 to a local kind cluster — Troubleshooting

### Pods don't start

Check the pod status and events:

```bash
kubectl get pods -n camunda
kubectl describe pod <pod-name> -n camunda
kubectl logs <pod-name> -n camunda
```

### Components fail OIDC discovery with 404 or 503 (Domain mode)

In domain mode, Identity provisions the `camunda-platform` Keycloak realm, and every other component reads its OIDC configuration from that realm at startup. When Identity never becomes ready, the realm is never created and the rest of the platform crash-loops.

The other components report the missing realm instead of the missing Identity, which makes the error misleading:

| Component     | Error                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| Orchestration | `503 Service Unavailable` on `https://camunda.example.com/auth/realms/camunda-platform` |
| Connectors    | `Failed to retrieve well known configuration ... status code 404 and message Not Found` |

Check whether the realm exists, then inspect Identity:

```bash
curl https://camunda.example.com/auth/realms/camunda-platform/.well-known/openid-configuration
kubectl get pods -n camunda
kubectl describe pod <camunda-identity-pod> -n camunda
```

If the realm returns `{"error":"Realm does not exist"}` and the Identity pod is in `CrashLoopBackOff`, Identity is the root cause. Restarting Orchestration or Connectors doesn't help, because the realm they need still doesn't exist.

A `Last State: Terminated, Reason: OOMKilled` line in the `kubectl describe pod` output means Identity ran out of memory. Give the container runtime more memory, or raise `identity.resources.limits.memory` in the Helm values before you redeploy.

### Browser shows certificate errors (Domain mode)

Ensure the mkcert CA is installed:

```bash
mkcert -install
```

Regenerate certificates:

```bash
./procedure/certs-generate.sh
./procedure/certs-create-secret.sh
kubectl rollout restart deployment -n camunda
```

### Ingress doesn't work (Domain mode)

Check the Ingress controller status:

```bash
kubectl get pods -n projectcontour
kubectl get ingress -n camunda
```

### Insufficient resources

Ensure your container runtime has enough resources allocated: 4 or more CPU cores, and 8 GB or more of RAM (12 GB or more with `SECONDARY_STORAGE=elasticsearch`).

- **Docker Desktop**: Check the [Resources settings](https://docs.docker.com/desktop/settings-and-maintenance/settings/#resources)
- **Docker Engine**: Configure the [Docker daemon](https://docs.docker.com/engine/daemon/) (configuration varies by OS)
- **Podman**: Resources are managed by your system; ensure sufficient resources are available

A pod that restarts repeatedly and shows `Last State: Terminated, Reason: OOMKilled` in `kubectl describe pod` output has hit its memory limit rather than the host limit. Raise the `resources.limits.memory` value for that component in the Helm values.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
