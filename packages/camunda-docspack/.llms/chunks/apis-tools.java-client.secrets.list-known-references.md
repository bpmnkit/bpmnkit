# Secrets — List known references

```java
ListSecretsResponse response = client.newListSecretsCommand().send().join();
List<String> references = response.getReferences();
```

`getReferences()` returns reference names only, never values, and only the references the caller holds `SECRET:READ` on.


## Physical-tenant scoping

Both commands resolve and list against the secret stores of the client's own [Physical Tenant](https://docs.camunda.io/docs/next/apis-tools/java-client/physical-tenants). Neither command takes a separate tenant parameter.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/secrets
