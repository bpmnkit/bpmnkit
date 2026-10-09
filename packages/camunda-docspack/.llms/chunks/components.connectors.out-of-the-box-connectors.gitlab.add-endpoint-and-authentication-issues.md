# GitLab connector — Add endpoint and authentication — Issues

#### Get an issue by ID

- **GitLab API:** [Single project issue](https://docs.gitlab.com/ee/api/issues.html#single-project-issue).
- **Project ID:** The global ID or URL-encoded path of the project owned by the authenticated user.
- **Issue ID:** The internal ID of a project’s issue.

#### Create an issue

- **GitLab API:** [New issue](https://docs.gitlab.com/ee/api/issues.html#new-issue).
- **Project ID:** The global ID or URL-encoded path of the project owned by the authenticated user.
- **Title:** The title of an issue.
- **Description:** The description of an issue.

#### Delete an issue

- **GitLab API:** [Delete an issue](https://docs.gitlab.com/ee/api/issues.html#delete-an-issue).
- **Project ID:** The global ID or URL-encoded path of the project owned by the authenticated user.
- **Issue ID:** The internal ID of a project’s issue.

#### Comment to an issue

- **GitLab API:** [Create a new issue note](https://docs.gitlab.com/ee/api/notes.html#create-new-issue-note).
- **Project ID:** The global ID or URL-encoded path of the project owned by the authenticated user.
- **Issue ID:** The internal ID of a project’s issue.
- **Note text:** The content of a note.
- **Level of confidentiality:** Indicates if an issue has to be marked as **internal** or not.

#### Search issues

- **GitLab API:** [List issues](https://docs.gitlab.com/ee/api/issues.html#list-issues).
- **Scope:** Return issues for the given scope: **Created by me**, **Assigned to me**, or **all**.
- **State:** Return all issues or just those that are **opened** or **closed**.
- **Assignee ID:** Return issues assigned to the given user ID. Mutually exclusive with **Assignee username**. **None** returns unassigned issues. **Any** returns issues with an assignee.
- **Assignee username:** Return issues assigned to the given username. Similar to **Assignee ID** and mutually exclusive with **Assignee ID**.
- **Author ID:** Return issues created by the given user ID.
- **Contains text:** Search issues against their **Title** and **Description**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/gitlab
