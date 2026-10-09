# JDBC driver management for RDBMS — JDBC driver updates

### Updating bundled drivers

Bundled drivers are updated with new Camunda releases. To update:

1. Identify the new Camunda version with the updated driver.
2. Upgrade Camunda: `helm upgrade camunda camunda/camunda-platform --version X.Y.Z -f values.yaml -n camunda`.

### Updating custom drivers

If you're supplying a custom driver, update it by:

1. **Init container approach**: Update the driver download URL or image in your Helm values.
2. **Custom image approach**: Rebuild and push a new image with the updated driver.
3. **ConfigMap/Volume approach**: Update the driver JAR in your ConfigMap or PersistentVolume.

Then redeploy:

```bash
helm upgrade camunda camunda/camunda-platform -f values.yaml -n camunda
```

Kubernetes will recreate the pods with the new driver.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers
