# Google Cloud storage connector

Interact with Google Cloud Storage from your BPMN process.

The **Google Cloud Storage connector** is an outbound connector that allows you to interact with
[Google Cloud Storage](https://cloud.google.com/storage?hl=en) resources from your BPMN processes.

**Note**
The connector currently supports uploading and downloading documents.


## Prerequisites

To begin using the **Google Cloud Storage connector**, ensure the following are set up:

- A Google [service account](https://cloud.google.com/iam/docs/service-account-overview)
- A [JSON key for the service account](https://cloud.google.com/iam/docs/keys-create-delete)
- A Google Cloud Storage [bucket](https://cloud.google.com/storage/docs/creating-buckets)

The service account must be granted access to the bucket:

- To **upload and download** objects, assign the `Storage Object Admin` role.
- To **download only**, assign the `Storage Object Viewer` role.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-cloud-storage
