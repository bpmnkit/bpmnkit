# HTTP Webhook connector — Make your HTTP Webhook connector executable — Response mode

**Response mode** controls whether the webhook waits for the correlation to complete (synchronous) or returns immediately (asynchronous).

Use synchronous mode only when the caller requires the process result:

- **Start event**: Creates a new process instance and returns its result.
- **Message start event** (and other message-based events): Correlates the message and returns the matched process instance key.

In asynchronous mode:

- **Start event**: Returns the process instance key of the newly created process.
- **Message-based events**: Publishes the message and returns the message key.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
