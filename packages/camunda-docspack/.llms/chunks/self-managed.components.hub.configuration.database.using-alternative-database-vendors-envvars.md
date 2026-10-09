# Database — Using alternative database vendors — envVars

```sh
SPRING_DATASOURCE_URL="jdbc:h2:mem:[DB_NAME]" # See https://www.h2database.com/html/features.html
SPRING_DATASOURCE_USERNAME="[DB_USER]"
SPRING_DATASOURCE_PASSWORD="[DB_PASSWORD]"
SPRING_DATASOURCE_DRIVER_CLASS_NAME="[YOUR_CUSTOM_DRIVER]" # Optional
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
