# Run your first BPMN process with Camunda 8 — Step 5: Understand how it works

The process uses no external code. All logic is expressed using [FEEL expressions](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) in script tasks and a [DMN decision table](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table).

| Task             | FEEL expression                                                                                                                        | Output variable  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Pre-flight check | `if fuelLevel >= 50 then "ALL SYSTEMS GO" else ...` (sets status to cancel)                                                            | `systemStatus`   |
| Cancel mission   | `"Mission " + missionName + " scrubbed — not enough fuel (" + string(fuelLevel) + "%)"`                                                | `missionResult`  |
| Plot destination | DMN table: `>= 90` → Venus, `>= 75` → Mars, `>= 50` → Moon                                                                             | `destination`    |
| Burn stage 1     | `fuelLevel - 25`                                                                                                                       | `fuelAfterBurn`  |
| Run experiments  | `if fuelLevel > 75 then 5 else 3`                                                                                                      | `experimentsRun` |
| Mission report   | `"Crew " + missionName + " reached " + destination + "! Fuel: " + string(fuelAfterBurn) + "%. Experiments: " + string(experimentsRun)` | `missionResult`  |

Fixed rules work when you know the decision in advance, as in this launch sequence. When a step needs judgment you can't express as a deterministic rule, you can hand that step to an [AI agent](https://docs.camunda.io/docs/next/reference/glossary#ai-agent) instead. The engine runs, retries, and records the agent step in the same way as the script tasks and DMN decision in this process.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-hello-world
