# Red Hat OpenShift — Pitfalls to avoid — no-root-scc

#### Non-root SCCs

If you intend to deploy Camunda 8 while restricting applications from running as root (e.g., using the `nonroot` built-in SCCs), you'll need to configure each pod and container to run as a non-root user. For example, when deploying Zeebe using a stateful set, you would include the following YAML, replacing `1000` with the desired user ID:

```yaml
spec:
  template:
    spec:
      securityContext:
        runAsUser: 1000
      containers:
        securityContext:
          runAsUser: 1000
```

**Note**
As the container user in OpenShift is always part of the root group, defining a `fsGroup` for any Camunda 8 application pod security context is unnecessary.

This configuration is necessary for all Camunda 8 applications, as well as related ones (e.g., Keycloak, PostgreSQL, etc.). It's particularly crucial for stateful applications that will write to persistent volumes, but it's also generally a good security practice.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
