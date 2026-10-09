# Box connector — Operations

The **Box connector** supports the following operations that allow you to interact with the items stored in your Box account.

**Note**

The Box connector supports two methods for locating items stored in your Box account:

- File or folder path properties allow you to either specify the **Item ID** (found in the Box URL when browsing your items) or using the item names separated by slashes (`/`) for items in folders.
- A path consisting of only a single `/` denotes the root of your Box folder. For example, `/my-folder` would point to the `my-folder` folder located in the root directory. You can use the path notation for files (`/my/image.png`) and folders (`/my/sub/folder`).

**Note**
Starting from version 8.7.0, the Box connector supports uploading documents from (or downloading documents to) the Camunda document store. Review the **Document** field in the properties panel where the document reference can be provided. See additional details and limitations in [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/box
