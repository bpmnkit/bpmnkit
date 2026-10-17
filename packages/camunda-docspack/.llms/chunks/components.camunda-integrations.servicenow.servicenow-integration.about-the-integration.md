# ServiceNow — About the integration

Camunda’s ServiceNow integration combines:

- Custom actions in the ServiceNow Camunda Spoke to start or correlate Camunda processes from ServiceNow.
- Built-in connectors and element templates to interact with ServiceNow tables and flows from Camunda processes.


## Architecture

![Camunda ServiceNow integration architecture](./img/sn-camunda-architecture.png)  
_This diagram shows how Camunda and ServiceNow interact._


## Integration features

The integration provides bi-directional orchestration using two main components: the Camunda Spoke and built-in connectors.

### Camunda Spoke in ServiceNow

| Action            | Description                                                      |
| :---------------- | :--------------------------------------------------------------- |
| Start process     | Start a Camunda process from ServiceNow.                         |
| Correlate message | Correlate a running Camunda process instance from ServiceNow.    |
| Send signal       | Broadcast BPMN signals to one or many Camunda process instances. |
| Cancel process    | Cancel a Camunda process instance from ServiceNow when needed.   |

### ServiceNow connectors in Camunda

| Connector                                                         | Description                                                                                           |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| [ServiceNow Outbound Connector](https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/outbound-connector) | Execute CRUD operations on any ServiceNow table.                                                      |
| [ServiceNow Flow Starter](https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/flow-starter)             | Start a ServiceNow flow from a Camunda process (requires ServiceNow Integration Hub Enterprise Pack). |
| [ServiceNow Incident Handler](https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/incident-handler)     | Create and manage incidents in ServiceNow directly from a Camunda process.                            |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/servicenow-integration
