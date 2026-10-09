# Integrate Camunda Hub into CI/CD — Setup — Triggering CI/CD

You need triggers to initiate the pipeline for files or projects. Choose between manual pipeline start or automatic background triggers based on events. Common approaches include:

- Initiating the pipeline manually from your CI/CD tool/platform by uploading the file intended for deployment.
- Starting the CI pipeline by creating a pull/merge request in the version control system.
- Triggering pipelines by listening to versions with certain characteristics.

#### Sync files with version control

Synchronize files between Camunda Hub and version control systems (VCS) and vice versa. Manage both files and projects by using a complete set of CRUD (create, read, update, delete) operations provided by the Camunda Hub API. By syncing files from Camunda Hub to your VCS, you benefit from full file ownership and avoid duplicated data housekeeping.

For automatic file synchronization, consider maintaining a secondary system of record for mapping Camunda Hub projects to VCS repositories. This system also monitors the project-to-repository mapping and updates timestamps.

#### Example: Poll latest file edits

To listen to file changes in Camunda Hub, you currently need to implement a polling approach that compares the update dates with the last sync dates recorded.

[Search for project files](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/search-files.api) that have been updated since the last sync:

```json title="POST /api/v2/files/search"
{
  "filter": {
    "projectKey": "56a98f55-7c53-4e7b-83b7-c58856ee39e4",
    "updated": {
      "$gt": "2026-08-30T09:22:15.665653Z"
    }
  },
  "page": {
    "from": 0,
    "limit": 50
  }
}
```

**Note**
All responses for `search` endpoints are paginated. Make sure you obtain all relevant pages.

[Get the content for each file](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/get-file.api):

```shell
GET /api/v2/files/{fileKey}
```

With this file data, you can create a pull request and sync the file contents with your repository.

Real-time synchronization isn't always what you need. Consider Camunda Hub as a local repository, and update your remote repository only after files are committed and pushed. This aligns with the concept of [versions](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/versions).

#### Example: Poll new file versions

A version reflects a state of a file in Camunda Hub with a certain level of qualification, such as being ready for deployment. You can use this property to trigger deployments when a certain version is created. You can poll the Camunda Hub API to know when a project file has a new version.

[Search for all project files](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/search-files.api):

```json title="POST /api/v2/files/search"
{
  "filter": {
    "projectKey": "56a98f55-7c53-4e7b-83b7-c58856ee39e4"
  },
  "page": {
    "from": 0,
    "limit": 50
  }
}
```

This returns a list of files. You'll use the `fileKey` property to search for versions.

[Get the file versions](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/search-versions.api) for all project files. Filter for files whose versions are newer than the last sync date:

```json title="/api/v2/versions/search"
{
  "filter": {
    "fileKey": {
      "$in": [
        "2afd9a1e-5ea8-43e3-b45b-6fb96b384a14",
        "2386e244-b2c0-4feb-8b68-4429c0cdf0c5"
      ]
    },
    "created": {
      "$gt": "2026-08-31T11:07:45.924036Z"
    }
  },
  "page": {
    "from": 0,
    "limit": 50
  }
}
```

[Get the content for each version](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/get-version.api):

```shell
GET /api/v2/versions/{versionKey}
```

With this version data, you can create a pull request and sync the file contents with your repository.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/integrate-modeler-in-ci-cd
