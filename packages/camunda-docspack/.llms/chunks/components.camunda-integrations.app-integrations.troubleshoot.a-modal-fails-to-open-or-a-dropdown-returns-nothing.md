# Troubleshoot app integrations — A modal fails to open or a dropdown returns nothing

| Symptom                    | Cause                                                        | Fix                  |
| :------------------------- | :----------------------------------------------------------- | :------------------- |
| A modal fails to open      | The interactivity request URL is missing from the app config | Reapply the manifest |
| A dropdown returns nothing | The options load request URL is missing from the app config  | Reapply the manifest |

Both the interactivity and options load requests point at the same request URL as the slash command: `<backend>/api/slack/events`.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/troubleshoot
