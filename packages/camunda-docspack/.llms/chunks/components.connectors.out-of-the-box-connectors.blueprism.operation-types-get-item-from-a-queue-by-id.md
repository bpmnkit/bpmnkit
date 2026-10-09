# Blue Prism connector — Operation types — Get item from a queue by ID

This operation allows you to return details of a specified item from a work queue.
It matches directly to respective Blue Prism API endpoint - [`Return details of a specified item from a work queue`](https://documentation.blueprism.com/bp-7-5/en-us/bp-api/bpe-7-5-0-api-spec.html#tag/Work-Queues/operation/getWorkQueueItemFromWorkQueue).

#### Usage

1. Select **Get item from a queue by ID** from the **Operation** dropdown.
2. Populate **Authentication section** as described in the [respective section](#authentication).
3. In the **Configuration** section, set **Blue Prism API base URL** field. E.g., `http://my.bp.host.com:9876`.
4. In the **Input** section, set **Work queue ID**. This is the identifier of a queue, where the item is fetched from.
5. In the **Input** section, set **Queue item ID**. This is the identifier of the item to be fetched.

#### Get item from a queue by ID response

Given you have a queue item ID previously added to a queue, the operation **Get item from a queue by ID response** returns information about a certain item.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. It comes with a pre-filled value of `={itemState:response.body.state}`. You will observe the `itemState` in the process variables. Its value will let you know if the item was processed or not.

Response example:

```json
{
  "id": "01234567-89ab-cdef-0123-456789abcdef",
  "priority": 3,
  "ident": 123,
  "state": "Completed",
  "keyValue": "Example value",
  "status": "Example status",
  "tags": ["Example tag 1", "Example tag 2"],
  "attemptNumber": 1,
  "loadedDate": "2020-10-02T12:34:56+01:00",
  "deferredDate": "2020-10-02T12:34:56+01:00",
  "lockedDate": "0001-01-01T00:00:00Z",
  "completedDate": "2020-10-02T13:00:00+01:00",
  "exceptionedDate": "0001-01-01T00:00:00Z",
  "exceptionReason": "Example reason",
  "lastUpdated": "2020-10-02T13:00:00+01:00",
  "workTimeInSeconds": 123,
  "attemptWorkTimeInSeconds": 123,
  "resource": "Example resource",
  "data": {
    "rows": []
  },
  "sla": 7200,
  "sladatetime": "0001-01-01T00:00:00Z",
  "processname": "Example process name",
  "issuggested": false
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/blueprism
