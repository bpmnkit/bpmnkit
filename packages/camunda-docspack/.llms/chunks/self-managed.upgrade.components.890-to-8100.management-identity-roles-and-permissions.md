# Upgrade Camunda components from 8.9 to 8.10 — Management Identity roles and permissions

Management Identity only adds roles, applications, and permissions on startup; it never removes them. As a result:

- If you hold the `Console` role, you automatically gain management access to Hub's cluster pages through a new `admin:clusters` permission after upgrading. No manual role reassignment is required. `DevOps` is the forward-looking name for the same access.
- If you hold the `Web Modeler Admin` role, you also automatically gain full access to Hub's cluster pages after upgrading — a broader grant than the Console role's management-only access, since `admin:*` also carries modeler-admin capabilities. In 8.9, this role's `admin:*` permission only covered Web Modeler super-user mode and publishing connector templates; in 8.10, the same permission additionally reaches Hub's cluster pages. No manual role reassignment is required. `Hub Admin` is the forward-looking name for the same access.
- After upgrading, your Keycloak also gains roles named `Hub` and `Hub Admin`, provisioned alongside your existing `Web Modeler` and `Web Modeler Admin` roles (which are kept for backward compatibility and keep working unchanged). This applies to every installation, not just new ones, so you may see both name pairs after upgrading. Both name pairs grant identical permissions; assign whichever name makes sense for your users.
- The standalone Keycloak `Console` application and `console-api` audience are no longer provisioned by Management Identity. Console's cluster-management pages are now part of the Hub UI application, so a separate OIDC application/client for Console is no longer needed. Your existing `console` client and its role mappings are **not** deleted automatically. If you no longer need them, remove them manually from Keycloak (or your OIDC provider).

If you rely on least-privilege access to cluster management, review who holds the `Console` and `Web Modeler Admin` / `Hub Admin` roles before upgrading. See the [8.10 release announcements](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements#console-and-web-modeler-admin-roles-gain-new-hub-cluster-access-on-self-managed) for a summary of this and other Hub role changes in 8.10.

For the full list of default roles, applications, and permissions in 8.10, see [manage roles](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-roles) and [manage access and permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
