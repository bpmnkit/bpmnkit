# Upgrade AI Agent element templates

Upgrade AI Agent connectors from the legacy element templates to the new element templates and migrate their model provider configurations.

Upgrade AI Agent connectors from the legacy element templates to the new element templates, and migrate their model provider configurations.


## Legacy and new element templates

Camunda 8.10 provides two generations of AI Agent element templates, and each generation runs on its own job types. This page uses the following terms:

- **Legacy element templates** are the AI Agent Task and AI Agent Sub-process templates available before Camunda 8.10. Modeler marks them as **(Deprecated)**. They run on the legacy job types.
- **New element templates** are the AI Agent Task and AI Agent Sub-process templates introduced in Camunda 8.10 (template ID suffix `.v2`). They run on new job types.

| Element              | Template generation | Element template ID                                      | Job type                                    |
| :------------------- | :------------------ | :------------------------------------------------------- | :------------------------------------------ |
| AI Agent Task        | Legacy              | `io.camunda.connectors.agenticai.aiagent.v1`             | `io.camunda.agenticai:aiagent:1`            |
| AI Agent Task        | New                 | `io.camunda.connectors.agenticai.ai-agent-task.v2`       | `io.camunda.agenticai:aiagent:task:2`       |
| AI Agent Sub-process | Legacy              | `io.camunda.connectors.agenticai.aiagent.jobworker.v1`   | `io.camunda.agenticai:aiagent-job-worker:1` |
| AI Agent Sub-process | New                 | `io.camunda.connectors.agenticai.ai-agent-subprocess.v2` | `io.camunda.agenticai:aiagent:subprocess:2` |

The job type in a process definition determines which connector implementation executes the element. A process definition that was deployed with a legacy template keeps using the legacy job type until you deploy a new version with the new template.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
