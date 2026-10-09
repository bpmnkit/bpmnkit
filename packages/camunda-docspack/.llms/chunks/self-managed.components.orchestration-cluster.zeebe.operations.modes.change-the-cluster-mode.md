# Cluster mode — Change the cluster mode

Send a `PATCH` request to the `/mode` endpoint of the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/change-cluster-mode.api). The endpoint uses the Orchestration Cluster REST API port, which is `8080` by default.

### Required authorizations

When authorization is enabled, changing the cluster mode requires one of the following permissions:

| Resource type | Permission |
| ------------- | ---------- |
| `SYSTEM`      | `UPDATE`   |
| `BACKUP`      | `RESTORE`  |

For how permissions are granted to users, clients, groups, and roles, see [available resources](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#available-resources).

### Send the mode change request

To enter recovery mode:

```bash
curl -X PATCH 'http://localhost:8080/v2/mode?mode=RECOVERING' \
  -H 'Accept: application/json'
```

To return to processing mode:

```bash
curl -X PATCH 'http://localhost:8080/v2/mode?mode=PROCESSING' \
  -H 'Accept: application/json'
```

### Request parameters

| Parameter | Required | Description                                                                                                       |
| --------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `mode`    | Yes      | The target mode, either `RECOVERING` or `PROCESSING`.                                                             |
| `dryRun`  | No       | If `true`, validates the request and returns the resulting plan without applying the change. Defaults to `false`. |

### Response

A successful request returns `200` with the ID of the triggered cluster change and the ordered list of operations that will be applied.

Use `dryRun=true` to review the change plan before applying it:

```bash
curl -X PATCH 'http://localhost:8080/v2/mode?mode=RECOVERING&dryRun=true' \
  -H 'Accept: application/json'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/modes
