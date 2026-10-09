# RDBMS example deployment for Camunda with Helm — Troubleshooting

### Pod fails to start

**Check logs:**

```bash
kubectl logs -n camunda <pod-name>
```

**Common issues:**

- Database unreachable: Verify network policies, firewall, and JDBC URL.
- Authentication failed: Confirm secret and credentials.
- Driver not found (Oracle/MySQL): Verify init container or custom image has loaded the driver.

See [troubleshooting RDBMS connectivity](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms#troubleshooting-and-operations) for detailed diagnostics.

### Data not appearing in database

**Cause:** Flush interval delay or JDBC configuration issue.

**Check:** Monitor logs for exporter messages:

```bash
kubectl logs -n camunda <pod-name> | grep -i exporter
```

**Fix:** Adjust `flushInterval` and `queueSize` in your values file (see [Configuration reference](#configuration-reference)).

### JDBC driver version mismatch

**Symptom:** "ClassNotFoundException" or driver-related errors.

**Fix:** Ensure the driver version matches your database. See [Bundled vs. custom drivers](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms#bundled-vs-custom-jdbc-drivers).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
