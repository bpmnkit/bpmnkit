# Sync your Git repository — Self-Managed environment variables

Refer to [Configuration of the restapi component](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#git-sync) for details on configuring environment variables.


## Troubleshooting

### File and folder names

- Duplicate file names of the same file type are not allowed within the same folder.
- Duplicate folder names are not allowed within the same parent folder.
- Characters with special meaning in Git (for example, `/`), or characters disallowed by Git, are not allowed in either branch, file, or folder names.

### File extensions

- `.json` files are parsed as either a Connector template or a test scenario file. The operation will fail if the file contents are not valid for either type. If the remote repository contains any `.json` files that are not valid Camunda Hub files, place them in a subfolder so they are automatically ignored during synchronization.
- Git Sync only supports `.md` files named exactly `README.md` (case-sensitive). Multiple `README.md` files are supported in a single repository, including in subfolders.

### Synchronization

- In SaaS, the Git sync payload size must not exceed 4MB. In Self-Managed, you can [configure the `max-in-memory-size`](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#git-sync). If your sync fails because you've exceeded this limit, contact [Camunda success](https://camunda.com/services/support/) for assistance.
- Actions which alter the SHA of the commit to which Camunda Hub is synced (for example, squash) may cause synchronization errors.
- Timeouts may occur during a sync. In the event of a timeout, close the modal and retry the synchronization.
- Using self-hosted instances of Git providers may require additional configuration. Refer to the Camunda Hub configuration part for your [git host](#connect-to-a-remote-repository) and available [environment variables](#self-managed-environment-variables) for more details.
- **(GitHub specific)** A single synchronization action is limited to incorporating a maximum of 250 commits or making changes to up to 300 files, regardless of whether these changes affect the Camunda Hub files directly. Camunda Hub does not provide a notification when these thresholds are exceeded. Should you encounter this limitation, it may be necessary to initiate a fresh synchronization. A fresh synchronization fetches all the files in the repository without relying on the incremental changes, thus bypassing the limitations. This can be achieved by either changing the branch or modifying the GitHub repository URL.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync
