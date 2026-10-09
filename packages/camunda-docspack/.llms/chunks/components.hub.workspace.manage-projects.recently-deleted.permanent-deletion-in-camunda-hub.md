# Recover deleted resources — Permanent deletion in Camunda Hub

Permanent deletion occurs 30 days after a resource is deleted. This removes all associated data, including resource content, version history, metadata, and Git links.

**Note**
Using the [public API](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/permanently-delete-file.api), a client with `delete` permissions can permanently delete a resource before the 30-day window has expired:

```bash
DELETE /api/v2/files/{fileKey}/permanent
```


## Purge a file from versions

If you delete a file within a project, its data is preserved in [older versions](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/versions), if applicable. To permanently delete the file and its data from the file's entire history, a client with `delete` permissions can call the [public purge endpoint](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/purge-file.api):

```bash
DELETE /api/v2/files/{fileKey}/purge
```

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/recently-deleted
