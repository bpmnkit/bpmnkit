# Automation Anywhere connector — Configuration — Add work item to the queue

This operation provides the ability to add a work queue item in the specified queue.
It corresponds directly to the respective Automation Anywhere API - [`Add Work Items to the queue API`](https://docs.automationanywhere.com/bundle/enterprise-v11.3/page/enterprise/topics/control-room/control-room-api/add-work-item-data-to-queue-api.html).

#### Usage

1. Select **Add work item to the queue** from the **Operation type** dropdown in the **Operation** section.
2. Populate **Authentication section** as described in the [respective section](#authentication).
3. In the **Configuration** section, set the **Control Room URL** field as described in the [respective section](#control-room-url).
4. In the **Input** section, set **Work queue ID**. This is the identifier of a queue, where an item will be fetched from.
5. In the **Input** section, set **Work Item json Data** that you want to pass together with the item. The **Data** has to comply with the Automation Anywhere API, and must contain the following semantics:

```json
{
  "coll_name": "your value",
  "last_name": "Doe",
  "email": "jane.doe@example.com"
}
```

#### Add work item to the queue response

The operation **Add work item to the queue** returns information about the newly created item in the queue.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. It comes with a pre-filled value of `={itemId:response.body.list[1].id}`. To use operation _Get work item result from queue by ID_, you need an `itemId`. This expression will add it to the context for you. Learn more in [get work item result from queue by ID](#get-work-item-result-from-queue-by-id).

Response example:

```json
{
  "list": [
    {
      "id": "40957",
      "createdBy": "25",
      "createdOn": "2021-11-24T01:53:10.175335900Z",
      "updatedBy": "25",
      "updatedOn": "2021-11-24T01:53:10.175335900Z",
      "version": "0",
      "json": {
        "TRN_ID": "A11",
        "DATA": "mydata"
      },
      "result": "",
      "deviceId": "0",
      "status": "NEW",
      "col1": "A11",
      "col2": "",
      "deviceUserId": "0",
      "queueId": "0",
      "comment": "",
      "automationId": "0",
      "totalPausedTime": "0",
      "error": "",
      "col6": "",
      "jobExecutionId": ""
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/automation-anywhere
