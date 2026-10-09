# Microsoft 365 email inbound connector — Create a Microsoft 365 email inbound connector event — Activation condition

**Activation condition** is an optional FEEL expression field that allows for fine-tuning of connector activation. This condition filters whether the process step triggers when an email is consumed.

For example, `=(subject = "Order Confirmation")` only triggers the start event or continues the catch event if the email subject matches exactly. Leave this field empty to trigger your process for every email that matches the filtering criteria.

**Note**
The activation condition is evaluated after the email filter. Use email filters for simple conditions and activation conditions for complex FEEL-based logic.

When an email matches the filter but does not meet the activation condition, the connector does not trigger and the email is not processed (not marked as read, deleted, or moved). This means the email will be fetched again on the next polling cycle. To change this behavior, enable the **Consume unmatched events** checkbox in the **Activation** section. Learn more about [consuming unmatched events](https://docs.camunda.io/docs/next/components/connectors/use-connectors/inbound#consume-unmatched-events).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
