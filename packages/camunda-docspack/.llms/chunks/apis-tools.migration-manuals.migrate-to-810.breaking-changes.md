# Camunda 8.10 APIs & Tools migration guide — Breaking changes

Review actions required for the following breaking changes:

### Search filters: `UserTaskFilter` process filters converted into advanced search filters {#usertask-process-filter}

#### Change

The search filter criteria for `processDefinitionKey`, `processInstanceKey`, and `bpmnProcessId` in `UserTaskFilter` have been converted into advanced search filters.

#### Why

As a result of the V1 API removal, advanced process filtering for user tasks was no longer supported. These changes let you use advanced process filters with the V2 User Tasks API again.

#### Impact

This affects the Java client because `io.camunda.client.api.search.filter.UserTaskFilter` now accepts advanced filters for `processDefinitionKey`, `processInstanceKey`, and `bpmnProcessId`.

#### Action

Update to the latest SDK version. The new SDK version includes advanced filters for `processDefinitionKey`, `processInstanceKey`, and `bpmnProcessId` in `UserTaskFilter`.

Regenerate your client.

No change is needed if your code already uses the exact-match filters for `processDefinitionKey`, `processInstanceKey`, and `bpmnProcessId` in `UserTaskFilter`.

### `POST /v2/message-subscriptions/search` returns start event subscriptions {#message-subscription-type}

#### Change

The `POST /v2/message-subscriptions/search` endpoint now returns both start event and intermediate event message subscriptions. Previously, only intermediate event subscriptions were returned.

#### Why

This change provides complete visibility into all active message subscriptions for a process, including start event subscriptions that were previously excluded.

#### New field

Each result includes a new `messageSubscriptionType` enum field:

| Value           | Description                                       |
| :-------------- | :------------------------------------------------ |
| `START_EVENT`   | A start event message subscription.               |
| `PROCESS_EVENT` | An intermediate catch event message subscription. |

In existing legacy data, this field is `NULL`.

#### Impact

Integrations that consume results from `POST /v2/message-subscriptions/search` will now receive start event subscriptions in addition to intermediate event subscriptions. Code that assumes only intermediate events may produce unexpected behavior.

#### Action

Update to the latest SDK version. If your code relies on the endpoint returning only intermediate event subscriptions, add a filter to exclude start events when constructing your search query.

Regenerate your client from the 8.10 OpenAPI specification to include the new `messageSubscriptionType` field. If your code expects only intermediate event subscriptions, add the filter shown in the **Custom integrations** tab to your request payload.

If your code relies on the endpoint returning only intermediate event subscriptions, add the following filter to restore the previous behavior:

```json title="Before (no filter needed — endpoint returned only intermediate events)"
{
  "filter": {}
}
```

```json title="After (filter required to exclude start events)"
{
  "filter": {
    "messageSubscriptionType": { "$neq": "START_EVENT" }
  }
}
```

This filter works correctly for both new data and legacy data (which has `NULL` in the `messageSubscriptionType` field).

### Administration API (Self-Managed) migrated

The Administration API endpoints for Self-Managed have been migrated to the now-deprecated [Web Modeler API v1](https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/index):

| Admin API (Self-Managed)       | Web Modeler API v1                   |
| :----------------------------- | :----------------------------------- |
| `GET /admin-api/usage-metrics` | `GET /api/v1/clusters/usage-metrics` |
| `GET /admin-api/clusters`      | `GET /api/v1/clusters`               |

For both endpoints, you need a [token with read permissions](https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/authentication#generate-a-token).

These endpoints return the same data as the original Administration APIs, but the response format matches the other Web Modeler APIs.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-810
