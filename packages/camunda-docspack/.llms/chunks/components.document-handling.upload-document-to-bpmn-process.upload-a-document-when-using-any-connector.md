# Upload a document to a BPMN process — Upload a document when using any connector

Documents available for download from an unprotected URL can be added to a process in any connector as an **external document**. The full JSON structure and field reference is documented in [document sources](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#external-documents).


## Upload a document via inbound webhook connector

Documents can be added to a process using the [inbound](https://docs.camunda.io/docs/next/components//connectors/connector-types#inbound-connectors) [HTTP webhook connector](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook).

You can pass the documents in both the response expression and the result expression, where the `documents` object contains the references for created documents. Below, review an example of a webhook configuration:

![Example payload of inbound webhook connector](./img/inbound-webhook-connector-example.png)

In this example, the result expression may look as follows, where `applicationDocument` can be later used by the process to retrieve documents:

```
{
  applicationDocument: documents[1]
}
```

The document reference received as an output of one connector should be stored in process variables by using the result expression or result variable.

To call the webhook sending a file, see the following example:

```curl
curl --location 'https://some.dev.environment/uploadDocument' \
--form 'file=@"/path-to-file/file.pdf"'
```

**Note**
This example uses Postman to obtain the result, so your `user-agent` value may look different.

The result variable will have the following structure:

```
{
 "request": {
   "body": {},
   "headers": {
     "host": "example.host.io",
     "x-request-id": "34509f2d9293cdfj49875rjf03",
     "x-real-ip": "some.example.ip.address",
     "x-forwarded-host": "example.host.io",
     "x-forwarded-port": "443",
     "x-forwarded-proto": "https",
     "x-forwarded-scheme": "https",
     "x-scheme": "https",
     "content-length": "70484",
     "user-agent": "PostmanRuntime/7.43.0",
     "accept": "*/*",
     "cache-control": "no-cache",
     "postman-token": "my-example-token",
     "accept-encoding": "gzip, deflate, br",
     "content-type": "multipart/form-data; boundary=--------------------------3007423254435453453514"
   },
   "params": {}
 },
 "connectorData": {},
 "documents": [
   {
     "storeId": "gcp",
     "documentId": "example-document-id",
     "contentHash": "fwkhkj34843rfhfwho3297ufdsj0df09",
     "metadata": {
       "contentType": "application/pdf",
       "size": 70266,
       "fileName": "file.pdf"
     },
     "camunda.document.type": "camunda"
   }
 ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/document-handling/upload-document-to-bpmn-process
