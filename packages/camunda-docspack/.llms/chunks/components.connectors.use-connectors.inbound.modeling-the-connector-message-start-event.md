# Use an inbound connector — Modeling the connector message start event

1. Start building your BPMN diagram with a message start event (non-interrupting).
2. Change its template to an inbound connector of your choice (for example, HTTP webhook or a message queue subscription), by clicking the **Select** button in the **Template** section in the **Properties** sidebar of the start event element.
3. Fill in all required properties.
4. Configure the **Correlation** section, if an event subprocess is used.

- If you are setting up a non-interrupting message start event for a subprocess, select **Correlation required** and specify the **Correlation key (process)** and **Correlation key (payload)** values.
- If you are setting up a message start event for a regular process (not a subprocess), skip the correlation settings.

5. Complete your BPMN diagram.
6. Deploy it to your Camunda 8 instance.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/inbound
