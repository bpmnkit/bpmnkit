# SAP OData connector — Working with the SAP OData connector in Camunda Modeler — Query result structure

The result of any query, whether it is reading or writing to the SAP system, is in JSON format in the following structure:

```json
{
  result: <further json>,
  statusCode: <http status code>,
  countOrInlineCount: <integer, optional!>
}
```

- `result` contains the result of the query, whether it is content retrieved from a SAP system via `GET` or the result of a write or update operation via `POST`, `PUT`, `PATCH`, or `DELETE`. (Note that with the latter, the `result` is always empty.)
- `statusCode` holds the [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) of the operation.
- `countOrInlineCount` is only present in the response when the corresponding option `$inlinecount` (for OData v2) or `$count` (for OData v4) was checked in the design time of the BPMN task. It then shows the number of results from the `GET` query to the SAP system.

![the output mapping of the SAP OData element template](./img/sap-odata-connector-element-template-result.png)

The query result can either be mapped to a single result variable or worked on [via FEEL with an expression](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#result-expression). The same is applicable to `getResponse`, as a result variable contains the described query JSON in its entirety. The result expression `{getStatusCode: statusCode}` would only hold the HTTP status code in the `getStatusCode` process variable.

For `$batch` requests, the query result is an array of the result structure above. This is an example for an OData v2 batch request, consisting of one `Read` and one `Update` operation:

```json
{
  "<your output mapping result variable>": [
    {
      "result": {
        "d": {
          "__metadata": {
            "id": "<host>/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('...')",
            "uri": "<host>/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('...')",
            "type": "API_BUSINESS_PARTNER.A_BusinessPartnerType"
          },
          "FirstName": "..."
        }
      },
      "statusCode": 200
    },
    { "result": null, "statusCode": 204 }
  ]
}
```

If one of the operations in the batch request fails, the error is relayed to the `result` node for the request. For example, the second request in this sample result where the business partner with number `0000000` couldn't be found:

```jsonc
{
  "<your output mapping result variable>": [
    {
      "result": {
        "d": {
          "__count": "4",
          "results": [
            {...}
          ]
        }
      },
      "statusCode": 200,
      "countOrInlineCount": 4
    },
    {
      "result": {
        "target": "/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('0000000')?$format=json&$select=FirstName%2CLastName",
        "odata": {
          "error": {
            "code": "/IWBEP/CM_MGW_RT/020",
            "message": {
              "lang": "en",
              "value": "Resource not found for segment 'A_BusinessPartnerType'"
            },
            "innererror": {
              "application": {
                "component_id": "LO-MD-BP",
                "service_namespace": "/SAP/",
                "service_id": "API_BUSINESS_PARTNER",
                "service_version": "0001"
              },
              "transactionid": "D25C6A8CF4D30020E0067DD0610AFCCA",
              "timestamp": "",
              "Error_Resolution": {
                "SAP_Transaction": "",
                "SAP_Note": "See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)",
                "Batch_SAP_Note": "See SAP Note 1869434 for details about working with $batch (https://service.sap.com/sap/support/notes/1869434)"
              },
              "longtext_url": "/sap/opu/odata/iwbep/message_text/T100_longtexts(MSGID='%2FIWBEP%2FCM_MGW_RT',MSGNO='020',MESSAGE_V1='A_BusinessPartnerType',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value",
              "errordetails": [
                {
                  "ContentID": "",
                  "code": "/IWBEP/CX_MGW_BUSI_EXCEPTION",
                  "message": "Resource not found for segment 'A_BusinessPartnerType'",
                  "longtext_url": "/sap/opu/odata/iwbep/message_text/T100_longtexts(MSGID='%2FIWBEP%2FCM_MGW_RT',MSGNO='020',MESSAGE_V1='A_BusinessPartnerType',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value",
                  "propertyref": "",
                  "severity": "error",
                  "transition": false,
                  "target": ""
                }
              ]
            }
          }
        }
      },
      "statusCode": 404
    }
  ]
}

```

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/odata-connector
