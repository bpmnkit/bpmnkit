# Test your process — Test cases {#test-cases} — Add assertions {#assertions}

A test case that only executes its instructions can still pass even if it produces incorrect output or follows the wrong path. Use assertions to verify what actually happened, not just whether the test case finished.

![Assertion editor](../img/test-assertion-editor.png)

#### Variable assertions

Check that a process or local variable has an expected value.

1. Click **Add assertion** > **Variable**.
2. Select a variable name from the dropdown list, populated from the variables observed in the most recent test run.
3. Enter the expected value for that variable.

#### Element assertions

Check that a specific element reached an expected state.

1. Click **Add assertion** > **Element**.
2. Select the element on the canvas, or search for it by name in the list.
3. Choose the expected state from the dropdown list (for example, completed, active, or terminated).

#### Process instance assertions

Check the overall state of the process instance.

1. Click **Add assertion** > **Process instance**.
2. Choose the process instance state from the dropdown list (for example, created, active, completed, or terminated).

#### Update or remove an assertion

Open a saved test case's detail view in the side panel, then edit or delete any existing assertion the same way you added it. After you save a test case for the first time, assertion changes save automatically—no extra save step is needed.

**Note**
Test mode's variable, path, and process instance assertions use the same instructions as [test files](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files#instructions): `ASSERT_VARIABLES`, `ASSERT_ELEMENT_INSTANCE`, and `ASSERT_PROCESS_INSTANCE`. See the [full instruction reference](https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases#reference-instructions) for the underlying schema.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
