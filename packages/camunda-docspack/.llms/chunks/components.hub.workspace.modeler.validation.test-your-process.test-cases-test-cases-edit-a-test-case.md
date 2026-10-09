# Test your process — Test cases {#test-cases} — Edit a test case

Open a test case's detail view in the side panel to edit its name, description, and instructions inline.

#### Review test coverage

Test coverage is calculated as the percentage of flow nodes in your process that are covered, including all elements, events, and gateways. For example, the coverage is 80% if eight out of ten flow nodes are covered.

- On the process definition page, covered paths are highlighted in blue. Click on individual test cases to view their specific coverage.
- Once a process instance is completed, the process instance header shows how much your process test coverage would increase if the path was saved as a test case.

![Test coverage indicator](../img/test-coverage.png)

**Warning**
Test coverage will not display as expected if you edit or remove the "metadata" field in the [test file](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files).

#### Run a test case

You can run test from the **Test cases** panel by clicking **Run all test cases** button or the **Run test case** button for each individual test case.

- Test case execution results are marked with either a **Completed** or **Failed** status.
- If a test case fails, click **Repair** against each step to update it, especially if diagram changes require further user input (such as when a new flow node is added to a previously saved test case path). See [Repair a test case](#repair-a-test-case).

![Running a test case on the process definition page](../img/test-case-runs.png)

#### Review test results

A test case passes only when every step, including its assertions, succeeds, not just when the process completes without an incident.

- The overall test case status is either **Passed** or **Failed**.
- When a test case fails, Test mode highlights the failed step and shows the underlying failure message verbatim (for example, an expected-versus-actual value mismatch for a variable assertion).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
