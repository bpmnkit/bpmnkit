# JDBC driver management for RDBMS — Loading JDBC drivers into pods

**Note**

The following applies to each of the components that require JDBC drivers: Orchestration Cluster, Identity, and Web Modeler, though examples may only reference Orchestration Cluster.

Some databases—such as Oracle and MySQL—require JDBC drivers that cannot be included in the Camunda image due to licensing restrictions. You must provide these drivers at runtime using one of the following approaches.

### Option 1: Using an init container

**Note**
This example uses `/driver-lib`, which the Orchestration Cluster automatically adds to the classpath. If you use a different directory, additional override configuration may be required.

```yaml
orchestration:
  exporters:
    camunda:
      enabled: false
    rdbms:
      enabled: true
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: jdbc:oracle:thin:@//hostname:1521/FREEPDB1
        username: myuser
        secret:
          inlineSecret: mypassword
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

After loading JDBC drivers into pods, run the validation checklist in [validate RDBMS connectivity](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms) to confirm the application can load the driver, reach the database, and initialize schema.

### Option 2: Using a custom Docker image

**Note**
This is a custom image approach. For production, prefer the init-container method to stay aligned with supported Helm patterns.

```dockerfile
FROM camunda/camunda-platform:8.9.0
ADD ojdbc8.jar /driver-lib/ojdbc8.jar
```

Build and push:

```sh
docker build -t internal-registry/orchestration:8.9.0 .
docker push internal-registry/orchestration:8.9.0
```

Configure in Helm:

```yaml
orchestration:
  exporters:
    camunda:
      enabled: false
    rdbms:
      enabled: true
  image:
    repository: internal-registry/orchestration
    tag: 8.9.0
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: jdbc:oracle:thin:@//hostname:1521/FREEPDB1
        username: myuser
        secret:
          inlineSecret: mypassword
```

### Option 3: Mounting a JDBC driver from a volume

**Warning: Important**
Mounting an `emptyDir volume` does not persist across pod restarts. Use a ConfigMap, PersistentVolume, or custom image for production.

```yaml
orchestration:
  exporters:
    camunda:
      enabled: false
    rdbms:
      enabled: true
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: jdbc:oracle:thin:@//hostname:1521/FREEPDB1
        username: myuser
        secret:
          inlineSecret: mypassword
  extraVolumeMounts:
    - name: jdbcdrivers
      mountPath: /driver-lib
  extraVolumes:
    - name: jdbcdrivers
      emptyDir: {}
```

Copy the driver manually to the pod:

```sh
kubectl cp /path/to/ojdbc8.jar <pod-name>:/driver-lib/ojdbc8.jar
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers
