# Database — Using alternative database vendors — applicationYaml

```yaml
spring:
  datasource:
    url: jdbc:mysql://[DB_HOST]:[DB_PORT]/[DB_NAME]
    username: [DB_USER]
    password: [DB_PASSWORD]
    driver-class-name: [YOUR_CUSTOM_DRIVER] # Optional; omit to use default MySQL driver
```

#### Case sensitivity

MySQL usually uses **case-insensitive** collations by default.  
To enable case sensitivity, set the database collation to a case-sensitive one such as `utf8mb4_0900_as_cs`.

Otherwise, you may encounter unexpected behavior.  
The only current restriction is that extraction fields in [IDP extraction](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction#extract-fields) will not be case-sensitive.  
This means that if you have a field named `amount`, you cannot create another field named `Amount`, because the database treats them as the same identifier.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
