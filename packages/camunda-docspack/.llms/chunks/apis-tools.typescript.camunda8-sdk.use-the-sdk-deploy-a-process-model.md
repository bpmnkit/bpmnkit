# TypeScript SDK — Use the SDK — Deploy a process model

Next, deploy a process model. Network operations are asynchronous and methods that operate over the network return promises. Wrap the main function in an `async` function:

```typescript
async function main() {
  const deployResponse = await camunda.deployResourcesFromFiles([
    path.join(process.cwd(), "process.bpmn"),
  ]);
  console.log(
    `[Camunda] Deployed process ${deployResponse.processes[0].processDefinitionId}`
  );
}

main(); // remember to invoke the function
```

Paste the process model XML below into a file named `process.bpmn`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_14f3xb6" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.36.1" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.8.0">
  <bpmn:process id="c8-sdk-demo" name="C8 SDK Demo" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_0yqo0wz</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_0yqo0wz" sourceRef="StartEvent_1" targetRef="Activity_1gwbbuy" />
    <bpmn:sequenceFlow id="Flow_0qugen1" sourceRef="Activity_1gwbbuy" targetRef="Activity_0tp91ve" />
    <bpmn:endEvent id="Event_0j28rou">
      <bpmn:incoming>Flow_03qgl0x</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_03qgl0x" sourceRef="Activity_0tp91ve" targetRef="Event_0j28rou" />
    <bpmn:serviceTask id="Activity_1gwbbuy" name="Service worker task">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="service-task" />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_0yqo0wz</bpmn:incoming>
      <bpmn:outgoing>Flow_0qugen1</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="Activity_0tp91ve" name="User task">
      <bpmn:extensionElements>
        <zeebe:userTask />
      </bpmn:extensionElements>
      <bpmn:incoming>Flow_0qugen1</bpmn:incoming>
      <bpmn:outgoing>Flow_03qgl0x</bpmn:outgoing>
    </bpmn:userTask>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="c8-sdk-demo">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0j28rou_di" bpmnElement="Event_0j28rou">
        <dc:Bounds x="592" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1rvlo9s_di" bpmnElement="Activity_1gwbbuy">
        <dc:Bounds x="270" y="77" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1wxn0pq_di" bpmnElement="Activity_0tp91ve">
        <dc:Bounds x="430" y="77" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_0yqo0wz_di" bpmnElement="Flow_0yqo0wz">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0qugen1_di" bpmnElement="Flow_0qugen1">
        <di:waypoint x="370" y="117" />
        <di:waypoint x="430" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_03qgl0x_di" bpmnElement="Flow_03qgl0x">
        <di:waypoint x="530" y="117" />
        <di:waypoint x="592" y="117" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
```

For reference, this is the model you use in this example:

![Example BPMN process model](../img/process-model.png)

Run the program to deploy the process model to Camunda:

```bash
npx tsx index.ts
```

If your configuration is correct, you should see output similar to the following:

```
[Camunda] Deployed process c8-sdk-demo
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/camunda8-sdk
