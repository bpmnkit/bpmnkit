# BPMN Kit Text — element reference — Not in Text: Fluent only

BPMN Kit Text has no word for these. Draw them with [BPMN Kit Fluent](/docs/guides/fluent-builder),
or add them in the editor.

| Element | Fluent |
| --- | --- |
| Sub-process | `.subProcess(id, (s) => …, options?)` |
| Event sub-process | `.eventSubProcess(id, …)` |
| Transaction | `.transaction(id, …)` |
| Data object, data store | `.dataObject`, `.dataObjectReference`, `.dataStoreReference`, `.dataAssociation` |
| Complex gateway | `.complexGateway(id, options?)` |


## Cheat sheet

| Part | Words |
| --- | --- |
| Kinds | `start` `end` `task` `user` `service` `rule` `send` `receive` `script` `manual` `call` `xor` `and` `or` `eventgw` `catch` `throw` `boundary` `adhoc` |
| Aliases | `event` `parallel` `exclusive` `gateway` `inclusive` `decision` `dmn` `human` |
| Triggers | `timer` `message` `signal` `error` `escalation` `terminate` `conditional` `compensate` `link` `cancel` |
| Branch | `gw >(Label: FEEL) next` · `gw >(Label: default) next` |
| Job and data | `job=` `result=` `feel=` (last) `form=` `called=` `each=` `in.x=` `out.x=` |
| Events | `msg=` `key=` `signal=` `error=` `escalation=` `at=` `every=` `after=` `on=` `nonint` |
| Extra lines | `lane id[Name]: a, b` · `pool id[Name]` · `msg a >(Label) b` · `note id: text` · `doc id: text` |

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
