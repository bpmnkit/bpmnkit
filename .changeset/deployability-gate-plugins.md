---
"@bpmnkit/plugins": minor
---

Deploy gate in the plugins. The deploy pane decides with the deploy gate on the XML it would send (`deployVerdict`, exported from `@bpmnkit/plugins/deploy`): the Deploy button stays off and the pane lists the gate's lines; optimizer warnings stay advice. The AI panel asks the proxy for drafts (`validate: false`), inserts them as before and shows the gate's message under the answer. On-device generation (`generateProcess`) returns an undeployable answer as a draft with `deployability` (the gate's message), which the panel lists with the parser's notes; its prompt now teaches `msg=`, `key=`, `signal=`, `error=`, `escalation=`, `at=`, `every=` and `called=`, taken from core's `PROCESS_TEXT_GUIDE`.
