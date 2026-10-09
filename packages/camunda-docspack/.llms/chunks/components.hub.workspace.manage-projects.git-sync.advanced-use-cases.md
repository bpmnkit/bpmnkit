# Sync your Git repository — Advanced use cases

Git sync supports a variety of development workflows, including the following advanced use cases.

### Monorepos

A monorepo is a single repository containing multiple logical projects that each have disparate workflows and release cadences.

To set up Git sync with a monorepo, you can specify the **path** to your project during the configuration. This allows you to keep multiple projects in one repository, each with its own sync configuration.

**Note**
If you are using Git sync to work with monorepos, you should pull changes regularly, as the GitHub API is limited to a fixed amount of files and commits per synchronization action. See [troubleshooting](#troubleshooting) for more information.

### Parallel feature development

Git sync supports parallel feature development by allowing multiple projects to be connected to different feature branches. This allows teams to work on multiple features simultaneously without interfering with each other's work.

To use Git sync for parallel feature development:

1. Create a new [project](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/create-a-project) in Camunda Hub for each active feature branch you want to develop.
2. Configure Git sync for each instance by connecting it to the corresponding feature branch in your repository.
3. Work on your feature in Hub, using **Sync with \<GitProvider\>** to pull and push changes as needed.
4. Once the feature is complete and merged into the main branch, you can delete the project associated with the feature branch.

To perform hotfixes or patches of production or production-bound processes, sync a copy of the project to the `main` branch.

**Caution**
Creating multiple copies of a project can complicate navigation and deployment if you have multiple files with the same ID in a project. To avoid this, you can create copies of the project in different projects.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync
