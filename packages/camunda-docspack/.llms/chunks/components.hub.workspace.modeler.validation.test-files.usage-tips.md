# Test files — Usage tips

- Always use meaningful selector values, such as `elementId` or `processDefinitionId`, that match your BPMN diagram.
- Give test cases descriptive names to clearly indicate the test case being tested.
- Include error test cases along with happy path tests.
- Use optional `variables` fields to test different data conditions.
- Ensure correlation keys uniquely identify process instances when publishing messages.
- Specify `timeToLive` values in milliseconds (for example, `60000` for one minute, `300000` for five minutes).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files
