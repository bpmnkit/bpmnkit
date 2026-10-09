# RDBMS troubleshooting and operations — Authentication errors

**Symptom:** "Authentication failed" or "Invalid password" in logs.

**Diagnosis:**

1. Verify the secret exists and contains the correct password:

```bash
kubectl get secret camunda-db-secret -o jsonpath='{.data.<key>}' -n camunda | base64 -d
```

2. Check the username in your Helm values matches the database user.

3. Test connection credentials manually (if possible from a pod or bastion host).

**Fix:** Ensure the username, password, and secret key reference are correct in your Helm values.


## JDBC driver not found

**Symptom:** ClassNotFoundException or "No suitable JDBC driver" in logs.

**Diagnosis:**

1. Verify the driver JAR file was loaded:

```bash
kubectl exec <pod-name> -- ls -la /driver-lib/
```

2. Check init container logs:

```bash
kubectl logs <pod-name> -c fetch-jdbc-drivers
```

3. Verify the JDBC URL matches the driver type (for example, Oracle URL with Oracle driver).

**Fix:** Re-apply the init container configuration or verify the custom image includes the driver. See [JDBC driver management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting
