# Box connector — Operations — Upload File

Upload a file to your Box store.

| Property    | Type            | Required | Example          |
| ----------- | --------------- | -------- | ---------------- |
| File path   | String          | Yes      | "/my-file.png"   |
| Folder path | String          | Yes      | "/upload/folder" |
| Document    | Document source | Yes      | `{...}`          |

Select a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources) for the file to upload: a **Camunda document** reference, **inline content** built from process data, or an **external document** URL. The Box connector resolves the source and creates a new file item in your Box store.

The result of the upload can be accessed via the `item` property of the result.

Example value of a successful file upload:

```json
{ "item": { "id": "1734104173434", "name": "my_new_file.png", "type": "file" } }
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/box
