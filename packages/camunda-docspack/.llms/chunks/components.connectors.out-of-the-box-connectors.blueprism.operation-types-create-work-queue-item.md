# Blue Prism connector — Operation types — Create work queue item

This operation allows you to create work queue items in the specified queue.
It matches directly to respective Blue Prism API endpoint - [`Create work queue items`](https://documentation.blueprism.com/bp-7-5/en-us/bp-api/bpe-7-5-0-api-spec.html#tag/Work-Queues/operation/createWorkQueueItems).

#### Usage

1. Select **Create work queue item** from the **Operation** dropdown.
2. Populate the **Authentication section** as described in the [respective section](#authentication).
3. In the **Configuration** section, set **Blue Prism API base URL** field. E.g., `http://my.bp.host.com:9876`.
4. In the **Input** section, set **Work queue ID**. This is the identifier of a queue, where item will be fetched from.
5. In the **Input** section, set **Item type** of the data entry you wish to submit to the queue.
6. In the **Input** section, set **Item value** of the data entry you wish to submit to the queue.
7. In the **Input** section, set **Defer date**. This field is the earliest time and date that this item is deferred until.
8. In the **Input** section, set **Priority**. This field is the priority value assigned to the item.
9. In the **Input** section, set **Status**. This is the user-supplied status value. _Note: Do not confuse this with queue item 'state' property._

#### Create work queue item response

The operation **Create work queue item** returns information about the newly created item in the queue.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. It comes with a pre-filled value of `={itemId:response.body.ids[1]}`. To use operation _Get queue item result by ID_, you need an `itemId`. This expression will add it in the context for you. Learn more in [get queue item result by ID](#get-item-from-a-queue-by-id).

Response example:

```json
{
  "ids": ["497f6eca-6276-4993-bfeb-53cbbbba6f08"]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/blueprism
