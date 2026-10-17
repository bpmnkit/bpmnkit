# Run your first BPMN process with Camunda 8 — Step 3: Explore your process in Operate

1. Navigate to Operate at [http://localhost:8080/operate](http://localhost:8080/operate) and log in using the `demo` / `demo` credentials.
1. Find the **Rocket Launch** process and click your running instance.

**Note**
Data needs to sync to Operate, so your process instance may not be visible immediately.

### Watch the timer

Your process instance pauses at the **Countdown T-10** task for 10 seconds. Open the instance in Operate and watch the [token](https://docs.camunda.io/docs/next/reference/glossary#token-process-instance) — the marker showing the current point of execution — move through the countdown in real time.

### Inspect variables

Click a completed instance in Operate and open the **Variables** panel. You can see the variables the process created, such as `destination`, `fuelAfterBurn`, and `missionResult`.

Compare the variables between a successful launch and a canceled mission to see how the process logic sets different values.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-hello-world
