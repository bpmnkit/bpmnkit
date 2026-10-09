# App Integrations connector — Receive a chat message — Chat conversation element templates

Apply one of these templates in the [Camunda Hub modeler](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) or [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index). Each applies to a different BPMN element.

| Element template                                     | Apply to                         | Purpose                                                               |
| :--------------------------------------------------- | :------------------------------- | :-------------------------------------------------------------------- |
| **App Integrations Chat Conversation Start Event**   | Message start event              | Start a process when someone writes to the Camunda app.               |
| **App Integrations Chat Message Intermediate Event** | Intermediate message catch event | Wait for the next message in the conversation the process is holding. |
| **App Integrations Chat Message Receive Task**       | Receive task                     | Wait for the next message as a task rather than an event.             |
| **App Integrations Chat Message Boundary Event**     | Boundary message event           | Receive a message while another activity is running.                  |

A conversation process usually pairs the start event with a single catch element, and loops back to that element for each turn.

Desktop Modeler [fetches connector templates automatically](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/use-connectors#automatic-connector-template-fetching), so the templates appear without any setup unless you have turned that off.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
