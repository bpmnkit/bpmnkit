# REST connector — Request — Encoding

In certain scenarios, such as when working with APIs that require pre-encoded URL elements, the REST connector's default behavior may inadvertently modify encoded segments.

To avoid this, set the `skipEncoding` value to `"true"` in the XML. This disables the automatic decoding and re-encoding process, ensuring the URL is sent to the server exactly as provided.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
