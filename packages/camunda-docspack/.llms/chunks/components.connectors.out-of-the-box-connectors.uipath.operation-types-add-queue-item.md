# UiPath connector — Operation types — Add queue item

This operation allows you to create a new item and add it to a queue from UiPath Orchestrator. To execute it, take the following steps:

1. Select the operation **Add queue item** from the **Operation type** dropdown list.
2. Configure authentication as described in the [authentication](#authentication) section.
3. Fill out the input fields as described in the [configuration](#configuration) section.
4. Fill out the input fields as described in the [input](#input) section.
5. Fill out the response mapping as described in the [add queue item response](#add-queue-item-response) section.

#### Configuration

For this section, you must fill out the following fields:

1. **Cloud URL**: Comes with a default value of `cloud.uipath.com`. You can always change it, if needed. To use a connector secret, use a double curly braces notation, e.g. `{{secrets.MY_SECRET_VALUE}}`.
2. **Cloud organization**: The name of your organization. See [about organizations](https://docs.uipath.com/automation-cloud/docs/about-organizations) to learn more. To use a connectors secret, use a double curly braces notation, e.g. `{{secrets.MY_SECRET_VALUE}}`.
3. **Cloud tenant**: The name of the tenant. See [about tenants](https://docs.uipath.com/automation-cloud/docs/about-tenants) to learn more. To use a connectors secret, use a double curly braces notation, e.g. `{{secrets.MY_SECRET_VALUE}}`.
4. **Organization Unit ID**: Click **Orchestrator** and you will find the ID in the URL. For example, `https://cloud.uipath.com/MyOrg/MyTenant/orchestrator_/?tid=26929&fid=112233` where the **Organization Unit ID** is `112233`. To use a connectors secret, use a double curly braces notation, e.g. `{{secrets.MY_SECRET_VALUE}}`.

#### Input

For this section, fill out the following fields:

1. **Queue Name**: The queue where the QueueItem object is to be added. Check [queues and transactions](https://docs.uipath.com/orchestrator/docs/about-queues-and-transactions) to learn more.
2. _(Optional)_ **Defer date**: The earliest date and time at which the item is available for processing. If empty, the item can be processed as soon as possible. Expected date format is `yyyy-MM-dd`.
3. _(Optional)_ **Due date**: The latest date and time at which the item should be processed. If empty, the item can be processed at any given time. Expected date format is `yyyy-MM-dd`.
4. _(Optional)_ **Priority**: Select a value from the dropdown list to represent the priority level of the queue item to be added. This property is a criterion for the prioritization of queue items, alongside **Deadline** and **Postpone**.
5. _(Optional)_ **Specific Content for UiPath Job**: Data that will be passed in to the job. This must be in JSON format.

```
= {
   "Name":"testItemName",
   "Value":"testItemValue"
 }
```

6. _(Optional)_ **Reference**: A string reference for the queue item.

#### Add queue item response

The operation **Add Queue Item** returns information about the newly created item in the queue.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. It comes with a pre-filled value of `= {itemId: response.body.Id}`. To use operation _Get queue item result by ID_, you need an `itemId`. This expression will add it in the context for you. Learn more in [get queue item result by ID](#get-queue-item-result-by-id).

Response example:

```
= {
   "status":201,
   "headers":{
      "date":"Fri, 20 Jan 2023 10:13:20 GMT",
      "content-length":878,
      "server":"cloudflare",
      "expires":"-1",
      "cf-ray":"78c70973ce68153b-CDG",
      "api-supported-versions":"15.0",
      "x-frame-options":"Deny",
      "x-download-options":"noopen",
      "x-correlation-id":"7a211afe-53f1-4225-b77c-0fa477912685",
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
      "location":"https://cloud.uipath.com/MyOrg/MyTenant/orchestrator_/odata/QueueItems(436141352)",
      "connection":"keep-alive",
      "cache-control":"no-cache, no-store, must-revalidate",
      "odata-version":"4.0"
   },
   "body":{
      "@odata.context":"https://cloud.uipath.com/MyOrg/MyTenant/orchestrator_/odata/$metadata#QueueItems/$entity",
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
      "CreationTime":"2023-01-20T10:13:20.6603953Z",
      "RowVersion":"AAAAAE2f4GY=",
      "OrganizationUnitId":112233,
      "Id":436141352,
      "SpecificContent":{
         "test":"test"
      }
   }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/uipath
