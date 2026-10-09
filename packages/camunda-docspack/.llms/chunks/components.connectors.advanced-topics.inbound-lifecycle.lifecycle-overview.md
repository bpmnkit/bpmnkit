# Inbound connector lifecycle — Lifecycle overview

![Inbound connector lifecycle](../img/inbound-lifecycle.png)

The lifecycle of an executable starts when the connector runtime detects a change in the engine state and determines that it needs a new executable to reflect that change.

- `INVALID_DEFINITION` – The runtime detects an invalid deduplication configuration and stores the executable in this state. For details about supported configurations and common causes, see [Inbound connector deduplication](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication).

- `FAILED_TO_ACTIVATE` – The runtime attempts to activate the executable, but the activation fails. The executable remains inactive in this state.

- `ACTIVE` – The runtime successfully activates the executable. In this state, the executable is ready to receive and process external events from the third-party system.

- `CANCELED` – An active executable encounters an unrecoverable error and transitions to this state. This is rare, as most connectors include retry logic to handle transient failures such as temporary network issues.

When you deploy a new process version, the connector runtime checks whether it can deduplicate inbound connectors in the new version with any currently active executables. If deduplication is possible, the runtime updates the existing executable. If the executable is inactive (for example, in the `CANCELED` or `FAILED_TO_ACTIVATE` state), the runtime also attempts to restart it.

When the executable is no longer needed—for example, when its originating process version is no longer the latest and no active instances are waiting on message subscriptions—the runtime deactivates it.

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/inbound-lifecycle
