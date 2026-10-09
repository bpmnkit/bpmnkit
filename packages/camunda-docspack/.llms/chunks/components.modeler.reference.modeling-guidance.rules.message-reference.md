# Message reference

Reference for the `message-reference` rule.

A message event or receive task must reference a message defined in the process. To fix this problem, open the **Message** group in the properties panel on the right side of the screen and select or create a message. The referenced message must have a defined correlation key (refer to [message subscriptions](https://docs.camunda.io/docs/next/components/concepts/messages#message-subscriptions)).


## (guideline) No message selected

![No message selected](./img/message-reference/wrong-no-message-reference.png)


## (guideline) Message selected

![Message selected](./img/message-reference/right.png)


## References

- [Messages](https://docs.camunda.io/docs/next/components/concepts/messages)
- [Rule source](https://github.com/camunda/bpmnlint-plugin-camunda-compat/blob/main/rules/camunda-cloud/message-reference.js)

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/message-reference
