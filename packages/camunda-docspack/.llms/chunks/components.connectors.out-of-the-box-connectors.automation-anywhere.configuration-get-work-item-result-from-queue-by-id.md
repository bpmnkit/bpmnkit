# Automation Anywhere connector — Configuration — Get work item result from queue by ID

This operation provides the ability to return the details of the specified work item from the work queue.
It corresponds directly to the respective Automation Anywhere API - [`List Work Items in queue with filter by work item ID`](https://docs.automationanywhere.com/bundle/enterprise-v11.3/page/enterprise/topics/control-room/control-room-api/get-all-work-items-in-queues-api.html).

#### Usage

1. Select **Get work item result from queue by ID** from the **Operation type** dropdown in the **Operation** section.
2. Populate **Authentication section** as described in the [respective section](#authentication).
3. In the **Configuration** section, set the **Control Room URL** field as described in the [respective section](#control-room-url).
4. In the **Input** section, set **Work queue ID**. This is the identifier of a queue, where an item will be fetched from.
5. In the **Input** section, set **Work item ID**. This is the identifier of the item to be fetched.

#### Get work item result from queue by ID response

Given you have a queue work item ID previously added to a queue, the operation **Get work item result from queue by ID** returns information about a certain work item.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. It comes with a pre-filled value of `={itemState:response.body.list[1].status}`. You will observe the `itemState` in the process variables. Its value will let you know if the item was processed or not.

Response example:

```json
{
  "page": {
    "offset": 0,
    "total": 5,
    "totalFilter": 1
  },
  "list": [
    {
      "id": "11804",
      "createdBy": "24",
      "createdOn": "2020-05-26T10:19:34.786711300Z",
      "updatedBy": "24",
      "updatedOn": "2020-05-26T10:19:34.786711300Z",
      "version": "1",
      "json": {},
      "result": "",
      "deviceId": "0",
      "status": "NEW",
      "col1": "Brian",
      "col2": "Matthews",
      "col3": "bmatthews0@example.com",
      "deviceUserId": "0",
      "queueId": "20",
      "comment": "",
      "automationId": "0",
      "totalPausedTime": "0",
      "error": "",
      "col6": "",
      "col10": ""
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/automation-anywhere
