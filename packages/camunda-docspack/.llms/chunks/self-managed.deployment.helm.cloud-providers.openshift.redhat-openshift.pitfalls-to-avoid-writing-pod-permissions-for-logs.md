# Red Hat OpenShift — Pitfalls to avoid — Writing pod permissions for logs

OpenShift security policies often restrict writing to files within containers. This can cause Camunda pods to fail to write to the filesystem, which is typically required for writing log in files.

Instead, we configure the environment to output logs to `stdout` and `stderr` only, which are supported by OpenShift logging infrastructure.

For Camunda components (except Identity), this can be done by setting the environment variable in the chart values:

```yaml
zeebe/tasklist/operate/etc:
  env:
    - name: CAMUNDA_LOG_FILE_APPENDER_ENABLED
      value: "false"
```

This will disable the file appender and ensure logs are visible via the container's log output.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
