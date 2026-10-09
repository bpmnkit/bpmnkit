# Overview — UI configuration

Customize the Optimize UI e.g. by adjusting the logo, head background color etc.

| YAML path                     | Environment variable                            | Default value | Description                                                                                                                                                              |
| ----------------------------- | ----------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ui.logoutHidden               | CAMUNDA_OPTIMIZE_UI_LOGOUT_HIDDEN               | false         | Setting this property to true will hide the logout option from the user menu. This is useful if you are using single sign-on and it is not possible for users to logout. |
| ui.maxNumDataSourcesForReport | CAMUNDA_OPTIMIZE_UI_MAX_NUM_REPORT_DATA_SOURCES | 100           | The maximum number of data sources available for a report. The minimum value is two, the maximum is 1024.                                                                |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
