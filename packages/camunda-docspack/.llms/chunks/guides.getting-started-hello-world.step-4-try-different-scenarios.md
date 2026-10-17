# Run your first BPMN process with Camunda 8 — Step 4: Try different scenarios

Start additional process instances in Modeler with different `fuelLevel` values.
Here’s what happens based on your `fuelLevel` input:

| `fuelLevel` | What happens                                                     |
| ----------- | ---------------------------------------------------------------- |
| `>= 90`     | Launch proceeds — destination set to **Venus** (5 experiments)   |
| `76 – 89`   | Launch proceeds — destination set to **Mars** (5 experiments)    |
| `75`        | Launch proceeds — destination set to **Mars** (3 experiments)    |
| `50 – 74`   | Launch proceeds — destination set to **Moon** (3 experiments)    |
| `< 50`      | **Mission canceled** — the process ends on the cancellation path |

**Tip**
Go to Operate to compare how each process instance takes a different path.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-hello-world
