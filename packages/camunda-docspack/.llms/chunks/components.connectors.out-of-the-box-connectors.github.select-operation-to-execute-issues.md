# GitHub connector — Select operation to execute — Issues

#### Create an issue

- **GitHub API:** [Create an issue](https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#create-an-issue).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Title:** The title of the issue.
- **Body:** The contents of the issue.
- **Assignees:** Logins for users to assign to this issue. Only users with push access can set assignees for new issues. Assignees are silently dropped otherwise.
- **Labels:** Labels to associate with this issue. Only users with push access can set labels for new issues. Labels are silently dropped otherwise.
- **Milestone:** The number of the milestone to associate this issue with or use null to remove the current milestone. Only users with push access can set the milestone for issues. Without push access to the repository, milestone changes are silently dropped.

#### Get an issue

- **GitHub API:** [Get an issue](https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#get-an-issue).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Issue number:** The number that identifies the issue.

#### Update an issue

- **GitHub API:** [Update an issue](https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#update-an-issue).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Issue number:** The number that identifies the issue.
- **Title:** The title of the issue.
- **Body:** The contents of the issue.
- **Assignees:** Logins for users to assign to this issue. Only users with push access can set assignees for new issues. Assignees are silently dropped otherwise.
- **Labels:** Labels to associate with this issue. Only users with push access can set labels for new issues. Labels are silently dropped otherwise.
- **Milestone:** The number of the milestone to associate this issue with or use null to remove the current milestone. Only users with push access can set the milestone for issues. Without push access to the repository, milestone changes are silently dropped.
- **Issue state:** The open or closed state of the issue. Can be open or closed.
- **State reason:** The reason for the state change. Ignored unless state is changed. Can be one of: completed, not_planned, reopened, null.

#### Create an issue comment

- **GitHub API:** [Create an issue comment](https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#create-an-issue-comment).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.
- **Issue number:** The number that identifies the issue.
- **Body:** The contents of the comment.

#### Search issue

- **GitHub API:** [Search issue](https://docs.github.com/en/rest/search?apiVersion=2022-11-28#search-issues-and-pull-requests).

- **Query:** The query contains one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub. The GitHub REST API supports the same qualifiers as the web interface for GitHub. To learn more about the format of the query, refer to [constructing a search query](https://docs.github.com/en/rest/search?apiVersion=2022-11-28#constructing-a-search-query). Refer to [searching issues and pull requests](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests) for a detailed list of qualifiers.

#### List commits

- **GitHub API:** [List commits](https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#list-commits).
- **Owner:** The account owner of the repository. The name is not case-sensitive.
- **Repo:** The name of the repository. The name is not case-sensitive.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github
