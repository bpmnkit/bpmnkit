# Migrate to the Orchestration Cluster API — Configuration

The Orchestration Cluster API client uses the `ZEEBE_REST_ADDRESS` configuration value to connect to the server.


## Refactor API calls

The Orchestration Cluster API has command and query operations. All operations searching data using the v1 component APIs can be refactored to use the equivalent Orchestration Cluster API method.

Some method signatures have changed, mostly in the names of fields. Your IDE intellisense will guide you in refactoring to the new signatures.


## Data access and consistency

Search and get operations require a second parameter to manage eventual consistency.

**Info**
See the examples in the [TypeScript SDK guide](https://docs.camunda.io/docs/next/apis-tools/typescript/camunda8-sdk) and the [manage Orchestration Cluster API data consistency](https://docs.camunda.io/docs/next/apis-tools/typescript/eventual-consistency) overview.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/migrating-to-oca
