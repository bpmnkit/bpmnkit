# Use an alternative database for Management Identity — Oracle database configuration

### Driver provision

As the Oracle driver is not provided by default in each of the Camunda 8 distributions, you must download the driver and supply it for the application to load.

1. Download the appropriate Oracle driver: https://download.oracle.com/otn-pub/otn_software/jdbc/237/ojdbc17.jar.

2. When starting the application, set `-cp "/app/ojdbc.jar:/app/identity.jar"` in the `java` command during startup. This is only required for Oracle.

3. If you are using docker or kubernetes, ensure that the folder with the library is properly mounted as a volume.

### envVars

```sh
SPRING_DATASOURCE_URL="jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS=(PROTOCOL=tcps)(HOST=${IDENTITY_DATABASE_HOST:})(PORT=${IDENTITY_DATABASE_PORT:}))(CONNECT_DATA=(SERVICE_NAME=${IDENTITY_DATABASE_NAME:}))(SECURITY=(SSL_SERVER_CERT_DN=\"CN={CERT_CN}, O={CERT_ORG},L={..},ST={..},C={..}\")))"
SPRING_DATASOURCE_DRIVER_CLASS_NAME=oracle.jdbc.OracleDriver
SPRING_JPA_DATABASE=oracle
JAVA_TOOL_OPTIONS=$JAVA_OPTS

```

### valuesYaml

```yaml
identity:
  externalDatabase:
    enabled: true
  # These three configuration options are added so that spring knows to connect to oracledb using it's client library
  env:
    - name: SPRING_DATASOURCE_URL
      value: 'jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS=(PROTOCOL=tcps)(HOST=${IDENTITY_DATABASE_HOST:})(PORT=${IDENTITY_DATABASE_PORT:}))(CONNECT_DATA=(SERVICE_NAME=${IDENTITY_DATABASE_NAME:}))(SECURITY=(SSL_SERVER_CERT_DN="CN={CERT_CN}, O={CERT_ORG},L={..},ST={..},C={..}")))'
    - name: SPRING_DATASOURCE_DRIVER_CLASS_NAME
      value: oracle.jdbc.OracleDriver
    - name: JAVA_TOOL_OPTIONS
      value: $JAVA_OPTS
    - name: SPRING_JPA_DATABASE
      value: oracle
  # Overriding identity.command is required so that the new driver in /app will be loaded upon startup.
  command:
    - /bin/sh
    - -c
    - |
      java -cp "/extraDrivers/ojdbc.jar:/app/identity.jar" org.springframework.boot.loader.launch.JarLauncher
  # Extra volumes are mounted for any TLS certs necessary for the database:
  extraVolumeMounts:
    - name: "keystore-secret"
      secret:
        secretName: "keystore-secret"
    - name: jdbcdrivers
      mountPath: /extraDrivers
  extraVolumes:
    - name: "keystore-secret"
      mountPath: "/usr/local/certificates"
    - name: jdbcdrivers
      emptyDir: {}
  initContainers:
    - name: fetch-jdbc-drivers
      image: alpine:3.19
      imagePullPolicy: "Always"
      command:
        [
          "sh",
          "-c",
          "wget https://download.oracle.com/otn-pub/otn_software/jdbc/237/ojdbc17.jar -O /extraDrivers/ojdbc.jar",
        ]
      volumeMounts:
        - name: jdbcdrivers
          mountPath: /extraDrivers
      securityContext:
        runAsUser: 1001
```

### applicationYaml

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS=(PROTOCOL=tcps)(HOST=${IDENTITY_DATABASE_HOST:})(PORT=${IDENTITY_DATABASE_PORT:}))(CONNECT_DATA=(SERVICE_NAME=${IDENTITY_DATABASE_NAME:}))(SECURITY=(SSL_SERVER_CERT_DN=\"CN={CERT_CN}, O={CERT_ORG},L={..},ST={..},C={..}\")))
    driver-class-name: oracle.jdbc.OracleDriver
  jpa:
    database: oracle
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/alternative-db
