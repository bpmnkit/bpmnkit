# How to use connectors — Activation

The **Activation** section pertains specifically to [inbound connectors](https://docs.camunda.io/docs/next/components/connectors/connector-types).

### Activation condition

The **Activation condition** field evaluates conditions against the incoming message payload. It enables filtering of payloads that can initiate a process. If left empty, all valid incoming messages will trigger a new process—except those that fail pre-validation checks, such as HMAC signature verification for specific connectors.


## Correlation

### Correlation key (process)

The **Correlation key (process)** field specifies which variable from the connector output should serve as the process correlation key.  
Learn more about [message correlation](https://docs.camunda.io/docs/next/components/concepts/messages#message-correlation-overview).

### Correlation key (payload)

The **Correlation key (payload)** field tells the connector how to extract the correlation value from the incoming message payload.

### Message ID expression

The **Message ID expression** field defines how to extract a unique identifier from the incoming message payload.  
Messages that share the same identifier within the defined time-to-live (TTL) will be correlated only once.  
Leaving this field empty may cause identical messages to be submitted and processed multiple times.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
