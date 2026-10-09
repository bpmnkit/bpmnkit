# Salesforce connector — Instance — sObject records

**sObject records** support **Create record**, **Get record**, **Update record**, and **Delete record**.

**Note**
Every operation explanation contains a link to the Salesforce API docs which will explain the request and provide an example.

#### Create record

- **Salesforce object:** The Salesforce object to create, e.g. _Account_.
- **Record fields:** Field values for the Salesforce object to create, e.g. `{ Name: "Express Logistics and Transport" }`.

Review an example including the response body format in the [Salesforce documentation](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_sobject_create.htm).

#### Get record

- **Salesforce object:** The Salesforce object to create, e.g. _Account_.
- **Salesforce object ID:** Identifier of the Salesforce object, e.g. _001R0000005hDFYIA2_.
- **Relationship field name _(optional)_:** Name of the field that contains the relationship, e.g. _Opportunities_.
- **Query Parameters _(optional)_:** Additional query parameters that can be provided along with the request, e.g. `{ fields: "AccountNumber,BillingPostalCode" }`.

When omitting the **Relationship field name**, a [get request for a record](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_retrieve_get.htm) is performed. Otherwise, a [get request for records using sObject relationships](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_relationships_get.htm) is performed. In the documentation linked above, you can find the possible use case for **Query parameters**; for example, [filtering fields](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_get_field_values.htm).

The response body will contain the requested object as the root object:

```json
{
  "attributes": {
    "type": "<object>",
    "url": "/services/data/<API version>/sobjects/<object>/<object id>"
  },
  "<field name>": "<field value>",
  "...": "..."
}
```

Find another example [here](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_get_field_values.htm).

#### Update object

- **Salesforce object:** The Salesforce object to create, e.g. _Account_.
- **Salesforce object ID:** Identifier of the Salesforce object, e.g. _001R0000005hDFYIA2_.
- **Record fields:** Field values for the Salesforce object to update, e.g. `{ BillingCity : "San Francisco" }`.

[These update the record](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_retrieve_patch.htm) using the given fields.

As an update does not return a body, you will not be able to map any data from the response back to the process.

#### Delete object

- **Salesforce object:** The Salesforce object to create, e.g. _Account_.
- **Salesforce object ID:** Identifier of the Salesforce object, e.g. _001R0000005hDFYIA2_.

[These delete the record](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_sobject_retrieve_delete.htm).

As a delete does not return a body, you will not be able to map any data from the response back to the process.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/salesforce
