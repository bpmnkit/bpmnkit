# Get started with the catalog — Prerequisites

You need these prerequisites before following the steps in this guide:

- A Camunda 8 [SaaS](https://signup.camunda.com/) or [Self-Managed](https://docs.camunda.io/docs/next/self-managed/about-self-managed) account with an active organization.
- A Git repository where you'll store your element templates.
- CI/CD infrastructure for that repository.

This guide assumes you store your catalog assets in a single repository. If you store your assets across several repositories, [consolidate them into one repository](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/sync-multiple-repositories) before publishing them.


## Use the example repository

To get started, create your own repository from the [example catalog repository](https://github.com/camunda/catalog-template):

1. On the [example repository page](https://github.com/camunda/catalog-template), click **Use this template > Create a new repository**, and create the repository in your own account or organization. Don't fork the example repository. Use a template so your repository is an independent copy.
1. (Optional) Clone your new repository to your local machine. This isn't required for the sync, which runs in CI. You only need a local clone to work on assets locally or run the sync script by hand.

The example repository contains:

- Placeholder element templates.
- A ready-to-use [sync script](https://github.com/camunda/catalog-template/blob/main/scripts/sync-catalog.sh).
- A [GitHub Actions workflow](https://github.com/camunda/catalog-template/blob/main/.github/workflows/sync-catalog.yml) that submits the full state on every push to `main`.

The rest of this guide assumes you're using the sync script and GitHub Actions workflow from this example repository.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
