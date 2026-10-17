# Connect to a runtime

Choose the environment that task testing, connector credentials, and the Webhook tab work against while you model in Camunda Hub.

Learn how to choose the runtime connection: the environment that Camunda Hub works against while you model, shown in the **Runtime** selector at the bottom of the modeling interface.


## About the runtime connection

With the runtime connection, you model against a real runtime instead of guessing what exists there. These features use the connected runtime:

| Feature                                                                                   | What it uses the connection for                                                                                                                        |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Task testing](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/task-testing)                                             | Runs the selected task on the connected runtime.                                                                                                       |
| Connector credentials                                                                     | Offers the credentials available on the connected runtime in the properties panel of connector templates. Requires a runtime on Camunda 8.10 or later. |
| **Webhook** tab of inbound connectors                                                     | Shows the webhook status and logs of the connected runtime.                                                                                            |
| [Problems panel](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/fix-problems-in-your-diagram#follow-the-runtime-connection-version) | Validates the diagram against the Camunda version of the connected runtime.                                                                            |

The runtime connection doesn't change your deploy target. **Deploy** and **Run** keep using the target you choose in their own dialog. See [run or publish your process](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process).

**Note**
The runtime connection is the Camunda Hub counterpart of the Desktop Modeler [connection manager](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/connect-to-camunda-8). Unlike Desktop Modeler, you don't enter a cluster URL or API client credentials. You choose from the environments assigned to your workspace.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime
