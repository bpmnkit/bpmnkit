# Get started with the catalog

Set up a reusable asset catalog in Camunda Hub by syncing element templates from your Git repository using CI/CD.

Set up your repository and CI/CD pipelines to publish assets to the Camunda Hub catalog.


## About the catalog workflow

With the following workflow, you can manage and use assets in the Camunda Hub catalog:

1. Store element templates and their metadata in a Git repository.
2. Create a CI/CD pipeline to submit the complete set of element templates to the Camunda Hub catalog API every time the assets change.
3. Camunda Hub compares the submission against its stored state and publishes applicable changes.
4. When modeling in Camunda Hub, delivery teams discover and apply the latest templates from the catalog.

This guide covers steps one and two of this workflow.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
