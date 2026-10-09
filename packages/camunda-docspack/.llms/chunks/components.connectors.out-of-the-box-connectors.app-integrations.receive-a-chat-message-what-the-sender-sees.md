# App Integrations connector — Receive a chat message — What the sender sees

| Situation                                                                                                               | What happens                                                                                                  |
| :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| A process is holding the conversation.                                                                                  | The message reaches the process, and the Camunda app stays quiet so the two don't overlap.                    |
| The person types a word the Camunda app understands, such as `help`.                                                    | The Camunda app answers. Commands take precedence over the process.                                           |
| The person hasn't connected their Camunda account.                                                                      | They're prompted to connect, and no message is sent to a process.                                             |
| The channel or chat uses the default process, and the person can reach more than one cluster without having chosen one. | They're asked to select an organization and cluster first.                                                    |
| The person can't reach the cluster the channel or chat is configured for.                                               | The message reaches no process. Give them access to that cluster, or point the channel at one they can reach. |
| The channel or chat is turned off.                                                                                      | The message reaches no process, and the Camunda app answers with its help message.                            |
| No deployed process uses the chat key.                                                                                  | Nothing happens, and the Camunda app doesn't answer.                                                          |

A reply always reaches the cluster whose process asked the question, even if the person switches to a different cluster while the conversation is open.

**Note**
Tell people which words your conversation shouldn't use. Words the Camunda app already understands, such as `help`, reach the app rather than your process.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
