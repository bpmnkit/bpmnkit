# Test your process — Rapid iteration

To make changes, switch back to **Implement** mode. When returning to Test mode, your process needs to be redeployed. Test mode only shows process instances from the process’s most recent version, so you may not see your previous instances.

Test mode saves your inputs when completing user task forms. It auto-fills your last response if you open the same form later in the session. You can click **Reset** to reset the form to its defaults.


## Details

Depending on the BPMN element, there may be a different action:

- **User tasks** with an embedded form are displayed on click. However, you cannot track assignment logic.
- **Call activities** can be navigated into and performed.
- **Manual tasks**, **undefined tasks**, **script tasks**, **business rule tasks**, **gateways**, **outbound connectors** and other BPMN elements that control the process's path are automatically completed based on their configuration.
- **Service tasks**, **inbound connectors**, message-related tasks, or events are simulated on click or triggered from an external client. However, Test mode attempts message correlation based on the process context but cannot infer keys from FEEL expressions. Therefore, these keys must be manually entered by publishing a message using secondary actions.
- Many action icons have secondary actions. For example, **user tasks** can be completed with variables rather than a form, and **service tasks** can trigger an error event.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
