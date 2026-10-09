# Manage and review project snapshots — Request a review

1. Request a review for the newest snapshot of the project from the snapshots page of the project. Members with edit permission in your project will see a notification on the process diagram page once you have requested a review. Reviews cannot be performed by the user who created the project snapshot unless the user is an organization administrator.
2. Reviewers can view the changes, comment, request changes, or approve the project snapshot.
3. After a user has submitted their review, the project snapshot is marked as reviewed and the review status is shown in the snapshots timeline.
   1. Any user with edit permissions can go back and edit the review at any point in time to update the assessment.
4. If the reviewer has marked the snapshot as **Changes requested**, you can address the feedback by performing the requested changes, creating a new snapshot, and requesting a review for the new snapshot.

This review capability is most useful for reviews on a business level.
For technical reviews, you may instead [sync your Git repository](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync) to put changes into a technical context with related code changes.

After the review is complete, you can promote the project snapshot to the next stage(s) of the [deployment pipeline](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project). For example, promote to your testing cluster/stage, then to staging, and finally to production.

**Info**
If you want to use your own deployment pipeline after the review is complete, you can [sync your Git repository](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync) at this point to deploy and promote the project through your own pipeline.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/project-versioning
