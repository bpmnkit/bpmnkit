# Camunda 8.10 APIs & Tools migration guide — Behavioral changes

### Element instance search: advanced filters on `elementId` / `elementName` and `$or` support {#element-instance-advanced-or}

#### Change

The element instance search endpoint (`POST /v2/element-instances/search`) gained two filtering capabilities:

- The `elementId` and `elementName` filter fields now accept [advanced search filter objects](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-data-fetching#advanced-search-filters) in addition to plain string equality. Supported operators: `$eq`, `$neq`, `$exists`, `$in`, `$notIn`, `$like` (wildcard pattern with `*` and `?`).
- The request body's `filter` object now accepts a top-level `$or` property that takes an array of alternative filter groups combined with OR logic. Top-level filter fields and `$or` are combined with AND logic.

#### Why

These additions let you express the queries the user interface (UI) needs (for example, "match any element whose name or ID contains a substring") in a single request, avoiding multiple round trips and client-side merging.

#### Impact

The change is additive and backward compatible — existing exact-match requests continue to work unchanged. New requests can now use advanced operators and `$or` to express richer queries:

```json
{
  "filter": {
    "processInstanceKey": "2251799813685323",
    "$or": [
      { "elementName": { "$like": "*Order*" } },
      { "elementId": { "$like": "*Order*" } }
    ]
  }
}
```

The example matches element instances where `processInstanceKey` equals the given value AND either `elementName` or `elementId` contains the substring `Order`.

**Note**
Complex `$or` conditions may impact performance in high-volume environments; use them with care.

The `elementName` filter only matches instances created in 8.8 or later, since earlier runtimes did not persist this field on element instances.

#### Action

Update to the latest SDK version. The new SDK exposes advanced filters for `elementId` and `elementName`, and the `$or` filter on `ElementInstanceFilter`.

Regenerate your client from the 8.10 OpenAPI specification to pick up the advanced filter and `$or` types on `ElementInstanceFilter`.

No change is needed for existing requests. To use the new operators, send advanced filter objects on `elementId` / `elementName`, or a top-level `$or` array, as shown above.

### Resource API now uses eventual consistency {#resource-eventual-consistency}

The [Get resource] and [Get resource content] APIs now retrieve from secondary storage, resulting in eventual consistency. After a resource is deployed, there may be a brief delay before it becomes retrievable via these endpoints.

If your application assumes immediate resource retrieval after deployment, add retry logic or a short delay before querying resources.

### Deleting a process definition with running instances defers history deletion {#delete-draining}

The [delete resource](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/delete-resource.api) endpoint now accepts process definition deletion when the definition still has running instances. Instead of rejecting the request or waiting for physical removal, the definition [drains](https://docs.camunda.io/docs/next/components/concepts/resource-deletion#draining): new instances are blocked immediately, running instances continue to completion, and the definition is removed automatically afterwards.

As a result, when `deleteHistory` is `true`, the `batchOperation` field in the response is `null` for such a definition. Its history is removed as part of the draining lifecycle rather than through an immediately-returned batch operation. The field is still populated for decision requirements definitions and for process definitions that are already fully deleted from the runtime state.

If you read `batchOperation` from the delete response to track history deletion, handle a `null` value: the definition is draining. Track progress through the process definition `state` (`DRAINING`) or the `zeebe_process_definitions_draining_count` metric instead.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-810
