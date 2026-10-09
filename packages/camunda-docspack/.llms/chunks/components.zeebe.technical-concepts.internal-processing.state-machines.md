# Internal processing — State machines

Zeebe manages stateful entities like jobs and processes. Internally, these entities are implemented as **state machines** managed by a stream processor.

An instance of a state machine is always in one of several logical states. From each state, a set of transitions defines the next possible states. Transitioning into a new state may produce outputs/side effects.

Let's look at the state machine for jobs:

![partition](assets/internal-processing-job.png)

Every oval is a state. Every arrow is a state transition. Note how each state transition is only applicable in a specific state. For example, it is not possible to complete a job when it is in state `CREATED`.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing
