# Job Workers — Using the Client in a Job Handler

Because `ConnectedJobContext` and `SyncJobContext` include a `client` reference, your handler can make API calls during job execution — for example, publishing a message to trigger another part of the process.

**Async handlers** (`execution_strategy="async"`) — `await` the client method directly:

<!-- snippet-source: examples/readme.py | regions: ReadmeAsyncHandler -->

```python
from camunda_orchestration_sdk import ConnectedJobContext, MessagePublicationRequest, MessagePublicationRequestVariables

async def handle_order(job: ConnectedJobContext) -> dict[str, object]:
    variables = job.variables.to_dict()
    order_id = variables["orderId"]

    await job.client.publish_message(
        data=MessagePublicationRequest(
            name="order-processed",
            correlation_key=order_id,
            time_to_live=60000,
            variables=MessagePublicationRequestVariables.from_dict({"orderId": order_id, "status": "completed"}),
        )
    )

    job.log.info(f"Published order-processed message for order {order_id}")
    return {"status": "done"}
```

**Sync (thread) handlers** (`execution_strategy="thread"`) — `job.client` is a sync `CamundaClient`, so call methods directly:

<!-- snippet-source: examples/readme.py | regions: ReadmeSyncHandler -->

```python
from camunda_orchestration_sdk import MessagePublicationRequest, MessagePublicationRequestVariables, SyncJobContext

def handle_order(job: SyncJobContext) -> dict[str, object]:
    variables = job.variables.to_dict()
    order_id = variables["orderId"]

    job.client.publish_message(
        data=MessagePublicationRequest(
            name="order-processed",
            correlation_key=order_id,
            time_to_live=60000,
            variables=MessagePublicationRequestVariables.from_dict({"orderId": order_id, "status": "completed"}),
        )
    )

    job.log.info(f"Published order-processed message for order {order_id}")
    return {"status": "done"}
```

> **Note:** The SDK automatically provides the right client type for each strategy — async handlers get `CamundaAsyncClient` (use `await`), thread handlers get `CamundaClient` (call directly). You don't need to create or manage these clients yourself.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/job-workers
