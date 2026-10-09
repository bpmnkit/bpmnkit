# GitHub connector — Select operation to execute — Branches

#### List branches

- **GitHub API:** [List branches](https://docs.github.com/en/rest/branches/branches?apiVersion=2022-11-28#list-branches).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.

#### Get a branch

- **GitHub API:** [Get a branch](https://docs.github.com/en/rest/branches/branches?apiVersion=2022-11-28#get-a-branch).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Branch:** The name of the branch. Cannot contain wildcard characters. To use wildcard characters in branch names, use the GraphQL API.

#### Merge a branch

- **GitHub API:** [Merge a branch](https://docs.github.com/en/rest/branches/branches?apiVersion=2022-11-28#merge-a-branch).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Base:** The name of the base branch that the head will be merged into.
- **Head:** The head to merge. This can be a branch name or a commit SHA1.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github
