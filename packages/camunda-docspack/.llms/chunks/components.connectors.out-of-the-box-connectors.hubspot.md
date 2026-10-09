# HubSpot connector

Manage HubSpot contacts, companies and deals from your BPMN process. Learn about creating a HubSpot connector task and get started.

The **Hubspot connector** is an outbound connector that allows you to connect your BPMN service with [HubSpot](https://hubspot.com/) to manage HubsSpot contacts, companies, and deals.


## Prerequisites

To use the **HubSpot connector**, you must have a HubSpot account and a [Bearer token](https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key) to authenticate requests.

When creating a private app, you must grant the permissions required to access the HubSpot API. Different operations require different permissions. To use all HubSpot connector operations, add the following permissions to your app:

- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.companies.read`
- `crm.objects.companies.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`
- `crm.lists.read`
- `crm.lists.write`
- `automation`

**Note**
Use secrets to avoid exposing your token credentials as plain text. Refer to our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/hubspot
