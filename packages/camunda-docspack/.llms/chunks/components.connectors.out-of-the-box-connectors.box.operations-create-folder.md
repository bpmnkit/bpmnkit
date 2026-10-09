# Box connector — Operations — Create Folder

Creates a new folder in your store.

| Property    | Type        | Required | Example                          |
| :---------- | :---------- | :------- | :------------------------------- |
| Folder name | String      | Yes      | "my-folder"                      |
| Parent path | Folder path | No       | `/`, `123`, `/my/parent/folders` |

**Note**
This operation fails if a folder already exists with the same name, as Box only supports unique names.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/box
