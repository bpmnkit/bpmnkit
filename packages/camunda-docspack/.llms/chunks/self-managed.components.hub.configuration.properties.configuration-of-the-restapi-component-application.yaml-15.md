# Property reference — Configuration of the `restapi` component — application.yaml

| Property                                                 | Description                                                                                                                                                                                                                                                                                          | Example value | Default value |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- |
| `camunda.hub.feature.play-enabled`                       | [optional]Enables the [**Test** mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process) in the BPMN editor, allowing users to test processes in a playground environment.                                                                                           | `true`        | `true`        |
| `camunda.hub.feature.bpmn-deployment-enabled`            | [optional]Enables the [**Deploy** and **Run**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process) actions in the BPMN editor.When disabled, it prevents users from deploying and starting instances of processes via the UI.                                     | `false`       | `true`        |
| `camunda.hub.feature.dmn-deployment-enabled`             | [optional]Enables the [**Deploy**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process) action in the DMN editor.When disabled, it prevents users from deploying decisions via the UI.                                                                             | `false`       | `true`        |
| `camunda.hub.feature.dynamic-cluster-management-enabled` | [optional]Enables or disables [dynamic cluster management](#dynamic-cluster-management).                                                                                                                                                                                                        | `true`        | `false`       |
| `camunda.hub.feature.ui-user-invite-enabled`             | [optional]Enables the **Add members** button on the workspace **Members** page for users who aren't **Organization admins**. **Organization admins** always see the button, regardless of this setting. Adding members through the [Hub API](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/overview) is unaffected. | `false`       | `true`        |
| `camunda.marketplace.enabled`                            | [optional]Enables the integration of the [Camunda Marketplace](https://marketplace.camunda.com). If enabled, users can browse the Marketplace and download [resources](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/camunda-marketplace) directly inside Camunda Hub.               | `false`       | `true`        |

Example configuration:

```yaml
camunda:
  hub.feature:
    test-mode-enabled: true
    bpmn-deployment-enabled: true
    dmn-deployment-enabled: true
    dynamic-cluster-management-enabled: false
    ui-user-invite-enabled: true

  marketplace:
    enabled: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
