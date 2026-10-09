# Automation Anywhere connector

Orchestrate your Automation Anywhere queue items from your BPMN process.

The **Automation Anywhere connector** allows you to orchestrate an Automation Anywhere queue from your BPMN process with [Automation Anywhere RPA](https://www.automationanywhere.com/) to add work items to the queue and obtain work item results.

To start using the connector, you need an instance with a [license](https://docs.automationanywhere.com/bundle/enterprise-v2019/page/enterprise-cloud/topics/control-room/dashboards/cloud-administration-licenses.html) we configured via an API service. Refer to the [official documentation page](https://docs.automationanywhere.com/bundle/enterprise-v2019/page/enterprise-cloud/topics/aae-client/bot-creator/using-the-workbench/cloud-install.html) to learn more about installing and configuring the Automation Anywhere API service.

You also need a user account with the `AAE_Queue Admin` role to query and manage workload queues and work items in a Control Room. Read more about roles in the [official documentation](https://docs.automationanywhere.com/bundle/enterprise-v2019/page/enterprise-cloud/topics/control-room/administration/roles/cloud-system-created-roles.html).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/automation-anywhere
