# Test your process — Test cases {#test-cases} — Repair a test case {#repair-a-test-case}

When a BPMN change removes or renames an element that an instruction or assertion refers to, the test case can break. It may fail unexpectedly or pass silently because Test mode skips the broken step.

![Broken test case badge and callout](../img/test-broken-test-case-callout.png)

- Test mode flags broken test cases with an indicator in the test case list. A callout in the test case detail view explains what's broken.

- Use the graphical repair view to fix most breakages without editing JSON: remap an instruction or assertion to a different element, select a new expected value, edit a step in place, or delete it.

![Repair view](../img/test-repair-view.png)

- For changes the graphical repair view doesn't cover, open the [test file](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files) in Camunda Hub's file editor and edit the JSON directly. Then, return to Test mode and rerun the test case.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
