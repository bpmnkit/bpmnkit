# Test your process — Test cases {#test-cases} — Limitations {#test-cases-limitations}

Test mode displays a warning badge on diagram elements with known limitations. Use the **Show problems**/**Hide problems** toggle near the canvas controls to show or hide these badges.

![Warning badges on diagram elements](../img/test-warning-badges.png)

- Call activities are not supported. Test cases containing call activities cannot be executed successfully.
- Ad-hoc sub-processes are not supported. Test cases containing ad-hoc sub-processes cannot be executed successfully.
- Timer events can't be manually triggered. When a test case reaches a timer event, execution pauses until the timer fires automatically. To skip a timer, use [process instance modification](#modify-a-process-instance) to move the token to the next element.
- Test case paths that include process modifications are not supported.
- Similarly to process instances, test cases do not run in isolation. For example, if two test case paths are defined for a process and both contain the same message event or signal event, running these test cases simultaneously might lead to unintended consequences. Publishing a message or broadcasting a signal could inadvertently impact the other test case, resulting in the failure of both.
- Test mode test cases are compatible with the [CPT JSON instruction format](https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases), but the following [instructions](https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases#reference-instructions) are not supported and will be skipped during execution:
  - `ASSERT_PROCESS_INSTANCE_MESSAGE_SUBSCRIPTION`
  - `COMPLETE_JOB_USER_TASK_LISTENER`
  - `CORRELATE_MESSAGE`
  - `EVALUATE_CONDITIONAL_START_EVENT`
  - `EVALUATE_DECISION`
  - `INCREASE_TIME`
  - `MOCK_CHILD_PROCESS`
  - `MOCK_DMN_DECISION`
  - `MOCK_JOB_WORKER_COMPLETE_JOB`
  - `MOCK_JOB_WORKER_THROW_BPMN_ERROR`
  - `SET_TIME`

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
