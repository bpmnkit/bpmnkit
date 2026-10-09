# GitLab connector — Add endpoint and authentication — Repository files

#### Create new file in repository

- **GitLab API:** [Create new file in repository](https://docs.gitlab.com/ee/api/repository_files.html#create-new-file-in-repository).
- **Project ID:** The global ID or URL-encoded path of the project owned by the authenticated user.
- **Branch name:** Name of the new branch to create the file in. The commit is added to this branch.
- **Commit message:** Message of the commit that adds the new file.
- **Content:** The content of the new file.
- **File path:** URL-encoded full path to new file. For example, `lib%2Fclass%2Erb`.
- **Author email:** The commit author's email address.
- **Author name:** The commit author's name.
- **Encoding:** The encoding of the content. GitLab's default is `text`.
- **Execute file mode:** Enables or disables the `execute` flag on the file.
- **Start branch:** The branch to start the new branch from.
- **Allow collaboration:** Allow commits from members who can merge to the target branch.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/gitlab
