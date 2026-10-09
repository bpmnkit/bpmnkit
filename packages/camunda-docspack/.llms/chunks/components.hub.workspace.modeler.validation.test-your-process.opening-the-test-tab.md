# Test your process — Opening the Test tab

To use Test mode, open a BPMN diagram and click the **Test** tab. Read the [limitations and availability section](#limitations-and-availability) if this tab is missing.

Select any [environment](https://docs.camunda.io/docs/next/components/concepts/environments) assigned to your workspace as your test target. Each environment shows its tags, such as `dev`, `test`, `stage`, or `prod`. In Self-Managed, the environments come from the clusters defined in your Camunda Hub [configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters); the Camunda 8 Helm and Docker Compose distributions provide one environment, backed by a cluster, by default.

**Caution**
Test mode executes real process logic against the selected environment, including connectors, messages, and other external actions. If you target a production environment, this can affect live data and external systems. Camunda Hub warns you with **This is a production environment** when you select an environment tagged `prod`.

Opening the **Test** tab doesn't deploy your process automatically. Use the **Set up test run** panel to select an environment, deploy, and configure a test case. See [get started with Test mode](#get-started-with-test-mode) for the full flow.

The Test action bar shows the name of the selected environment, its tags, and its Logical Tenant. Click it to choose a different environment without leaving Test mode. The newly selected environment becomes the deployment and execution target. If no environment is selected, the action bar shows **No environment selected**.

If no environment is assigned to your workspace, Test mode tells you that an environment must be assigned to the workspace. Ask an organization admin to [assign an environment](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments).

In SaaS, Test mode uses connector secrets from your selected environment. Connector secrets are not currently supported in Self-Managed.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
