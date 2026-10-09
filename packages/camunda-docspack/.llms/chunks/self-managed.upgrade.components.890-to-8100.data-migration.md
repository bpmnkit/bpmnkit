# Upgrade Camunda components from 8.9 to 8.10 — Data migration

When you upgrade to Camunda 8.10, your data is automatically migrated to the [new organizational structure](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/whats-new-in-810#new-file-structure-and-requirements).

Camunda recommends you create a backup before the migration to ensure your data is recoverable in its original state if anything goes wrong. If you notice anything unexpected after the migration, contact support.

**Note**
Because you're upgrading to 8.10, you may not yet be familiar with the new [Camunda Hub terminology](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/whats-new-in-810#terminology). This sections uses Web Modeler terminology, including projects and process applications, to explain the data migration. However, before using the Camunda Hub UI, you should familiarize yourself with the [new terminology](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/whats-new-in-810#terminology), including workspaces and projects.

During the migration:

- Any process application nested inside a folder is moved to the top level of its project.
- Any files or folders located directly in a project, not inside a process application, is automatically grouped in a new process application, named `YOUR PROJECT NAME - General`. You can rename this application, [move content out of it](#organize-the-general-process-application), or otherwise reorganize it as with any other process application.
- Git sync and cluster settings on existing process applications migrate unchanged along with your data.

During the migration, Web Modeler is briefly unavailable. Clusters and running processes are unaffected and continued executing normally.

The migration does not affect the following resources:

| Area                                | Impact                                                                                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Running process instances           | Orchestration Clusters, engines, and running process instances are unaffected. Web Modeler and Camunda Hub remain independent of the runtime path.          |
| Redeployment                        | Existing deployments remain on their clusters and continue running. The migration does not require redeployment.                                            |
| Clusters and configuration          | Cluster and deployment settings attached to existing process applications migrate with the data and remain unchanged.                                       |
| Files, folders, and version history | All files, folders, versions, and history are preserved. Only their location within the project changes.                                                    |
| Git-synced projects                 | The migration does not modify process applications or their contents. Files connected through Git sync remain in the same repository with the same history. |
| Desktop Modeler                     | Desktop Modeler is unaffected because it has no direct connection to Web Modeler. Content shared through Git sync is also unaffected.                       |

If you automate against the Web Modeler API, the migration may affect automation that relies on file or folder locations. Web Modeler API v1 returns files and folders from their new locations. Requests that create an item at a project's root are redirected to the new `YOUR PROJECT NAME - General` process application, and the response reflects the new location.

Review any automation that relies on file or folder locations. A small number of folder API integrations were affected more directly. If you use the folder API with process applications, contact support to confirm whether your integration needs updates.

#### Organize the "General" process application

During the migration, any files or folders located directly in a project, not inside a process application, were automatically grouped in a new process application, named "YOUR PROJECT NAME - General". This process application is a temporary container for loose files and folders. Camunda recommends organizing these resources into process applications that reflect their purpose for better long-term discoverability and maintainability.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
