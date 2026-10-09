# Configure secondary storage in Camunda 8 Run — Default: H2 (Camunda 8 Run)

The default Camunda 8 Run configuration uses an H2 database for secondary storage. This is convenient for local development and demos and stores data on disk.

File-based H2 example:

```yaml
data:
  secondary-storage:
    type: rdbms
    rdbms:
      url: jdbc:h2:file:./camunda-data/h2db
      username: sa
      password:
```

Full example configuration

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:h2:file:./camunda-data/h2db
        username: sa
        password:
        flushInterval: PT0.5S
        queueSize: 1000
  security:
    initialization:
      users:
        - username: demo
          password: demo
          name: Demo
          email: demo@example.com
    authentication:
      method: BASIC
      unprotected-api: true
    authorizations:
      enabled: false

zeebe:
  broker:
    network:
      host: localhost
      advertisedHost: localhost
  gateway:
    cluster:
      initialContactPoints: zeebe:26502
      memberId: identity

spring:
  profiles:
    active: "broker,consolidated-auth,identity,tasklist"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage
