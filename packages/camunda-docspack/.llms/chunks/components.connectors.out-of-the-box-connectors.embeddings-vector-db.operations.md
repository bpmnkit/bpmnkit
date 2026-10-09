# Vector Database connector — Operations

The **embed document** operation performs the following steps:

1. [Consume a document](#embedding-document-configuration).
2. Parse the document depending on a file format (optionally [split into text chunks](#splitting)).
3. Convert chunks into a vector form with LLM help.
4. Store produced vectors in a vector database.

To perform this operation, enter the following:

- **Operation** dropdown: **Embed document**.
- **Embedding model**: Refer to the [relevant section](#embedding-models).
- **Vector store**: Refer to the [relevant section](#vector-stores).
- **Document**: Refer to the [relevant section](#embedding-document-configuration).

As a result of this operation, you will get an array of created embedding chunk IDs,
for example `["d599ec62-fe51-4a91-bbf0-26e1241f9079", "a1fad021-5148-42b4-aa02-7de9d590e69c"]`.

### Updating embedded documents

Each time you embed a document, the connector generates a new set of chunks and stores them in the vector database.  
If the document was previously embedded, this creates duplicate chunks.

To prevent duplicates:

1. Delete the existing chunks before re-embedding the document.
2. Use the chunk IDs returned by the previous embedding operation.
3. If the embedded document is from Camunda, use the `filename` metadata field to find the chunk IDs.
4. Follow your vector store’s documentation for deleting chunks.

The **retrieve document** operation performs the following steps:

1. Consumes a query.
2. Convert the query into a vector form with LLM help.
3. Perform a vector similarity search on previously-stored LLM embeddings.
4. Store results in Camunda document storage.

To perform this operation, enter the following:

- **Operation** dropdown: **Retrieve document**.
- **Search query**: Enter your search query.
- **Max results**: Enter maximum amount of returned results.
- **Min score**: Enter the lowest score threshold similarity value; the value should be between 0 and 1, for example, 0.81.
- **Embedding model**: Refer to the [relevant section](#embedding-models).
- **Vector store**: Refer to the [relevant section](#vector-stores).

As a result of this operation, you will get an array of relevant chunks, where each includes a [chunk ID](#splitting),
Camunda document reference metadata, similarity score, and the actual text content.

```json
{
  "chunks": [
    {
      "chunkId": "e30d570b-2a3a-4f4a-9a0c-78f0f1acd383",
      "documentReference": {
        "storeId": "local",
        "documentId": "2b36ec67-a78f-4f99-9371-8c6e5b332838",
        "contentHash": "1c232bc1e553c10d00c3327dcca9012b6b4b0758a1c2afaad8b77c80fa1bd36e",
        "metadata": {
          "size": 116,
          "fileName": null,
          "processDefinitionId": null,
          "processInstanceKey": null,
          "customProperties": {},
          "expiresAt": null,
          "contentType": "text/plain"
        },
        "camunda.document.type": "camunda"
      },
      "score": 0.6721556,
      "content": "Camunda is a platform for orchestrating and automating business processes. It helps organizations design, execute, and manage workflows, enabling them to optimize processes and improve efficiency."
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db
