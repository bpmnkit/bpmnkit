# HubSpot connector — Select operation to execute — Companies

#### Get all companies

- **Next page after object id:** HubSpot limits the number of results to 100 and provides pagination. To retrieve the first page keep this field empty. To retrieve the following page, set it to `response.body.paging.next.after` from the previous page.

#### Get company by id

- **Company ID:** The ID of the company.

#### Search company

- **Search field:** The field to search for. For example, "name".
- **Search value:** The value to search for. For example, "Camunda".

**Note**
All companies matching the search criteria are returned.

#### Get all contacts of a company

- **Company ID:** The ID of the company.

#### Add contact to company

- **Contact ID:** The ID of the contact.
- **Company ID:** The ID of the company.

#### Remove contact from company

- **Contact ID:** The ID of the contact.
- **Company ID:** The ID of the company.

#### Create company

- **Properties:** The properties of the company to create. Learn more about [properties](https://developers.hubspot.com/docs/guides/api/crm/properties) and [default properties of companies](https://knowledge.hubspot.com/properties/hubspot-crm-default-company-properties).

#### Delete company

- **Company ID:** The ID of the company to delete.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/hubspot
