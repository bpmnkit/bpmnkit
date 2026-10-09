# Storage isolation — Document Store storage — Compare document store locations across tenants

Camunda resolves a location for every configured document store at startup, then compares the locations of all tenants. A location is the provider, a namespace, and a key prefix:

- The **namespace** is the container no key can escape. It can be a bucket, a blob container, or a directory.
- The **key prefix** is the string every key inside that namespace starts with.

Two tenants overlap when the provider and namespace match and one key prefix is a prefix of the other. Overlap is broader than equality because a document ID is caller-supplied and appended to the key prefix as given. With the prefixes `tenant` and `tenant-b-` in one bucket, a request against the first store for the document ID `-b-invoice` resolves to the second store's `tenant-b-invoice`.

A separator changes nothing: `docs/` reaches `docs/archive/` through the document ID `archive/invoice`, because no object storage service treats `/` in a key as a path boundary. Any prefix nested inside another tenant's prefix is therefore rejected, including a bucket or container root paired with a path inside it.

Give every tenant that shares a bucket or container its own sibling prefix. No layout lets one tenant own the root while another owns a path within it, and isolation is enforced by this check at startup rather than by inspecting document IDs at runtime.

When the check fails, the cluster doesn't start, and the error names each conflict:

```
Physical tenants must not share a document store location, or they would read and write
into the same backing storage. Use a distinct bucket, container, or path per tenant, and
never nest one tenant's path inside another's. A nested path is reachable through a
caller-supplied document id, which no object store bounds at '/'. Conflicts: tenant
default's document store location [provider=aws, namespace=[camunda-documents, ],
keyPrefix=''] encloses tenant tenanta's [provider=aws, namespace=[camunda-documents, ],
keyPrefix='tenant-a/']
```

#### Limitations of location comparison

| Limitation                                                    | Effect                                                                                                                                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aliases aren't resolved                                       | Two endpoint URLs or DNS names fronting the same backend are treated as separate locations, so a genuine overlap isn't detected.                                                                  |
| Local paths are compared case-insensitively on every platform | On a case-sensitive filesystem, two directories differing only in case are reported as a collision even though they're isolated.                                                                  |
| Nested local directories aren't compared                      | `path: /var/docs` and `path: /var/docs/tenant-b` are two namespaces with empty prefixes. The local store rejects `/`, `\`, and `..` in a document ID, so the parent can't descend into the child. |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
