# UiPath connector — Appendix

### Using UiPath connector best practice

There is no guarantee a queue item will be processed right away. In that case, we suggest building your BPMN diagram to periodically retry polling.
To learn more, see an entry _Solution with Timer and Loop_ at [Camunda BPMN examples](https://camunda.com/bpmn/examples/) page.

**Note**
To avoid performance issues, it is recommended to limit the number of loop retries.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/uipath
