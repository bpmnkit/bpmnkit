# Test your process — Opening the Test tab

To use Test mode, open a BPMN diagram and click the **Test** tab. Read the [limitations and availability section](#limitations-and-availability) if this tab is missing.

Select any environment configured for your project as your test target. In SaaS, you can select any cluster configured for the project (development, test, stage, or production). In Self-Managed, you select from the clusters defined in your Camunda Hub [configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters); the Camunda 8 Helm and Docker Compose distributions provide one cluster configured by default.

**Caution**
Test mode executes real process logic against the selected cluster, including connectors, messages, and other external actions. If you target a production cluster, this can affect live data and external systems.

Opening the **Test** tab no longer deploys your process automatically. Use the **Set up test run** panel to connect a cluster, deploy, and configure a test case — see [get started with Test mode](#get-started-with-test-mode) for the full flow.

The selected cluster name is shown in the Test action bar. Click it to switch clusters without leaving Test mode; the newly selected cluster becomes the deployment and execution target.

In SaaS, Test mode uses connector secrets from your selected cluster. Connector secrets are not currently supported in Self-Managed.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
