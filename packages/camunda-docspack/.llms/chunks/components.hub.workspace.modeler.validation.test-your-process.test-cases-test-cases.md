# Test your process — Test cases {#test-cases}

Use test cases to quickly rerun processes while tracking test coverage.

For example, you can validate your process by creating and rerunning test cases for different paths to check the process works as expected after any diagram changes are made. Test cases allow you to retest and confirm that a process completes correctly with the predefined actions and variables.

**Note**
Although test cases are valuable for rapid validation during development, Camunda [best practices](https://docs.camunda.io/docs/next/components/best-practices/development/testing-process-definitions) recommend using specialized test libraries in your CI/CD pipeline for comprehensive testing.

Test cases are stored in [test files](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files). You can view and edit these files directly in Camunda Hub or in your Git repository using Git sync.

Test mode will use the test file [linked to the first executable process ID](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files#link-a-process-processid) of the BPMN diagram.

If multiple test files are linked to the same process ID, Test mode uses the one with the earliest name alphabetically. If more than one shares that name, Test mode uses the one most recently updated.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
