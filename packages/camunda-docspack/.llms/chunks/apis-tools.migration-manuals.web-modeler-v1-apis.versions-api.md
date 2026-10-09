# Process application management in Web Modeler API v1 — Versions API

### Version individual process application files

With `POST /api/v1/versions`, you can now publish a new version for process application files. Previously, this endpoint returned a `400 BAD REQUEST` because files were intended to be versioned as part of the process application. See [process application versioning model](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/whats-new-in-810#process-application-versioning-model) for a deeper explanation of this change.

A project snapshot references each element template's last published version, not any unpublished draft changes, so creating a snapshot never creates a new element template version.


## Create a process application

Create process applications with the new [`POST /api/v1/process-applications` endpoint](https://modeler.camunda.io/swagger-ui/index.html#/Process%20Applications/createProcessApplication).

Previously, you could create files and folders at the project root without a process application. Now, files and folders must be stored in a process application. With this endpoint, you can create an entire file structure with the API, including the container process application.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/web-modeler-v1-apis
