# Database — Using alternative database vendors — applicationYaml

```yaml
spring:
  datasource:
    url: jdbc:mariadb://[DB_HOST]:[DB_PORT]/[DB_NAME]
    username: [DB_USER]
    password: [DB_PASSWORD]
    driver-class-name: [YOUR_CUSTOM_DRIVER] # Optional
```

#### Case sensitivity

MariaDB uses case-insensitive collations by default.  
To enable case sensitivity, set the database collation to a case-sensitive one such as `utf8mb4_bin`.

**Note**
If a case-insensitive collation is used, you may encounter unexpected behavior.  
For example, in [IDP extraction](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction#extract-fields),  
a field named `amount` and another named `Amount` would be treated as identical because the database does not distinguish between them.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
