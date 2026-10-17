# Camunda app integrations — What you can do on each platform

| Capability                                       | Microsoft Teams                                                     | Slack                                                                                   |
| :----------------------------------------------- | :------------------------------------------------------------------ | :-------------------------------------------------------------------------------------- |
| Browse user tasks                                | Tasks tab, with filters, sorting, card and list views               | `/camunda tasks`, `/camunda tasks my`, 15 per page                                      |
| Claim a task                                     | Card action and tab button                                          | **Assign to me** button                                                                 |
| Release a task                                   | Card action and tab button                                          | **Unassign** button                                                                     |
| Complete a task                                  | Card form in chat, or in the tab                                    | Modal, opened from the **Complete** button on the task card in your direct message only |
| Assign a task to someone else                    | Not available                                                       | Not available                                                                           |
| Start a process                                  | Chat command and Processes tab                                      | `/camunda start`                                                                        |
| Monitor incidents                                | Incidents tab, with retry                                           | **Not available**                                                                       |
| Personal notifications                           | Yes                                                                 | Yes                                                                                     |
| Channel notifications                            | Yes                                                                 | Yes                                                                                     |
| Create a notification rule                       | Settings tab                                                        | `/camunda subscribe`                                                                    |
| Edit a notification rule                         | Settings tab                                                        | **Not available.** Delete and recreate                                                  |
| Delete a notification rule                       | Settings tab                                                        | `/camunda subscriptions`                                                                |
| Switch organization and cluster                  | Chat command and tab                                                | `/camunda context`                                                                      |
| Wake a suspended cluster                         | Yes, button in chat and in the tab                                  | **Not available.** You are told to resume it from the Camunda Hub                       |
| Visual app surface                               | Full tab app: Tasks, Processes, Incidents, Settings, Cluster status | **None.** The Slack Home tab is empty                                                   |
| Form rendering                                   | Adaptive Cards inline, pop-up dialog for unsupported elements       | Block Kit in a modal, JSON fallback, Tasklist link when unrenderable                    |
| File upload tasks                                | Yes, in the tab                                                     | **Not available**                                                                       |
| Conversations for the App Integrations connector | Yes                                                                 | Yes, feature-equal                                                                      |
| Replies to free text greetings                   | Yes                                                                 | **No.** Free text is offered to a process, and otherwise answered with the help card    |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/app-integrations
