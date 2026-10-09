# Test your process — Operate vs. Test mode

[Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) is designed to monitor many production process instances and intervene only as necessary, while Test mode is designed to drive a single process instance through the process and mock external systems.

Both offer monitoring of a single process instance, its variables and path, incidents, and actions to modify or repair a process instance. Operate offers bulk actions and guardrails against breaking production processes, while Test mode offers a streamlined UX to run through test cases quickly.


## Limitations and availability

This section explains why you might not see the **Test** tab, and any additional limitations.

For more information about terms, refer to our [licensing and terms page](https://legal.camunda.com/licensing-and-other-legal-terms#c8-saas-trial-edition-and-free-tier-edition-terms).

**Version compatibility:** Test mode is compatible with cluster versions starting from 8.10 and higher.

### Camunda 8 SaaS

In Camunda 8 SaaS, Test mode is available to all Camunda Hub users with commenter, editor, or admin permissions within a project.
Additionally, within their organization, users need to have a [role](https://docs.camunda.io/docs/next/components/hub/organization/users-and-roles#roles-and-permissions) which has deployment privileges. [If authorizations are enabled on the environment, users need to have specific permissions instead.](#authorizations)

### Camunda 8 Self-Managed

<!-- NEEDS VERIFICATION -->

In Self-Managed, Test mode is controlled by the `camunda.hub.feature.test-mode-enabled` [configuration property](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#feature-flags) in Camunda Hub. This is `true` by default for the Docker and Kubernetes distributions.

Prior to the 8.10 release, Test mode can be accessed by installing the 8.10.0-alpha [Helm charts](https://github.com/camunda/camunda-platform-helm/blob/camunda-platform-10.4.0/charts/camunda-platform-alpha), or running the 8.10.0-alpha [Docker Compose](https://github.com/camunda/camunda-distributions/tree/main/docker-compose) configuration.

### Features

- [Decision table rule](https://docs.camunda.io/docs/next/components/modeler/dmn/decision-table-rule) evaluations are not viewable from Test mode. However, they can be inferred from the output variable, or can be viewed from Operate.
- Currently, Test mode supports displaying up to 100 flow node instances in the instance history panel, 100 variables in the variables panel, and 100 process instances on the process definition page. To access all related data, you can use Operate.
- While you can still interact with your process instance in Test mode (for example, completing jobs or publishing messages), you may be unable to resolve incidents if they occur beyond the 100th flow node instance, as Test mode does not track them. In this case, incident resolution can be managed in Operate.
- User tasks with a job worker implementation are deprecated and no longer supported in Test mode from cluster versions 8.8 and above. Please consider migrating to [Camunda user tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks#camunda-user-tasks).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
