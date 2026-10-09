# Database — Using alternative database vendors — envVars

```sh
SPRING_DATASOURCE_URL="jdbc:oracle:thin:@//[DB_HOST]:[DB_PORT]/[DB_NAME]"
SPRING_DATASOURCE_USERNAME="[DB_USER]"
SPRING_DATASOURCE_PASSWORD="[DB_PASSWORD]"
SPRING_DATASOURCE_DRIVER_CLASS_NAME="[YOUR_CUSTOM_DRIVER]" # Optional; omit to use default Oracle driver
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
