# Test files — Manual editing — Link a process (`processId`)

To display the file's test cases in Test mode, you must first link the file to a process.

Add a `processId` field with the process ID of the BPMN process you want to test:

```json
{
  "processId": "Process_1"
}
```

You can find the BPMN process ID in the properties panel, or in the first `<bpmn:process id=` field of the XML.

![process ID in properties panel](../modeling/advanced-modeling/img/process-id-properties-panel.png)

The `processId` should stay within the supported identifier-length limits of the target environment and must not contain whitespace.

**Note**
`processId` is a Test mode specific extension to the CPT schema. It is preserved when running the file with CPT, but only Test mode uses it to link the file to a process.

Test mode runs only the first executable process within the BPMN diagram. Make sure the process ID you link is the first executable process.

**Caution**
If the BPMN diagram's process ID changes, or if another process ID is added earlier in the BPMN file, the file's test cases won't appear in the process's Test cases tab.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files
