# Sync your Git repository — Sync with remote repository

Organization owners/administrators, workspace administrators, and editors can sync their version of Camunda Hub with the connected repository at any time.

1. In your connected project, click **Sync with \<GitProvider\>**.
2. Enter a [snapshot tag](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/project-versioning#create-a-snapshot) to create a new snapshot for your project. The new snapshot will be created prior to pushing your changes to the central repository.
3. Click **Synchronize**.

In the case of a merge conflict, select between your local Camunda Hub changes and the changes in the remote repository to continue.

Once the pull is complete and any merge conflicts are resolved, Camunda Hub will push its changes. The newly created snapshot is now accessible via the **View snapshot** button in the success notification.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync
