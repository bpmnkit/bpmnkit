# JDBC driver management for RDBMS — Verifying driver loading

After deployment, verify the JDBC driver was loaded:

```bash
# Check that the driver JAR exists
kubectl exec <pod-name> -- ls -la /driver-lib/

# Check logs for successful driver initialization
kubectl logs <pod-name> | grep -i "driver\|jdbc"
```

Common success indicators in logs:

```
INFO  org.springframework.boot.StartupInfoLogger - Started Application in X seconds
INFO  io.camunda.exporter.rdbms.RdbmsExporter - RdbmsExporter created with Configuration
```

Common failure indicators:

```
java.lang.ClassNotFoundException: oracle.jdbc.OracleDriver
java.sql.SQLException: No suitable driver found
```

If you see failures, verify:

1. The driver JAR file is present in `/driver-lib/`.
2. The init container or custom image executed successfully.
3. The JDBC URL in your configuration matches the driver (for example, Oracle URL with Oracle driver).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers
