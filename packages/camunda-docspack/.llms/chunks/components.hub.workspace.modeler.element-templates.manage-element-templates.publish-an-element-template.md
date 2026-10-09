# Manage element templates — Publish an element template

After finalizing your element template, click **Publish > Publish to workspace** to activate it within the workspace context. In the modal that opens:

- Update the version number if necessary. You don't need to change it for the initial version or if you have updated it already in the template editor.
  The value entered here is saved to the `version` property in the JSON.
- Assign a distinct version name for effective version management.
- Add a description to explain what changed since the previous version.

Camunda Hub checks the template for conflicts with already-published template versions.
You cannot publish a new version if:

- The template's ID is already used in a published version of a different template file.
- The version number is equal to or lower than the last published version of the same template file with the same template ID.

Camunda Hub also shows a warning if the template ID has changed since the last published version.
You can still publish the new version in this case.

**Note**
Template IDs must be unique across the organization, including for templates that are only published to a project. If a conflicting template ID is already published in another project, publish a new template with a different ID.

As a [user with elevated access](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/collaboration#elevated-access), you can publish an element template version within the organization context, enabling all organization users to use it in their diagrams.
To do so, click **Publish > Publish to organization** on the editor screen or promote a template version via the [versions list](#versioning-connector-templates).

### Manage published element templates

After publishing, an element template version can be applied across all models within the same project or organization, depending on its publication status. You can review the publication status of template versions in the [versions list](#versioning-connector-templates).

At the organization level in Camunda Hub, in the left navigation, click **Shared resources**. Here, you'll can find an overview of all shared resources within your organization.

[Users with elevated access](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/collaboration#elevated-access) can:

- View additional details about the published version.
- Open the resource's versions list (if they are a [Organization Admin or Organization Owner](https://docs.camunda.io/docs/next/components/hub/organization/manage-users/index#elevated-workspace-access) or are a [Workspace Admin or Editor](https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace-members#workspace-roles) of the resource's workspace).
- Unpublish an element template directly from this view.

Organization users without special organization permissions can:

- View all the resources published within the organization.
- Open the resource's versions list (if they are a [Workspace Admin or Editor](https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace-members#workspace-roles) of the resource's workspace).

### Versioning element templates

Element templates use their own numbered versioning, distinct from the [file version history](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/versions) used by diagrams, forms, RPA scripts, README files, and test files. Each publish creates a new numbered version in the template's versions list.

To restore an earlier template version, select it in the versions list and select **Restore**. Restoring publishes the earlier content as a new numbered version. It doesn't create an autosave first, since the version you're restoring from remains available in the versions list.

If you publish a new version of an element template and an older version is already being used in diagrams, the user can either:

- [Update the diagram elements](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/using-templates#updating-templates) to use the most recent version of the element template. You cannot undo this action.
- Continue using the older version of the element template in their diagrams.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates
