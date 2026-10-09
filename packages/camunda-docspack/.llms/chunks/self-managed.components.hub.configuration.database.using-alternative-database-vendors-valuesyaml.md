# Database — Using alternative database vendors — valuesYaml

```yaml
camundaHub:
  restapi:
    externalDatabase:
      url: "jdbc:h2:mem:[DB_NAME]"
      username: "[DB_USER]"
      secret:
        inlineSecret: "[DB_PASSWORD]"
    env:
      - name: SPRING_DATASOURCE_DRIVER_CLASS_NAME
        value: "[YOUR_CUSTOM_DRIVER]"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
