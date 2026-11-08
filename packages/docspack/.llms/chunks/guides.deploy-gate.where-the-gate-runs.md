# The Deploy Gate — Where the gate runs

| Entry point | Default | Opt-outs |
|---|---|---|
| `ProcessBuilder.build()`, `DiagramBuilder.build()` | gated | `{ validate: false }`, `{ placeholders: true }`, `{ camundaVersion }` |
| `expand(compact, options?)` | gated | the same |
| `Bpmn.export(defs, { validate })` | `"auto"`: gated when the model targets Camunda 8 | `"error"` gates any model, `"warn"` logs, `false` skips |
| `convertCamunda7(defs, options?)` | gated | the same as `build()` |
| `compilePlan` / `mergePlan` | gated; a refusal returns no `xml` and one problem per error | `validate`, `placeholders`, `camundaVersion` |
| Connector templates (`applyTemplates`, `applyConnectorLines`) | applied elements checked; errors are `problems` (`kind: "not-deployable"`) | — |
| `casen generate bpmn` | refuses, writes nothing, exits 1 | `--placeholders`, `--no-validate` |
| `casen migrate c7` | refuses, exits 1 | `--placeholders`, `--no-validate` |
| `casen synth` | refuses, exits 1 | `--placeholders` |
| `casen deploy` | refuses before sending a `.bpmn`, exits 1 | `--no-validate` |
| `casen check --deploy` | reports the gate's errors with the lint's | — |
| AI proxy `/chat`, `/improve` | refuses: an `error` event with the gate's message, no `xml` | request body `"placeholders": true`; `"validate": false` returns the diagram as a draft with a `deployability` event carrying the message |
| AI proxy MCP tools | every tool that changes the diagram adds a deploy-check result, so the model fixes what Zeebe would refuse; `sdk.exportXml` throws the gate's message | `sdk.exportXml(compact, '{"placeholders":true}')` |
| aikit MCP `bpmn_create`, `bpmn_update` | refused, nothing written | `placeholders: true` |
| aikit MCP `bpmn_deploy` | refuses before sending | `validate: false` |
| aikit MCP `bpmn_validate` | reports `deployable` and the gate's message | — |
| Studio deploy pane | the Deploy button stays off and lists the gate's lines | — |
| Studio AI panels, on-device AI | insert the diagram as a draft and show the gate's lines | — |
| Drop draft | renders always; the readiness check shows the gate's lines and offers **Fill placeholders**; **Share** is refused until it deploys | **Edit** opens the draft as it is |

Work in progress is never gated: an editor saving the diagram you are drawing, streamed preview
frames, a diagram rendered in Markdown, the MCP server's state between tool calls. These pass
`validate: false` on purpose.

---
Source: https://bpmnkit.com/docs/guides/deploy-gate
