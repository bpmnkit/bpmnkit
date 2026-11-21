# AI setup — for agents — Signals

- **Success**: one line starting `✓ <file>.bpmn … · lint clean · … [· deployed N to <target> (key …)]`. Done. Do not read the XML, move shapes or render images.
- **Warnings**: `N warning(s)` in place of `lint clean`, with `⚠` lines above. The file is valid; fix them if cheap.
- **Failure**: non-zero exit. A spec problem prints an error naming the line and writes nothing; lint errors print one `✖ <file> <element>: <message> [<rule>]` line each and leave the file written. Fix the spec, run again.
- **Deploy failure**: no cluster reachable. Set `ZEEBE_REST_ADDRESS` (+ `CAMUNDA_CLIENT_ID`, `CAMUNDA_CLIENT_SECRET`, `CAMUNDA_OAUTH_URL`, or `CAMUNDA_BASIC_AUTH_USERNAME`/`PASSWORD`), run `bpmnkit profile create`, or `bpmnkit reebe start`. Ask the user for credentials; never invent them.

---
Source: https://bpmnkit.com/docs/guides/ai-setup-for-agents
