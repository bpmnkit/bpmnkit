# OpenSearch privileges — Indices

- `data_access` - Necessary to query and read.
- `get` - Necessary to read.
- `delete` - Necessary to create, archive, and migrate data.
- `create_index` - Necessary to create index schema and archive.
- `search` - Necessary to query.
- `manage` - Necessary to create index schema, archive, and migrate.


## Index state management

Add in the cluster section of permissions for using index state management (ISM):

- `cluster:admin/opendistro/ism/managedindex/add`
- `cluster:admin/opendistro/ism/managedindex/change`
- `cluster:admin/opendistro/ism/managedindex/remove`
- `cluster:admin/opendistro/ism/policy/write`
- `cluster:admin/opendistro/ism/policy/get`
- `cluster:admin/opendistro/ism/policy/delete`

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-privileges
