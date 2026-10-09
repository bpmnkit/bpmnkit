# Configuration — Semantic similarity configuration

[Semantic similarity assertions](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasvariablesimilarto) use a configured embedding model to compare process variables (or plain values) to an expected string using vector embeddings.
The assertion converts both values to embeddings and compares them using cosine similarity.

This section covers how to set up the embedding model provider and tune the similarity behavior.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
