# Connect an external agent — Step 5: Report the conversation history (2)

Whenever you send `history`, also send the `jobKey` and `jobLeaseToken` from the job activation. Camunda records each item with a `PENDING` commit status and promotes it to `COMMITTED` when the job completes successfully. If the job fails and a later activation supersedes the lease, the items are marked `DISCARDED` instead.

**Note: Usage metrics can be lost**
Camunda can only record usage metrics when your runtime reports them. If your runtime fails after interacting with the LLM but before it reports the usage, for example, if it crashes or loses connectivity, those metrics are lost, even though the LLM provider already processed and billed for the call.

For the authoritative token counts and costs, always refer to your LLM provider's own usage reporting rather than relying solely on Camunda's metrics.

You can still report those metrics under the new activation’s lease if you reconnect before the job is completed.

The response echoes one entry per submitted item, in request order, with the `historyItemKey` Camunda assigned and an `isDuplicate` flag showing whether the item had already been recorded.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent
