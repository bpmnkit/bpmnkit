# Run your first BPMN process with Camunda 8

Run your first fully-automated BPMN process locally with Camunda 8.

Beginner

Run your first fully-automated BPMN process locally with Camunda 8.


## About

In this guide, you’ll deploy and run a **Rocket Launch** BPMN process where you play mission control: you provide a `fuelLevel` variable, and the Camunda 8 engine runs the launch sequence end-to-end:

1. Start the launch sequence.
2. Run a pre-flight check.
3. Decide whether systems are **GO** or **NO-GO**.
4. If **GO**: plot the destination via a DMN decision.
5. Generate a mission report and complete the mission.
6. If **NO-GO**: cancel the mission and end the process.

After completing this guide, you will have a BPMN process running locally in Camunda 8 and understand how basic concepts, such as variables, DMN, and FEEL expressions, work together in an automated BPMN workflow.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-hello-world
