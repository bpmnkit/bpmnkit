# Modify a process instance — Unsupported modifications

Some elements do not support specific modifications:

- **Add token**/**Move tokens to** modifications are not possible for the following type of elements:
  - Start events
  - Boundary events
  - Events attached to event-based gateways
- **Move tokens from** modification is not possible for a subprocess itself.
- **Add token** modifications are not currently supported for elements with multiple running scopes.

**Note: Multi-instance subprocesses**
While **Add token** modifications are not supported for elements inside multi-instance subprocesses, **Move** modifications are supported. When you move an element instance within a multi-instance subprocess, the operation terminates only that specific element instance and activates the target element in the same instance of the multi-instance subprocess.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/process-instance-modification
