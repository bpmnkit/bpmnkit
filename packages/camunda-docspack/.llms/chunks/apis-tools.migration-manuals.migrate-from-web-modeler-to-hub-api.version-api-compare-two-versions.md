# Migrate from Web Modeler to the Camunda Hub API — Version API — Compare two versions

The compare versions endpoint `GET /versions/compare/{version1Id}...{version2Id}` no longer exists in Camunda Hub API v2.

In Web Modeler API v1, the compare versions endpoint returns a link to a visual comparison between two versions, with `version1Id` as the baseline and `version2Id` as the version being compared.

Instead of making an API request for this link, you can construct it yourself:

1. Get the file and version keys from the search or get version API.
2. Insert the keys into one of the following URL patterns, and open the URL in your browser:

| Resource type    | Template URL                                                                     |
| :--------------- | :------------------------------------------------------------------------------- |
| BPMN             | `{baseURL}/diagrams/{fileKey}/versions/{versionKey1}...{versionKey2}`            |
| Element template | `{baseURL}/connector-templates/{fileKey}/versions/{versionKey1}...{versionKey2}` |
| Form             | `{baseURL}/forms/{fileKey}/versions/{versionKey1}...{versionKey2}`               |
| RPA              | `{baseURL}/rpa-scripts/{fileKey}/versions/{versionKey1}...{versionKey2}`         |

Replace `{baseURL}` with the Camunda Hub base URL. The version keys must be for the same file.

For example:

```bash
https://hub.cloud.camunda.io/diagrams/98634f96-52e9-4c00-8702-893a12803771/versions/2b6fd548-e107-4338-ae59-37a609f65202...78e0f8c5-0462-4521-bff9-5f432d689925
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
