# Configuration property reference

Data Migrator property reference.

Reference for all Data Migrator configuration properties, set in the `configuration/application.yml` file.


## `camunda.client`

Prefix: `camunda.client`

**Info**
Read more about Camunda Client [configuration options](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration).

| Property        | Type     | Description                                                                                        |
| :-------------- | :------- | :------------------------------------------------------------------------------------------------- |
| `.mode`         | `string` | Operation mode of the Camunda 8 client. Options: `self-managed` or `saas`. Default: `self-managed` |
| `.grpc-address` | `string` | The gRPC API endpoint for Camunda 8 Platform. Default: `http://localhost:26500`                    |
| `.rest-address` | `string` | The REST API endpoint for Camunda 8 Platform. Default: `http://localhost:8080`                     |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties
