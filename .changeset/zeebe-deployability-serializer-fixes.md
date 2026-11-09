---
"@bpmnkit/core": patch
---

Generated BPMN deploys on more Camunda 8 models:

- The serializer declares `xmlns:xsi` whenever `xsi:type` is written.
- `dataAssociation(…, "input")` targets a `__targetRef_placeholder` property, as BPMN20.xsd requires.
- `isCollection` is no longer written on a `dataObjectReference`. The builder sets it on the referenced `dataObject` instead.
- Compact diagrams gain `linkName`, so link event names survive `compactify` and `expand`.
- Message catches (`receiveTask`, `intermediateCatchEvent`, `boundaryEvent`, and the message start of an event sub-process) now throw when `messageName` has no `correlationKey`, because Zeebe rejects them. `startEvent` accepts `correlationKey`.
- Conditions from the builder, from compact `expand` and in conditional events are normalised to FEEL with a leading `=`. Camunda 7 `${…}` goes through the JUEL converter.
