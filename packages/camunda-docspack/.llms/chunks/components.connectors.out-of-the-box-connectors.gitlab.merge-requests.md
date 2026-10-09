# GitLab connector — Merge requests

### Create merge request

- **GitLab API:** [Create merge request](https://docs.gitlab.com/ee/api/merge_requests.html#create-mr).
- **Project ID:** The global ID or URL-encoded path of the project owned by the authenticated user.
- **Source branch:** Name of the source branch.
- **Target branch:** Name of the target branch.
- **Title:** Title of the merge request.
- **Assignee IDs:** The IDs of the users to assign the merge request to as an array of numbers.
- **Description:** Description of the merge request.
- **Labels:** Comma-separated list of label names for the merge request.
- **Milestone ID:** The ID of a milestone to assign the merge request to.
- **Remove source branch:** Flag indicating if a merge request should remove the source branch when merging.
- **Reviewer IDs:** The ID of the users to set as reviewers of the merge request as an array of numbers.
- **Squash:** Flag indicating if commits should be squashed into a single commit when merging.
- **Target project ID:** Numeric ID of the target project.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/gitlab
