# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — openshift-routes

[Routes](https://docs.openshift.com/container-platform/latest/networking/routes/route-configuration.html) expose services externally by linking a URL to a service within the cluster. OpenShift supports both the [standard Kubernetes Ingress and routes](https://docs.openshift.com/container-platform/latest/networking/ingress-operator.html), giving cluster users the flexibility to choose.

The presence of routes is rooted in their specification predating Ingress. The functionality of routes differs from Ingress; for example, unlike Ingress, routes don't allow multiple services to be linked to a single route or the use of paths.

To use these routes for the Zeebe Gateway, configure this through Ingress as well.

#### Setting Up the application domain for Camunda 8

The route created by OpenShift will use a domain to provide access to the platform. By default, you can use the OpenShift applications domain, but any other domain supported by the router can also be used.

To retrieve the OpenShift applications domain (used as an example here), run the following command and define the route domain that will be used for the Camunda 8 deployment:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/procedure/setup-application-domain.sh
```

If you choose to use a custom domain instead, ensure it is supported by your router configuration and replace the example domain with your desired domain. For more details on configuring custom domains in OpenShift, refer to the official [custom domain OpenShift documentation](https://docs.openshift.com/dedicated/applications/deployments/osd-config-custom-domains-applications.html).

#### Checking if HTTP/2 is enabled

As the Zeebe Gateway also uses `gRPC` (which relies on `HTTP/2`), [HTTP/2 Ingress Connectivity must be enabled](https://docs.openshift.com/container-platform/latest/networking/ingress-operator.html#nw-http2-haproxy_configuring-ingress).

To check if HTTP/2 is already enabled on your OpenShift cluster, run the following command:

```bash
oc get ingresses.config/cluster -o json | jq '.metadata.annotations."ingress.operator.openshift.io/default-enable-http2"'
```

Alternatively, if you use a dedicated IngressController for the deployment:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/procedure/get-ingress-http2-status.sh
```

- If the output is `"true"`, it means HTTP/2 is enabled.
- If the output is `null` or empty, HTTP/2 is not enabled.

   Enable HTTP/2

If HTTP/2 is not enabled, you can enable it by running the following command:

**IngressController configuration:**

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/procedure/enable-ingress-http2.sh
```

**Global cluster configuration:**

```bash
oc annotate ingresses.config/cluster ingress.operator.openshift.io/default-enable-http2=true
```

This will add the necessary annotation to [enable HTTP/2 for Ingress in your OpenShift cluster](https://docs.openshift.com/container-platform/latest/networking/ingress-operator.html#nw-http2-haproxy_configuring-ingress) globally on the cluster.

#### Enable ALPN h2 on ROSA HCP

These steps are required only on **Red Hat OpenShift Service on AWS – Hosted Control Planes (ROSA HCP)** managed clusters. Self-managed OpenShift clusters where the cluster-wide `ingress.operator.openshift.io/default-enable-http2=true` annotation is honored do **not** need this workaround.

On ROSA HCP, the `ingress-config-validation.managed.openshift.io` admission webhook denies the cluster-wide annotation, and the per-`IngressController` annotation alone does not make HAProxy advertise ALPN `h2` on the default certificate path. As a result, gRPC clients fail to connect to the Zeebe Gateway, with `zbctl` reporting `credentials: cannot check peer: missing selected ALPN property`.

The OpenShift router advertises ALPN `h2` on a per-SNI basis through a `crt-list` entry that HAProxy generates only for Routes that carry an explicit `spec.tls.certificate`. In other words, the gRPC Route must reference a TLS Secret in the Camunda namespace; the default `secretName: '-'` (Ingress-Operator-managed) is not enough on ROSA HCP.

To fix this, copy the router default wildcard TLS Secret from `openshift-ingress` into the Camunda namespace, then point the gRPC Ingress to it:

1. Copy the router wildcard certificate Secret into the Camunda namespace:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/procedure/copy-router-tls-secret.sh
   ```

   ```bash
   export CAMUNDA_NAMESPACE="${CAMUNDA_NAMESPACE:-camunda}"
   export CAMUNDA_PLATFORM_ROUTER_TLS_SECRET="camunda-platform-router-tls"
   ./generic/openshift/single-region/procedure/copy-router-tls-secret.sh
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
