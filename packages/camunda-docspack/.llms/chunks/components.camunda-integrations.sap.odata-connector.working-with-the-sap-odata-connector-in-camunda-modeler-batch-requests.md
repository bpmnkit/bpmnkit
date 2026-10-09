# SAP OData connector — Working with the SAP OData connector in Camunda Modeler — $batch requests

The capabilities are in sync with [https://me.sap.com/notes/1869434](https://me.sap.com/notes/1869434), with the exception of XML over the wire. The OData connector uses `JSON` only.

When `Batch Request` is selected as **Request type**, the available query options change and reveal the choice of the OData protocol and the input area for the individual requests. Note that the **Batch Request Payload** field requires the mandatory use of `FEEL`.

![batch connector template](./img/sap-odata-connector-batch-connector-template.png)

The **Batch Request** payload is an array of objects that can either be of `"type": "batch"` or `"type": "changeset"` - `batch` (denotes read requests), and `changeset` (denotes write operations, including `DELETE`).

```jsonc
[
  {
    "type": "batch",
    "requests": [...]
  },
  {
    "type": "changeset",
    "requests": [...]
  }
]
```

Both `batch` and `changeset` contain a `requests` node that holds the individual requests that should occur within a `batch` (read) or a `changeset` (write, update, delete). Together, they constitute the entirety of the batch request.

The `requests` node is also an array of `objects`. Regardless of if a request is inside a `batch` or a `changeset`, it always has `method` and `resourcePath` as mandatory fields.

```jsonc
[
  {
    "type": "batch",
    "requests": [
    	{
        "method": "GET",
        "resourcePath": "A_BusinessPartner('" + bp1 + "')",
        "options": {
          "format": "json",
          "select": "FirstName"
        }
      }
    ]
  },
  {
    "type": "changeset",
    "requests": [
    	{
        "method": "PATCH",
        "resourcePath": "A_BusinessPartner('" + bp1 + "')",
        "payload": {
          "FirstName": "Bernd (" + string(now()) + ")"
        }
      }
    ]
  }
]
```

`batch` request entries can contain an additional `options` block, allowing the same query options as the connector template has in [advanced capabilities](#advanced-capabilities), with the `$` prefix omitted.

`changeset` request entries are modifying operations and thus require a `payload` in JSON format.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/odata-connector
