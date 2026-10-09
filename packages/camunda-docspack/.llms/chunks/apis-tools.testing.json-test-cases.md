# JSON test cases

Write your process tests in JSON format.

You can write your process tests in JSON format instead of coding the test logic in Java. The JSON file describes test cases with instructions that align with CPT's assertions and utilities.

CPT's JSON test cases use the same schema as [test files in Test mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files), so you can edit the same files in Test mode and execute them with CPT.


## Write a JSON test case

The JSON format is defined in the [JSON schema](https://camunda.com/json-schema/cpt-test-cases/8.10/schema.json). It defines the following structure:

- `testCases`: An array of test cases to be executed.
  - `name`: The name of the test case.
  - `description`: A description of the test case.
  - `instructions`: An array of [instructions](#reference-instructions) to execute the test case.
    - Each instruction has a `type` that defines the action to be performed (for example, `CREATE_PROCESS_INSTANCE`).
    - Additional properties depend on the instruction type (for example, process definition ID and variables).

How to start:

1. Create a new JSON file in your test resources folder (for example, `src/test/resources/test-cases/invoice-approval.json`)
2. Refer to the JSON schema `https://camunda.com/json-schema/cpt-test-cases/8.10/schema.json` in the `$schema` property.
   Use the same schema version as the CPT version you are using to ensure compatibility.
3. Add your test cases and use the [available instructions](#reference-instructions) to define the behavior of your process test.

The basic structure of the JSON file looks like this:

```JSON
{
  "$schema": "https://camunda.com/json-schema/cpt-test-cases/8.10/schema.json",
  "testCases": [
    {
      "name": "My first test case",
      "description": "A human-readable description of the test case.",
      "instructions": [
      ]
    }
  ]
}
```

You can find a full example of a JSON test case file in the [Examples](#examples) section below.

**Tip**
Use AI to support the generation of your JSON files. Refer to the documentation, provide a description of your test case, and your BPMN processes to get a first draft of your test cases.

Or, use an IDE with JSON schema support to get auto-completion and validation while writing your test cases, for example [IntelliJ IDEA](https://www.jetbrains.com/help/idea/json.html#ws_json_schema_add_custom).

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
