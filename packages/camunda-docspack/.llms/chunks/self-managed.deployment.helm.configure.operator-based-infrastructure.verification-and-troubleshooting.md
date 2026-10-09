# Deploy required dependencies with Kubernetes operators — Verification and troubleshooting

### Verify infrastructure deployment

Check that all infrastructure components are running correctly:

  
### postgresql

```bash
# Check PostgreSQL clusters
kubectl get clusters -n $CAMUNDA_NAMESPACE

# Verify services
kubectl get svc -n $CAMUNDA_NAMESPACE | grep "pg-"

# Check cluster status
kubectl describe cluster pg-identity -n $CAMUNDA_NAMESPACE
```

  
### elasticsearch

```bash
# Check Elasticsearch cluster
kubectl get elasticsearch -n $CAMUNDA_NAMESPACE

# Verify services
kubectl get svc -n $CAMUNDA_NAMESPACE | grep "elasticsearch"

# Check cluster health
kubectl get elasticsearch elasticsearch -n $CAMUNDA_NAMESPACE -o jsonpath='{.status.health}'
```

  
### keycloak

```bash
# Check Keycloak instance
kubectl get keycloak -n $CAMUNDA_NAMESPACE

# Verify services
kubectl get svc -n $CAMUNDA_NAMESPACE | grep keycloak

# Check readiness
kubectl get keycloak keycloak -n $CAMUNDA_NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
```

### Common issues and solutions

#### PostgreSQL cluster not starting

**Symptoms:** PostgreSQL pods stuck in pending or crash loop

**Solutions:**

- Verify persistent volume claims are bound: `kubectl get pvc -n $CAMUNDA_NAMESPACE`
- Check node resources and storage availability
- Review CloudNativePG operator logs: `kubectl logs -n cnpg-system deployment/cnpg-controller-manager`

**Reference:** [CloudNativePG Troubleshooting](https://cloudnative-pg.io/docs/1.30/troubleshooting)

#### Elasticsearch cluster yellow/red status

**Symptoms:** Elasticsearch cluster health is not green

**Solutions:**

- Check disk space and memory allocation
- Verify all nodes are running: `kubectl get pods -n $CAMUNDA_NAMESPACE -l elasticsearch.k8s.elastic.co/cluster-name=elasticsearch`
- Review ECK operator logs: `kubectl logs -n elastic-system statefulset/elastic-operator`

**Reference:** [ECK Troubleshooting Guide](https://www.elastic.co/guide/en/cloud-on-k8s/current/k8s-troubleshooting.html)

#### Keycloak authentication errors

**Symptoms:** Camunda components cannot authenticate with Keycloak

**Solutions:**

- Verify Keycloak is accessible: `kubectl port-forward svc/keycloak-service 18080:18080 -n $CAMUNDA_NAMESPACE`

**Note**
  This uses `keycloak-service` (the service name created by the Keycloak Operator) and port `18080` (configured via `httpPort` in the Keycloak CR for local deployments). This differs from Helm chart deployments which use `camunda-keycloak` service name and port `80`.

- Check client configurations in Keycloak admin console
- Verify redirect URLs match your deployment setup

**Reference:** [Keycloak Operator Documentation](https://www.keycloak.org/operator/basic-deployment)

#### Keycloak pod crashes on HTTP/2 cleartext (h2c) requests

**Symptoms:** The Keycloak pod exits or enters `CrashLoopBackOff` when it receives an HTTP/2 cleartext (h2c) request, such as a client sending an `Upgrade: h2c` header over a plain-HTTP port-forward. Clients receive an empty reply, and the Keycloak logs show a `java.lang.NoSuchMethodError` originating from Vert.x and Netty.

**Cause:** `camunda/keycloak:quay-optimized-*` image tags older than `quay-optimized-26.6.4` bundle a conflicting Netty HTTP/2 codec under `/opt/keycloak/providers`, pulled in transitively by the AWS Advanced JDBC Wrapper. It shadows the Netty version shipped with Keycloak and breaks h2c handling.

**Solutions:**

- Upgrade the Keycloak image to `camunda/keycloak:quay-optimized-26.6.4` or later, where the conflicting Netty libraries are removed. Update the `image` field in your Keycloak custom resource (`keycloak-instance-*.yml`). This is the recommended fix.
- If you cannot upgrade, disable HTTP/2 so Keycloak falls back to HTTP/1.1. Set the `QUARKUS_HTTP_HTTP2` environment variable to `false` in the Keycloak custom resource:

  ```yaml
  spec:
    unsupported:
      podTemplate:
        spec:
          containers:
            - env:
                - name: QUARKUS_HTTP_HTTP2
                  value: "false"
  ```

**Reference:** [camunda/keycloak HTTP/2 cleartext crash issue](https://github.com/camunda/camunda-deployment-references/issues/2809)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
