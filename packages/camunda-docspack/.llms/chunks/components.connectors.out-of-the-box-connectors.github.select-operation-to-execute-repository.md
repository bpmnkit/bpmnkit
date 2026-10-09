# GitHub connector — Select operation to execute — Repository

#### List organization repositories

- **GitHub API:** [List organization repositories](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-organization-repositories).
- **Organization name:** The organization name. The name is not case-sensitive.

#### Create an organization repository

- **GitHub API:** [Create an organization repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#create-an-organization-repository).
- **Organization name:** The organization name. The name is not case-sensitive.
- **Repository name:** The organization name. The name is not case-sensitive.
- **Description:** A short description of the repository.
- **Home page:** A URL with more information about the repository.
- **Visibility:** The visibility of the repository. Can be one of: public, private.

#### Get a repository

- **GitHub API:** [Get a repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.

#### Update a repository

- **GitHub API:** [Update a repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#update-a-repository).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Repository name:** The organization name. The name is not case-sensitive.
- **Description:** A short description of the repository.
- **Home page:** A URL with more information about the repository.
- **Visibility:** The visibility of the repository. Can be one of: public, private.

#### Delete a repository

- **GitHub API:** [Delete a repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#delete-a-repository).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.

#### List repository contributors

- **GitHub API:** [List repository contributors](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.

#### Get repository content

- **GitHub API:** [Get repository content](https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Path:** The path of the content within the repository.
- **Ref:** The name of the commit/branch/tag. Defaults to the repository’s default branch.

#### Create or update file contents

- **GitHub API:** [Create or update file contents](https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#create-or-update-file-contents).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Path:** The path of the content within the repository.
- **Branch:** The name of the target branch for the new commit. Defaults to the repository’s default branch.
- **Commit message**: The commit message for the file change.
- **Content**: A string or [document reference](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/components/document-handling/getting-started). If your content is already base64 encoded, please check the **Content is already base64 encoded** checkbox.
- **SHA**: The blob SHA of the file being replaced. If you are creating a new file, this parameter is not required.
  Use [Get repository content](#get-repository-content) to retrieve the SHA of an existing file.
- **Use custom author/committer**: If checked, you can specify custom author and committer information. Otherwise, the author and committer will be the owner of the PAT.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github
