# Upgrade AI Agent element templates — How to upgrade

**Important**
The new templates require Desktop Modeler 5.51.0 or later. Earlier versions show them as **Not found**.

The legacy and new element templates are separate templates, not two versions of the same template. This means upgrading is a manual, per-element operation:

1. Open the AI Agent Task or AI Agent Sub-process element in [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) or [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index). Set the process' modeler/execution version to Camunda 8.10 or later. This makes the new element template available to select.
2. Select the element in the diagram. Choose **Change element**, then apply the new **AI Agent Task** or **AI Agent Sub-process** template. Camunda deprecates the legacy template. The template picker offers the new template for that element.
3. Re-enter the model provider configuration with the [mapping tables](#model-provider-configuration-mapping) below. The provider fields require the most migration work.
4. Review the rest of the element's configuration. Tools, memory, limits, response, and error handling are conceptually unchanged, but re-check any values that need to be re-entered after you apply the new template.
5. Deploy the new process definition version to a non-production environment first. Test a representative prompt and tool-call path. Make sure authentication, endpoint, and model behavior are correct before you promote it. See [testing process definitions](https://docs.camunda.io/docs/next/components/best-practices/development/testing-process-definitions) for a test approach. The prior version keeps running until you deploy this one. It remains available as a rollback path.
6. Once verified, promote the new version to production through your normal release process.

**Important**
Swapping the element template affects only the process definition you redeploy. Already-deployed process definitions and their running process instances keep executing on the legacy job worker. They switch only after you deploy a new version with the new template.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
