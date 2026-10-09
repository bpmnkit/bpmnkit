# Handle documents with outbound connectors — Document sources

Every document handed to a connector is one of three **document reference types**, distinguished by the `camunda.document.type` field. Connectors that take a `Document` input expose a **document source** dropdown in the properties panel, with one option per type. Each option reveals only the relevant fields:

| Source                | Reference type | Fields revealed                                   | Use when                                                                                                                                                                     |
| --------------------- | -------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Camunda document**  | `camunda`      | Document reference (FEEL)                         | You already have a document in the [Camunda document store](#camunda-documents) (Path 1).                                                                                    |
| **Inline content**    | `inline`       | Content, optional filename, optional content type | You want to work with small text files (for example, `.json` or `.txt`) that are written from or read into process data (Path 2). See [inline documents](#inline-documents). |
| **External document** | `external`     | URL, optional filename                            | The file lives at a reachable URL. See [external documents](#external-documents).                                                                                            |

![example REST configuration](./img/rest-outbound-document.png)

The three subsections below define the JSON structure of each type. You can also select a type from the source dropdown without writing the JSON by hand.

---
Source: https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system
