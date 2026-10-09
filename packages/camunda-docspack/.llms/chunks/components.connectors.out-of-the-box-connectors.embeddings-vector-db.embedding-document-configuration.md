# Vector Database connector — Embedding document configuration

### Document source

The **Document source** can be either **Plain text** or a **Camunda document**.

**Plain text** can be useful when you deal with small size data that can fit into a text field or a process variable. Input will be handled as a regular UTF-8 text.

**Note**
A FEEL [string conversion function](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion#stringfrom) might be useful if you have JSON input.

The **Camunda document** might be useful when you deal with larger document pipelines that come from
[webhook or user tasks](https://docs.camunda.io/docs/next/components/document-handling/getting-started). Input documents will be parsed with [Apache Tika](https://tika.apache.org/), so files
can be of any Apache Tika-supported formats.

### Splitting

**Splitting** is an action of breaking large documents into smaller pieces. It can be either recursive or no splitting
at all. Seek guidance from your local data scientist to determine if you require splitting.

Learn more about splitting in the [LangChain4j documentation](https://docs.langchain4j.dev/tutorials/rag#document-splitter).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db
