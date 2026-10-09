# Analytics Exporter — What data is sent — What is never sent

Regardless of configuration, the exporter never sends:

- Process variables, job variables, or any payload
- Message contents or correlation keys
- Incident error messages
- BPMN, DMN, and form resources, resource names, or version tags
- Tenant names and descriptions
- Agent system prompts, tool definitions, model configuration, or token counts
- Raw user names, email addresses, assignee data, or your license key

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
