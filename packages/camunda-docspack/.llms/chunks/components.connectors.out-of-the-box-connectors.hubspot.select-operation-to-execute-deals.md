# HubSpot connector — Select operation to execute — Deals

#### Get all deals

- **Next page after object id:** HubSpot limits the number of results to 100 and provides pagination. To retrieve the first page keep this field empty. To retrieve the following page, set it to `response.body.paging.next.after` from the previous page.

#### Get deal by id

- **Deal ID:** The ID of the deal.

#### Search deal

- **Search field:** The field to search for. For example, "dealname".
- **Search value:** The value to search for. For example, "Inital Deal for Camunda".

**Note**
All deals matching the search criteria are returned.

#### Delete deal

- **Deal ID:** The ID of the deal to delete.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/hubspot
