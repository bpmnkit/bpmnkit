# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres.example.com:5432/hub-db
    username: hub-user
    password: "***"
    # driver-class-name: software.amazon.jdbc.Driver  # optional
    hikari:
      schema: custom_schema # optional; only supported for PostgreSQL
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
