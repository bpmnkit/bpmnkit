# Database — Using alternative database vendors — applicationYaml

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@//[DB_HOST]:[DB_PORT]/[DB_NAME]
    username: [DB_USER]
    password: [DB_PASSWORD]
    driver-class-name: [YOUR_CUSTOM_DRIVER] # Optional; omit to use default Oracle driver
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
