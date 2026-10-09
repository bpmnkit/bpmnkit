# External variable ingestion — Configuration

Refer to
the [configuration section](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration) to learn more
about how to set up external variable ingestion.


## Method & HTTP target resource

POST `/api/ingestion/variable`


## Request headers

The following request headers have to be provided with every variable ingestion request:

| Header        | Constraints | Value                                                   |
| ------------- | ----------- | ------------------------------------------------------- |
| Authorization | REQUIRED    | See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication). |
| Content-Type  | REQUIRED    | `application/json`                                      |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/external-variable-ingestion
