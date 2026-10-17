# Troubleshoot app integrations — Other Slack messages worth searching for

If you were shown one of these messages, look up the row for what it means and what to do:

| Message                                                                                                           | Meaning                                                                                                                                                                                                            |
| :---------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "No Camunda context selected. Run `/camunda context` to choose an organisation and cluster."                      | No organization and cluster is active yet. Run `/camunda context`.                                                                                                                                                 |
| "Couldn't tell which tasks are yours. Your Camunda account isn't a member of this organisation."                  | Your Camunda account has no access to the active organization. Ask an administrator for access.                                                                                                                    |
| "Start with a letter or a number, then use letters, numbers, dots, dashes or underscores. 64 characters at most." | The chat key you entered in `/camunda chat` or a [chat conversation start event](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations#route-a-chat-to-the-right-process) is not in a valid format. |
| "`default` is the key an unconfigured channel already uses. Choose 'Default process' above, or pick another key." | You tried to set the chat key to `default` explicitly. Select **Default process** instead, or choose a different key.                                                                                              |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/troubleshoot
