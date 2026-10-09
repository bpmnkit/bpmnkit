# Helm 4 — Helm CLI v4 breaking changes {#helm-4-breaking-changes}

### Server-side apply is enabled by default

Server-side apply is a Kubernetes feature that improves how changes to Kubernetes resources are merged. When multiple clients update the same resource, server-side apply reduces the risk of unintentional overwrites.

In Helm CLI v4, server-side apply is enabled by default. This changes the behavior of `helm install` and `helm upgrade` compared to Helm CLI v3.

#### Problem

Server-side apply has a known limitation: duplicate environment variables on the same Kubernetes resource are treated as an error, rather than later entries overwriting earlier ones.

In the Camunda Helm chart, environment variables are sometimes used as an override mechanism for values defined by the chart. For example, if the following is set in `values.yaml`:

```yaml
identity:
  env:
    - name: CAMUNDA_LICENSE_KEY
      value: "--- YOUR LICENSE KEY HERE ---"
```

The rendered Identity deployment may contain duplicate entries:

```yaml
spec:
  containers:
    - name: identity
      env:
        - name: CAMUNDA_LICENSE_KEY
          value: "--- CAMUNDA_DEFAULT_VALUE ---"
        - name: CAMUNDA_LICENSE_KEY
          value: "--- YOUR LICENSE KEY HERE ---"
```

In Helm CLI v4, this causes the install or upgrade to fail with an error similar to the following:

> Error: INSTALLATION FAILED: failed to create typed patch object (default/RELEASE-identity; apps/v1, Kind=Deployment):  
> .spec.template.spec.containers[name="identity"].env: duplicate entries for key [name="CAMUNDA_LICENSE_KEY"]

This behavior can affect any Camunda Helm chart component where environment variables are overridden using the `env` list.

#### Workarounds

If you encounter a duplicate environment variable error, apply one of the following workarounds:

1. Prefer dedicated `values.yaml` options over environment variable overrides whenever available.  
   For example, use `global.license` instead of setting `CAMUNDA_LICENSE_KEY` via the `env` section.

2. Override application configuration using the `configuration` or `extraConfiguration` options in `values.yaml` instead of environment variables.  
   See [Configure Helm chart components](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs) for details.

3. Disable server-side apply when running Helm commands:

   ```bash
   helm install ... --server-side=false
   helm upgrade ... --server-side=false
   ```

4. Helm CLI v3 can be used as a temporary workaround until February 10, 2027. After that date, Camunda no longer supports Helm CLI v3, and continued use is at the customer’s own risk. Use one of the other workarounds instead.

**Note: Helm CLI v3 support**
Helm CLI v3.22.0 is the final Helm CLI v3 minor release. See the [Helm v3 end-of-life announcement](https://helm.sh/blog/helm-v3-end-of-life/).

Until Helm CLI v3 support ends, if your package manager doesn't provide Helm CLI v3, you can run it using Docker:

```bash
docker run \
  -v ~/.kube:/root/.kube \
  alpine/helm:3.19.4 \
  install RELEASE camunda/camunda-platform \
  <other-helm-cli-options>
```

### Post-renderers are now plugins

In Helm CLI v4, post-renderers must be implemented as Helm plugins.

If you previously passed an executable path (for example, a shell script) using the `--post-renderer` option, you must migrate that logic into a Helm plugin.

**Info**
Refer to the Helm documentation for a [tutorial on building a post-renderer plugin](https://helm.sh/docs/plugins/developer/tutorial-postrenderer-plugin/).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/helm-v4
