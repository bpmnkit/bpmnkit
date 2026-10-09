# Inbound connector lifecycle — Modify an existing inbound connector element

Editing certain configuration on an already-deployed inbound connector element can cause unexpected behavior instead of a clean update.

The connector runtime can derive internal state, such as a consumer or subscription identity, from an element's configuration only when the element activates. Editing that configuration in place does not necessarily recompute the derived state to match, which can lead to inconsistent or failed behavior. When in doubt, delete the inbound connector element and create a new one instead of editing its configuration in place.

[Element templates](https://docs.camunda.io/docs/next/components/modeler/element-templates/about-templates) are also versioned, and each BPMN element references the specific template version it was created with. When a newer template version adds a new property, an already-deployed element keeps using its original template version, so the property is simply absent from that element, and the element keeps its prior default behavior. Upgrading the Camunda runtime alone does not change this. To adopt a new template version's property or behavior on an existing element, [update the element to the new template version](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/using-templates#updating-templates) in Camunda Modeler, and redeploy the diagram.

The Kafka consumer connector illustrates both behaviors:

- [Modify an existing inbound Kafka connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka#modify-an-existing-inbound-kafka-connector) shows how editing the **Consumer Group ID** or **Offsets** properties in place can cause message replay or activation failure.
- [Upgrade from a version without the Consume unmatched events checkbox](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka#upgrade-from-a-version-without-the-consume-unmatched-events-checkbox) shows how an existing element keeps its prior default for a checkbox added in a later template version until you update its template.

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/inbound-lifecycle
