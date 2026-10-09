# Amazon DynamoDB connector — Using DynamoDB connector best practice

When using the DynamoDB connector in a BPMN process, it is important to keep in mind that there is no guarantee that a requested item will be retrieved or updated immediately. In this case, it is recommended to build your BPMN diagram to periodically retry polling until the item is available.

**Note**
To avoid performance issues, it is recommended to limit the number of retries.

To learn more about implementing retry logic in your BPMN diagram, you can refer to the [Camunda BPMN examples](https://camunda.com/bpmn/examples/) page, which includes examples of BPMN diagrams with timer and loop configurations.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
