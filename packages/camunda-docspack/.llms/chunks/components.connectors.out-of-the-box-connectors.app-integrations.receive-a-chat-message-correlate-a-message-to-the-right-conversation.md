# App Integrations connector — Receive a chat message — Correlate a message to the right conversation

The catch templates set **Conversation** to `=chatMessage.conversationKey`, which is the conversation the process is already in. A process started by the chat start event has `chatMessage` in scope, so a start event and a catch element work together with nothing to configure.

Change **Conversation** only when the key comes from somewhere else, such as the `conversationKey` reported by an earlier [Send message](#send-message) delivery. That is how a process that speaks first waits for the answer.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
