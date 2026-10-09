# Task testing

Test and debug a single BPMN task directly in Camunda Hub using live data from your connected environment.

You can test a single task directly within Camunda Hub to validate its configuration and logic without executing the entire process.  
Task testing lets you quickly debug mappings, inputs, and outputs without leaving your implementation context.


## Task testing vs. Test mode

While both task testing and Test mode let you validate your BPMN models, they serve different purposes:

| Feature / capability | Task testing (Implement mode)     | Test mode                         |
| -------------------- | --------------------------------- | --------------------------------- |
| Test scope           | Single task or sub-process        | Process segment or full diagram   |
| Best for             | Quick implementation checks       | End-to-end test validation        |
| Data type            | Live data only                    | Live or mocked data               |
| Saves test cases     | No                                | Yes                               |
| Mode required        | Runs directly in _Implement_ mode | Requires switching to _Test_ mode |

Use task testing during implementation for quick feedback, and use Test mode for structured testing with mock data or reusable test cases.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/task-testing
