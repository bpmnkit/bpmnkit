# Manage credentials — Permissions

Every member of your organization who has access to Camunda Hub can see the **Credentials** page and every credential it lists, and can open a credential to see its configuration.

The same members can create, edit, deploy, and delete credentials. Camunda Hub has no separate credential permission, and it doesn't check your organization role, workspace role, or environment access before it saves a credential.

Hub writes a credential to a cluster with your own identity when it deploys, redeploys, or deletes it, so the cluster's own authorizations still apply:

- If a cluster refuses a deployment, Hub reports that environment as failed with the message `Not authorized to perform this operation on this cluster.`
- If a cluster refuses to remove a credential because you lack permission or its credentials are wrong, Hub keeps the credential, so you can resolve the problem and delete it again.
- On a Self-Managed cluster that uses Basic authentication, Hub asks you for the cluster's username and password.

When you choose environments for a credential or for a scan, Hub lists only the environments you can see. Members with the **Organization Owner**, **Organization Admin**, or **DevOps** role see every environment. On Self-Managed, so does any role with the `admin:*` or `admin:clusters` permission. Other members see only the environments assigned to workspaces where they are a **Workspace Admin** or **Editor**. The credential list and detail page still show every credential and all of its targets, and a target in an environment you can't see is shown by its ID.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
