# Database — Using alternative database vendors — applicationYaml

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:[DB_NAME]
    username: [DB_USER]
    password: [DB_PASSWORD]
    driver-class-name: [YOUR_CUSTOM_DRIVER] # Optional
```

H2 is intended for local development or testing only, not for production environments.

#### Custom schema

By default, H2 uses the `PUBLIC` schema.  
To use a custom schema, add an initialization command to the JDBC URL:

```yaml
jdbc:h2:mem:[DB_NAME];INIT=CREATE SCHEMA IF NOT EXISTS [CUSTOM_SCHEMA]\;SET SCHEMA [CUSTOM_SCHEMA]
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
