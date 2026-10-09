# Use an alternative database for Management Identity — MSSQL database configuration

### Driver provision

As the driver for MSSQL is provided by default in identity, you do not need to download it or supply it in the classpath.

### envVars

```sh
SPRING_DATASOURCE_URL="jdbc:sqlserver://${IDENTITY_DATABASE_HOST:}:${IDENTITY_DATABASE_PORT:};databaseName=${IDENTITY_DATABASE_NAME:};encrypt=true;hostNameInCertificate={CACERT_/CN};trustServerCertificate=false"
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.microsoft.sqlserver.jdbc.SQLServerDriver
SPRING_JPA_DATABASE=sql_server
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
      value: "jdbc:sqlserver://${IDENTITY_DATABASE_HOST:}:${IDENTITY_DATABASE_PORT:};databaseName=${IDENTITY_DATABASE_NAME:};encrypt=true;hostNameInCertificate={CACERT_/CN};trustServerCertificate=false"
    - name: SPRING_DATASOURCE_DRIVER_CLASS_NAME
      value: com.microsoft.sqlserver.jdbc.SQLServerDriver
    - name: SPRING_JPA_DATABASE
      value: sql_server
    - name: JAVA_TOOL_OPTIONS
      value: $JAVA_OPTS
  # Extra volumes are mounted for any TLS certs necessary for the database:
  extraVolumeMounts:
    - name: "keystore-secret"
      secret:
        secretName: "keystore-secret"
  extraVolumes:
    - name: "keystore-secret"
      mountPath: "/usr/local/certificates"
```

### applicationYaml

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://${IDENTITY_DATABASE_HOST:}:${IDENTITY_DATABASE_PORT:};databaseName=${IDENTITY_DATABASE_NAME:};encrypt=true;hostNameInCertificate={CACERT_/CN};trustServerCertificate=false
    username: user
    password: AStrongPassword
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
  jpa:
    database: sql_server
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/alternative-db
