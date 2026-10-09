# RDBMS example deployment for Camunda with Helm — Installation workflow — Step 6: Handle custom JDBC drivers (if required)

If you're using Oracle, MySQL, or a database version not covered by bundled drivers, you must provide the JDBC driver.

**Note**
For detailed information about JDBC driver strategies, security configurations, and validation, see [JDBC driver management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers).

#### Option A: Init container (recommended for production)

Update your `values-rdbms.yaml`:

```yaml
orchestration:
  extraVolumeMounts:
    - name: jdbcdrivers
      mountPath: /driver-lib
  extraVolumes:
    - name: jdbcdrivers
      emptyDir: {}
  initContainers:
    - name: fetch-jdbc-drivers
      image: alpine:3.19
      imagePullPolicy: Always
      command:
        - sh
        - -c
        - >
          wget https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc11/23.9.0.25.07/ojdbc11-23.9.0.25.07.jar
          -O /driver-lib/ojdbc.jar
      volumeMounts:
        - name: jdbcdrivers
          mountPath: /driver-lib
      securityContext:
        runAsUser: 1001
```

For other driver sources (e.g., private repositories), adjust the `wget` command or use a private container registry for pre-built images.

#### Option B: ConfigMap (GitOps-friendly)

Store the driver JAR in a ConfigMap and mount it:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: jdbc-drivers
  namespace: camunda
data:
  ojdbc.jar: <base64-encoded JAR content>
---
orchestration:
  extraVolumeMounts:
    - name: jdbcdrivers
      mountPath: /driver-lib
  extraVolumes:
    - name: jdbcdrivers
      configMap:
        name: jdbc-drivers
```

See [JDBC driver loading](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms#bundled-vs-custom-jdbc-drivers) for more strategies.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
