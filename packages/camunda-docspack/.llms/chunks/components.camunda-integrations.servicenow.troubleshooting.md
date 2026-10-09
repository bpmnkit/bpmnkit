# Troubleshooting

Resolve common issues with the Camunda–ServiceNow integration and ensure workflows run reliably.

Resolve common issues encountered while setting up or using the Camunda–ServiceNow integration and follow recommended actions to fix them.


## ServiceNow

| Issue                     | Possible cause                                                | Recommended action                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camunda Spoke not visible | Spoke not installed correctly or insufficient permissions.    | Confirm the Camunda Spoke is installed from the [ServiceNow Store](https://store.servicenow.com/store/app/aac1b64fc3803290ef46d0af050131d0) and that you are logged in as an administrator. |
| Flow doesn’t trigger      | Trigger conditions misconfigured or Integration Hub inactive. | Review flow trigger settings and ensure the required Integration Hub plugins are active.                                                                                                    |
| Authentication failures   | OAuth profile misconfigured or invalid Camunda credentials.   | Verify the Client ID, Client Secret, and Token URL. Check the OAuth profile settings in ServiceNow.                                                                                         |
| Missing required plugins  | IntegrationHub packs (e.g., Enterprise Pack) not installed.   | Install the required plugins listed in [Prerequisites](https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/prerequisites).                                                                                                                 |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/troubleshooting
