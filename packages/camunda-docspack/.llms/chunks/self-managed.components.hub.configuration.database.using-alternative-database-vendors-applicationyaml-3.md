# Database — Using alternative database vendors — applicationYaml

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://[DB_HOST]:[DB_PORT];databaseName=[DB_NAME]
    username: [DB_USER]
    password: [DB_PASSWORD]
    driver-class-name: [YOUR_CUSTOM_DRIVER] # Optional; omit to use default MSSQL driver
```

#### Case sensitivity

MSSQL is case-insensitive by default.  
To enable case sensitivity, set the database collation to a case-sensitive one such as `Latin1_General_CS_AS`.

Otherwise, you may encounter unexpected behavior.  
The only current restriction is that extraction fields in [IDP extraction](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction#extract-fields) will not be case-sensitive.  
This means that if you have a field named `amount`, you cannot create another field named `Amount`, because the database treats them as the same identifier.

#### Custom schema

MSSQL supports custom schemas, but this is not configurable within Camunda Hub.  
To use a custom schema, set the database user’s **default schema**.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
