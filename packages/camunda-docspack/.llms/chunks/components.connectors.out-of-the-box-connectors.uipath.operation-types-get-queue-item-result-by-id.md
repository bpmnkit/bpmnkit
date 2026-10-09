# UiPath connector — Operation types — Get queue item result by ID

This operation allows you get an item from your UiPath Orchestrator. To execute it, take the following steps:

1. Select the operation **Get Queue Item result by ID** from the dropdown list **Operation type**.
2. Configure authentication as described in the [authentication](#authentication) section.
3. Fill out the **Item ID** field. This field supports FEEL, so you're able to fetch an item ID from the process context; for example, if you exported it while [adding a new queue item](#add-queue-item).

#### Get queue item result by ID response

Given you have a queue item ID previously added to a queue, the operation **Get queue item result by ID** returns information about a certain item.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. It comes with a pre-filled value of `= {itemStatus: response.body.value[1].Status}`. You will see the `itemStatus` in the process variables. Its value will let you know if the item was processed or not.

Response example:

```
{
   "status":200,
   "headers":{
      "date":"Fri, 20 Jan 2023 10:13:21 GMT",
      "server":"cloudflare",
      "expires":"-1",
      "transfer-encoding":"chunked",
      "cf-ray":"78c709774a112a34-CDG",
      "api-supported-versions":"15.0",
      "x-frame-options":"Deny",
      "x-download-options":"noopen",
      "x-correlation-id":"8db50244-5f55-4598-82d3-1d6a00f806b0",
      "cf-cache-status":"DYNAMIC",
      "x-uipath-correlation-id":"undefined",
      "pragma":"no-cache",
      "strict-transport-security":"max-age=15724800; includeSubDomains",
      "request-context":"appId=cid-v1:354c7cb9-ae5a-4d16-84a7-f13242bbac6d",
      "content-security-policy":"default-src 'self';script-src 'self' https://orch-cdn.uipath.com https://use.typekit.net/ https://d2c7xlmseob604.cloudfront.net https://platform-cdn.uipath.com https://*.uipath.com https://*.pendo.io;style-src 'self' 'unsafe-inline' https://orch-cdn.uipath.com https://fonts.googleapis.com/css https://use.typekit.net https://p.typekit.net/ https://platform-cdn.uipath.com https://content.usage.uipath.com;img-src 'self' data: https://orch-cdn.uipath.com https://s.gravatar.com https://secure.gravatar.com https://*.wp.com https://*.googleusercontent.com https://i.ytimg.com https://platform-cdn.uipath.com https://*.pendo.io https://*.blob.core.windows.net https://*.amazonaws.com blob:;frame-src 'self' https://*.uipath.com https://*.pendo.io;font-src 'self' https://orch-cdn.uipath.com https://use.typekit.net/ https://fonts.gstatic.com https://platform-cdn.uipath.com data:;connect-src 'self' wss: https://orch-cdn.uipath.com https://primer.typekit.net https://use.typekit.net/ https://sentry.io https://studio-feedback.azure-api.net https://app.launchdarkly.com https://clientstream.launchdarkly.com https://events.launchdarkly.com https://api.smartling.com https://platform-cdn.uipath.com https://*.service.signalr.net https://*.uipath.com https://*.pendo.io https://cloud.uipath.com https://storage.googleapis.com https://*.blob.core.windows.net https://*.amazonaws.com dc.services.visualstudio.com;worker-src 'self' blob:",
      "x-xss-protection":"1",
      "x-content-type-options":"nosniff",
      "x-robots-tag":"noindex,nofollow",
      "content-type":"application/json; odata.metadata=minimal; odata.streaming=true",
      "connection":"keep-alive",
      "cache-control":"no-cache, no-store, must-revalidate",
      "odata-version":"4.0"
   },
   "body":{
      "@odata.context":"https://cloud.uipath.com/MyOrg/MyTenant/orchestrator_/odata/$metadata#QueueItems",
      "@odata.count":1,
      "value":[
         {
            "QueueDefinitionId":165001,
            "Encrypted":false,
            "Status":"New",
            "ReviewStatus":"None",
            "Key":"2196eb07-c96a-4f47-a734-326dd5d58a9d",
            "Reference":"test",
            "Priority":"Low",
            "DeferDate":"2023-01-12T00:00:00Z",
            "SecondsInPreviousAttempts":0,
            "RetryNumber":0,
            "SpecificData":"{\"DynamicProperties\":{\"test\":\"test\"}}",
            "CreationTime":"2023-01-20T10:13:20.66Z",
            "RowVersion":"AAAAAE2f4GY=",
            "OrganizationUnitId":1964413,
            "OrganizationUnitFullyQualifiedName":"MyCorporateWorkspace",
            "Id":436141352,
            "SpecificContent":{
               "test":"test"
            }
         }
      ]
   }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/uipath
