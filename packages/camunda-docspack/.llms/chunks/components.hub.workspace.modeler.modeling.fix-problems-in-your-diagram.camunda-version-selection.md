# Fix problems in your diagram — Camunda version selection

The version selector at the top right of the **Problems** panel can be used to choose the Camunda version the diagram is validated against. The chosen version should match the version of the cluster that hosts the environment where the diagram will be deployed so that the correct set of errors is shown.

**Tip**
If you don't know the version click **Deploy & run** at the top right of the modeling interface. In the deployment dialog, next to the name of each environment, you'll see the Camunda version of its cluster.

The version selector also shows how many environments (or clusters, if your organization doesn't use environments) are available for each Camunda version.

### Follow the runtime connection version

Click **Check problems against** and select **Follow runtime environment** to validate the diagram against the Camunda version of the runtime you're [connected to](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime). If your organization doesn't use environments, the option is called **Follow runtime cluster**. When you connect to a different runtime, the validated version follows automatically. To stop following, select a specific Camunda version.

Below the option, the menu shows the followed version, for example **Camunda 8.9**. It shows **Not connected to an environment.** (or **Not connected to a cluster.**) if you're working offline, and **Version not recognized.** if Camunda Hub can't map the runtime's version to a supported Camunda version.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/fix-problems-in-your-diagram
