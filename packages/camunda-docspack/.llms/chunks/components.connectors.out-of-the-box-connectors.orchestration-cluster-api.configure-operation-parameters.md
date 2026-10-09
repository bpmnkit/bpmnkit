# Camunda Orchestration Cluster API connector — Configure operation parameters

For **Get by key**, you must provide a single input, **Key / ID**: the numeric key (for example `processInstanceKey`, `incidentKey`, `userTaskKey`) or string identifier (for example `groupId`, `roleId`, `tenantId`) of the entity you want to retrieve.

For **Search**, the following search parameters can be configured:

- **Filter**: A FEEL context with per-entity filter fields. For example, the following filter returns active process instances for the `order-process` process definition:

  `{state: "ACTIVE", processDefinitionId: "order-process"}`

  Filters also support advanced operators (`$eq`, `$neq`, `$gt`, `$gte`, `$lt`, `$lte`, `$like`, `$in`, `$notIn`, `$exists`, `$or`). See [advanced search filters](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-data-fetching#advanced-search-filters) for details.

- **Sort**: A list of sort objects. For example, the following sorts results by start date in ascending order:

  `[{field: "startDate", order: "ASC"}]`

- **Limit**: The maximum number of results to return per page. Defaults to `100`; the maximum is `10000`. Leave empty to use the server default.
- **Page after (forward cursor)**: Pass the `page.endCursor` value from the previous response to fetch the next page.
- **Page before (backward cursor)**: Pass the `page.startCursor` value from the previous response to fetch the previous page.
- **Page from (offset)**: Zero-based index of the first result, for offset-based pagination.

**Page after**, **Page before**, and **Page from** are mutually exclusive. See [pagination](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-data-fetching#page) for more details.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/orchestration-cluster-api
