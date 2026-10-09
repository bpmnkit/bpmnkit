# Configuration examples

Configuration examples for the Data Migrator.

Configuration examples for the Data Migrator's `configuration/application.yml`.


## Camunda 8 Client

```yaml
camunda.client:
  mode: self-managed # Operation mode: 'self-managed' or 'cloud'
  grpc-address: http://localhost:26500 # The gRPC API endpoint
  rest-address: http://localhost:8080 # The REST API endpoint
```


## Data Migrator

```yaml
camunda.migrator:
  page-size: 500 # Number of records to process in each page
  job-type: migrator # Job type for actual job activation (used for validation and activation unless validation-job-type is defined)
  # validation-job-type: '=if legacyId != null then "migrator" else "noop"' # Optional: job type for validation (falls back to job-type if not defined)
  auto-ddl: true # Automatically create/update database schema
  table-prefix: MY_PREFIX_ # Optional table prefix for migrator schema
  interceptors:
    - class-name: com.example.MyCustomInterceptor # Custom interceptor class
    - class-name: com.example.AnotherInterceptor # Another custom interceptor class
  history:
    partition-count: 3 # Optional: Number of partitions when skipping Camunda 8 REST/topology connectivity (Camunda 8 database access is still required)
    auto-cancel:
      cleanup:
        enabled: true # Populate cleanup dates for auto-canceled entities
        ttl: P6M # Time-to-live for auto-canceled history (6 months)
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-examples
