# GitHub connector — Select operation to execute — Release

#### Create a release

- **GitHub API:** [Create a release](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#create-a-release).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Body:** Text describing the contents of the tag.
- **Tag name:** The name of the tag.
- **Release name:** The name of the release.
- **Make latest:** Specifies whether this release should be set as the latest release for the repository. Drafts and pre-releases cannot be set as latest. Defaults to true for newly published releases. Legacy specifies that the latest release should be determined based on the release creation date and higher semantic version. Default: true. Can be one of: true, false, legacy.

#### Update a release

- **GitHub API:** [Update a release](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#update-a-release).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repository:** The name of the repository. The name is not case-sensitive.
- **Release ID:** The unique identifier of the release.
- **Body:** Text describing the contents of the tag.
- **Tag name:** The name of the tag.
- **Release name:** The name of the release
- **Make latest:** Specifies whether this release should be set as the latest release for the repository. Drafts and pre-releases cannot be set as latest. Defaults to true for newly published releases. Legacy specifies that the latest release should be determined based on the release creation date and higher semantic version. Default: true. Can be one of: true, false, legacy.

#### Delete a release

- **GitHub API:** [Delete a release](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#delete-a-release).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repository:** The name of the repository. The name is not case-sensitive.
- **Release ID:** The unique identifier of the release.

#### List releases

- **GitHub API:** [List releases](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#list-releases).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github
