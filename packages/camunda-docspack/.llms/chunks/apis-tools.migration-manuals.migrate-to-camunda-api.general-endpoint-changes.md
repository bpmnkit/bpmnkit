# Migrate to the Orchestration Cluster API — General endpoint changes

- The new API can be found at `<cluster>/v2/…>` instead of `<cluster>/v1/…>`.
- All endpoints are no longer separated by component concerns and all endpoints receive similar support. For example, process definitions, user tasks, and user authorizations were previously spread across separate Tasklist, Operate, and Identity APIs.
- All endpoints support the [authorization-based access control model](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations). Component endpoints only support the configuration of full (wildcard) access or no access.
- Naming, response codes, and type handling have been streamlined for all endpoints to provide a consistent UX.
- Endpoints with similar concerns (variable search, for example) have been consolidated into single endpoints.
- The request and response payload of every new endpoint might contain new attributes that are not necessarily needed for a migration from a V1 endpoint to V2 but might still be useful. Please consult the V2 API guides for access to all new attributes.

- Unified search request structure.
  - Attributes `filter`, `page`, and `sort` on root level.
  - Endpoint-specific filter attributes in the filter object, not at the root level.
  - Pagination information in the `page` object. For example, the attributes `from`, `limit`, `before`, and `after`.
  - Sorting configuration in sort object array, each object containing the field name and order (descending or ascending).

- Unified search response structure.
  - Attributes `items` and `page` on root level.
  - List of endpoint-specific response items in `items` attribute.
  - Page information in `page` attribute, for example the attributes `totalItems`, `startCursor`, and `endCursor` to use in `before` and `after` in follow-up requests.

<!--- TBD since currently in progress: Filter attributes can use Advanced Search capabilities depending on their type. TBD: We need to see how much of this we manage to implement with 8.7 (which endpoints, which attributes, which types). --->

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
