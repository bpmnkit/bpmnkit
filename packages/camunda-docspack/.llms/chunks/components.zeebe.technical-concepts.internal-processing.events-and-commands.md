# Internal processing — Events and commands

Every state change in a state machine is called an **event**. Zeebe publishes every event as a record on the stream.

State changes can be requested by submitting a **command**. A Zeebe Broker receives commands from two sources:

- Clients send commands remotely. For example, deploying processes, starting process instances, creating and completing jobs, etc.
- The broker itself generates commands. For example, locking a job for exclusive processing by a worker.

Once received, a command is published as a record on the addressed stream.


## Stateful stream processing

A stream processor reads the record stream sequentially and interprets the commands with respect to the addressed entity's lifecycle. More specifically, a stream processor repeatedly performs the following steps:

1. Consume the next command from the stream.
2. Determine if the command is applicable based on the state lifecycle and the entity's current state.
3. If the command is applicable, apply it to the state machine. If the command was sent by a client, send a reply/response.
4. If the command is not applicable, reject it. If it was sent by a client, send an error reply/response.
5. Publish an event reporting the entity's new state.

For example, processing the **Create Job** command produces the event **Job Created**.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing
