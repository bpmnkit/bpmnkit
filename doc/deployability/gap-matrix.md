# Zeebe deploy-rejection gap matrix for BPMN Kit

Real rules: 189 (Z01..Z193 minus non-rules Z36, Z97, Z131, Z190).

- P 10 · P~ 19 · D 1 · D~ 90 · M 69
- M by kind: static 51 · feel 14 · context 4. D~ by kind: static 74 · feel 14 · context 2.
- Legend: P = generator cannot emit it; D = always-on lint (flow/feel/feel-syntax, any platform); D~ = detected only with an execution platform/Camunda version (`compat/*`, `deploy/*`), or top-level only (`deploy/*`, `feel/empty-condition`), or opt-in (`bl/*` = bpmnlint-native rule needing a `.bpmnlintrc`; `casen check --deploy`), or only part of the rule; M = no guard. P~ = prevented on some paths only (usually the fresh builder; not `continueProcess`, compact, process-text).
- No guard runs automatically on generation paths: `Bpmn.export({validate})` is off by default; only `compilePlan` lints (and still emits). So every D/D~ is a detector, not a gate.
- Parity: every lint/compat/bpmnlint/builder guard named here exists in TS (packages/core) and Rust (crates/bpmnkit-lint, bpmnkit-compat, bpmnkit-builder), pinned by conformance/; exceptions marked (TS) or (RS). `reebe` = apps/reebe validator (Rust dev engine), not a BPMN Kit generation guard.
- Evidence = generator output (conformance/<kind>/<case>/expected) that real Zeebe 8.9.28 rejected with this rule; 'repro zNN' = hand file in doc/deployability/repro (ZCheck + Rust lint run, 26 files). Abbrev: c/ = compat/, d/ = deploy/, bl/ = opt-in bpmnlint-native.
- Empirical check: Rust lint_diagram (force engine rules, camundaVersion 8.10) on all 162 Zeebe-failing generator outputs; per-element join done with a throwaway script (not committed).

| ID | rule | kind | status | BPMN Kit guard | evidence |
|---|---|---|---|---|---|
| Z01 | Well-formed XML, valid vs BPMN20.xsd | static | P~ | serializer order; no XSD check anywhere | from-at-gateway-new-branch, data-object-association, data-object-collection, 11 xsi + 4 link-name compact/text |
| Z02 | definitions@targetNamespace required | static | P | all generators set it |  |
| Z03 | sequenceFlow sourceRef/targetRef required | static | P | builder validate; compactProblems |  |
| Z04 | boundaryEvent@attachedToRef required | static | P | builder attachedTo; compactProblems |  |
| Z05 | messageFlow/association refs required | static | P | collaborationProblems; annotate() |  |
| Z06 | XSD-required name/structure attrs | static | P~ | - (compact drops link name) | compact/bpmn-compat-events |
| Z07 | ids xsd:ID: NCName, unique | static | P~ | xsd-guards (new builds, top-level flows); dup-id checks | builder/xsd-continue-keeps-invalid-ids, from-insert-after-arrow-in-id |
| Z08 | IDREFs resolve | static | P~ | builder validate; compactProblems |  |
| Z09 | XSD content/enum/datatype valid | static | P~ | typed model; xsd-guards booleans (TS only) | builder/data-object-collection |
| Z10 | Element id present, non-empty | static | P | builder/compact require ids |  |
| Z11 | >=1 executable process | static | P~ | builder default true; d/process-not-executable | builder/meta-name-executable |
| Z12 | id <= max-id-length | static | M | - |  |
| Z13 | name <= max-name-length | static | M | - |  |
| Z14 | worker type <= max length | static | M | - |  |
| Z15 | Unsupported element types rejected | static | D~ | c/element-type | builder/gw-complex, sub-process-transaction |
| Z16 | Unsupported event definition types | static | D~ | c/element-type |  |
| Z17 | Event-subprocess start trigger types | static | D~ | c/element-type |  |
| Z18 | Intermediate catch trigger types | static | D~ | c/element-type |  |
| Z19 | Boundary trigger types | static | D~ | c/element-type |  |
| Z20 | End event trigger types | static | D~ | c/element-type |  |
| Z21 | Non-interrupting only for some triggers | static | M | - |  |
| Z22 | Escalation boundary only on sub/call | static | D~ | c/escalation-boundary-event-attached-to-ref |  |
| Z23 | Process needs a start event | static | D | flow/no-start-event | builder/meta-empty-process, 36 compact/text |
| Z24 | At most one none start event | static | D~ | c/no-multiple-none-start-events (top-level) | builder/gw-add-start-two-chains, gw-branch-start-event-non-interrupting |
| Z25 | Duplicate ESP message/signal names in scope | static | M | - |  |
| Z26 | Duplicate message start events / shared start msg | static | M | - | builder/diagram-shared-errors-and-messages |
| Z27 | Duplicate signal start events | static | M | - |  |
| Z28 | Duplicate error catch code in scope | static | M | - |  |
| Z29 | Duplicate escalation catch code in scope | static | M | - |  |
| Z30 | Duplicate conditional start conditions | static | M | - |  |
| Z31 | Duplicate ESP conditional start conditions | static | M | - |  |
| Z32 | Duplicate boundary triggers on one activity | static | M | - |  |
| Z33 | versionTag/jobPriority/case once on process | static | P~ | builder writes once |  |
| Z34 | zeebe:case placement/title literal | static | M | - |  |
| Z35 | Straight-through-processing loop | static | D~ | c/no-loop |  |
| Z37 | Start event <=1 event definition | static | D~ | bl/single-event-definition (opt-in); builder 1 def |  |
| Z38 | Start form publicAccess=true | static | M | - |  |
| Z39 | No 'start' listener on start events | static | M | - |  |
| Z40 | ESP start must be typed | static | D~ | bl/event-sub-process-typed-start-event (opt-in) |  |
| Z41 | No compensation ESP at process level | static | D~ | c/element-type (crude) |  |
| Z42 | No interrupting ESP inside ad-hoc | static | D~ | c/no-interrupting-event-subprocess |  |
| Z43 | Interrupting timer must not be cycle | static | D~ | c/timer | repro z43 |
| Z44 | Exactly one timer value | static | D~ | c/timer (missing only, not >1) | text/parse-078-*, parse-040-*, 10 cases |
| Z45 | Intermediate timer: duration or date | static | D~ | c/timer | builder/event-intermediate-catch-timer-cycle |
| Z46 | Timer value valid ISO/FEEL | feel | D~ | c/timer (static only; '=' unparsed) | compact/bpmn-camunda7-order-fulfillment; repro z46 |
| Z47 | Timer date in range | static | M | - |  |
| Z48 | Boundary must be attached | static | P | builder attachedTo; compactProblems |  |
| Z49 | Boundary has no incoming flows | static | M | - | repro z49 |
| Z50 | Boundary exactly one event definition | static | D~ | c/element-type (none); bl/single-event-definition |  |
| Z51 | Compensation boundary: association, no outgoing | static | M | - | builder/sub-process-transaction, text/parse-throw-compensation-boundary-pair |
| Z52 | Listener eventType limits on boundary | static | M | - |  |
| Z53 | End event has no outgoing | static | M | - | builder/gw-sequence-after-end |
| Z54 | End event <=1 event definition | static | D~ | bl/single-event-definition (opt-in) |  |
| Z55 | Compensation waitForCompletion true | static | D~ | c/wait-for-completion |  |
| Z56 | No 'end' listener on error end | static | M | - |  |
| Z57 | Intermediate catch exactly one definition | static | D~ | c/element-type | builder/event-intermediate-catch-no-definition |
| Z58 | Conditional event condition non-empty '=' FEEL | feel | D~ | bl/conditional-event (empty, opt-in); no static/parse | text/parse-start-conditional (xsi) |
| Z59 | conditionalFilter variableEvents enum | static | P | builder typed union |  |
| Z60 | EBG duplicate conditional conditions | static | M | - |  |
| Z61 | Message event def references message | static | D~ | c/message-reference (catch); d/message-start-no-name | 37 cases: builder/task-send-plain, text/parse-kind-aliases |
| Z62 | Referenced message has name | static | D~ | c/message-reference |  |
| Z63 | Message has exactly one zeebe:subscription | static | D~ | c/subscription; d/message-catch-no-correlation (top) | builder/sub-process-event-sub-process, event-intermediate-catch-message-no-key |
| Z64 | subscription correlationKey non-empty | static | D~ | c/subscription; d/message-catch-no-correlation |  |
| Z65 | correlationKey must be '=' expression | feel | M | - | repro z65 |
| Z66 | Message name FEEL parses | feel | M | - |  |
| Z67 | Message start name constant string | feel | M | - |  |
| Z68 | Message start name length | feel | M | - |  |
| Z69 | Message throw: publishMessage XOR taskDefinition | static | D~ | c/implementation | builder/task-send-message, event-end-message, diagram-collaboration (18) |
| Z70 | Message throw w/o taskDef references message | static | M | - |  |
| Z71 | publishMessage correlationKey non-empty | static | M | - |  |
| Z72 | Receive task references message | static | D~ | c/message-reference | builder/task-send-plain |
| Z73 | Receive task msg != boundary msg | static | M | - |  |
| Z74 | Signal event def references signal | static | D~ | c/signal-reference | text/parse-start-signal, parse-throw-events (6) |
| Z75 | Signal has name | static | D~ | c/signal-reference |  |
| Z76 | Signal name FEEL / constant for start | feel | M | - |  |
| Z77 | Error end references error | static | D~ | c/error-reference | text/parse-end-error-message-escalation-signal (5) |
| Z78 | Error end errorCode non-empty | static | D~ | c/error-reference |  |
| Z79 | Error catch code not an expression | static | M | c/no-expression only <8.4 (wrong for 8.4+) | repro z79 |
| Z80 | Escalation throw references escalation | static | D~ | c/escalation-reference | text/parse-throw-events (2) |
| Z81 | escalationCode non-empty | static | D~ | c/escalation-reference |  |
| Z82 | Escalation catch code not expression | static | M | c/no-expression only 8.2-8.4 |  |
| Z83 | Link event name non-empty | static | D~ | c/link-event; bl/link-event | compact/bpmn-compat-events (XSD) |
| Z84 | Link throw has matching catch | static | D~ | bl/link-event (opt-in); reebe (RS) | repro z84 |
| Z85 | Duplicate link catch names | static | D~ | c/link-event; bl/link-event |  |
| Z86 | Compensation activityRef exists | static | M | - (reebe RS partial) |  |
| Z87 | Compensation ref has handler/subprocess | static | M | - (reebe RS partial) | builder/event-intermediate-throw-compensation |
| Z88 | Compensation ref in same scope | static | M | - (reebe RS partial) |  |
| Z89 | Compensation handler no in/out/boundary | static | M | - | builder/sub-process-transaction; repro z89 |
| Z90 | serviceTask exactly one taskDefinition | static | D~ | d/service-task-no-type (top); c/implementation | builder/from-* (12), compact (37 cases) |
| Z91 | taskDefinition type non-empty | static | D~ | d/service-task-no-type; c/implementation; builder type not runtime-checked | builder/export-validate-off |
| Z92 | taskDefinition retries non-empty | static | P~ | xsd-guards assertRetries (builder option) |  |
| Z93 | type/retries valid FEEL | feel | M | - | repro z93 |
| Z94 | Duplicate task extension elements | static | P~ | builder/ops write once |  |
| Z95 | Header key reserved prefix | static | M | - |  |
| Z96 | Duplicate header keys | static | D~ | c/duplicate-task-headers | repro z96 |
| Z98 | scriptTask: script XOR taskDefinition | static | D~ | c/implementation | text/parse-all-task-kinds, parse-feel-empty |
| Z99 | script expression+resultVariable | static | D~ | c/implementation |  |
| Z100 | script expression '=' and parses | feel | D~ | feel-syntax (parse if '='); static missed | repro z100 |
| Z101 | jobPriority only in job-worker mode | static | M | - |  |
| Z102 | jobPriority priority int or FEEL | static | M | - |  |
| Z103 | sendTask publishMessage XOR taskDefinition | static | D~ | c/implementation; d/service-task-no-type (top) | builder/task-send-message, task-multi-instance-sequential |
| Z104 | sendTask(publishMessage) references message | static | M | - |  |
| Z105 | Input target path pattern/reserved | feel | D~ | c/variable-name; feel-syntax (source) | compact/bpmn-miwg-c-8-0/8-1 |
| Z106 | Output source required, non-static | feel | D~ | c/io-mapping (empty); static missed |  |
| Z107 | Secret ref not string literal | feel | D~ | c/secrets (warn); drop readiness (TS) |  |
| Z108 | Secret ref in list/if context | feel | D~ | c/secrets (warn) |  |
| Z109 | Variable mapping build failure | feel | M | - |  |
| Z110 | linkedResource attrs/bindingType | static | M | - (connector apply problems, TS) |  |
| Z111 | linkedResource deployment binding target | context | M | - |  |
| Z112 | agentDefinition agentType required | static | M | - |  |
| Z113 | agentType placement | static | M | - |  |
| Z114 | Duplicate user-task extensions | static | P~ | builder writes once |  |
| Z115 | formDefinition formKey XOR formId | static | P~ | builder single form binding; c/user-task-form |  |
| Z116 | Native form formId XOR externalReference | static | P~ | builder single form binding; c/user-task-form |  |
| Z117 | form bindingType/versionTag rules | static | D~ | c/version-tag |  |
| Z118 | form deployment binding resolves | context | D~ | casen check --deploy (TS, opt-in) |  |
| Z119 | Embedded userTaskForm non-empty | static | D~ | c/start-event-form-embedded/user-task-form |  |
| Z120 | candidateGroups/Users CSV or FEEL | feel | M | - |  |
| Z121 | taskSchedule dates valid | feel | D~ | c/task-schedule | compact/bpmn-compat-tasks |
| Z122 | priorityDefinition 0..100 | feel | D~ | c/priority-definition | compact/bpmn-compat-tasks |
| Z123 | Task listeners only on Camunda user task | static | M | - |  |
| Z124 | taskListener attrs required | static | D~ | c/task-listener (type only) |  |
| Z125 | callActivity exactly one calledElement | static | D~ | d/call-activity-no-process (top); c/called-element | text/parse-call-activity, parse-all-task-kinds |
| Z126 | calledElement processId non-empty | static | D~ | d/call-activity-no-process; c/called-element |  |
| Z127 | processId valid FEEL | feel | M | - | repro z127 |
| Z128 | businessId static <=256 | feel | M | - |  |
| Z129 | calledElement bindingType/versionTag | static | D~ | c/version-tag |  |
| Z130 | Called process in same deployment | context | M | - |  |
| Z132 | BRT calledDecision XOR taskDefinition | static | D~ | c/implementation; d/service-task-no-type (top) | compact/bpmn-layout-kyc-onboarding (5) |
| Z133 | calledDecision decisionId+resultVariable | static | D~ | c/implementation |  |
| Z134 | decisionId/versionTag FEEL | feel | M | - |  |
| Z135 | calledDecision bindingType/versionTag | static | D~ | c/version-tag |  |
| Z136 | Decision in same deployment | context | D~ | casen check --deploy (TS, opt-in) |  |
| Z137 | Duplicate calledDecision | static | P~ | builder writes once |  |
| Z138 | XOR default flow starts at gateway | static | P | builder defaultFlow() on branch |  |
| Z139 | OR default flow starts at gateway | static | P | builder defaultFlow() on branch |  |
| Z140 | XOR outgoing: condition or default | static | D~ | feel/empty-condition (top); c/sequence-flow-condition | builder/gw-three-branches, from-* (29 cases) |
| Z141 | OR outgoing: condition | static | D~ | feel/empty-condition (top); c/sequence-flow-condition |  |
| Z142 | Conditions only on XOR/OR flows | static | D~ | c/sequence-flow-condition | compact/bpmn-camunda-compat-agents (4) |
| Z143 | Flow condition '=' FEEL that parses | feel | D~ | feel-syntax (parse if '='); static missed | compact/bpmn-miwg-c-1-0/1-1/3-0/8-0, a-2-1 (13) |
| Z144 | EBG >= 2 outgoing | static | D~ | bl/event-based-gateway (opt-in) | compact/bpmn-compat-tasks, expand-gateways-all-kinds |
| Z145 | EBG targets only catch events | static | D~ | c/event-based-gateway-target (receiveTask only) | compact/bpmn-layout-quote-to-cash |
| Z146 | EBG duplicate target triggers | static | M | - |  |
| Z147 | EBG targets no extra incoming | static | M | - | repro z147 |
| Z148 | No 'end' listener on gateways | static | M | - |  |
| Z149 | MI needs zeebe:loopCharacteristics | static | D~ | c/loop-characteristics |  |
| Z150 | MI inputCollection required | static | D~ | c/loop-characteristics; reebe (RS) |  |
| Z151 | MI outputCollection+outputElement together | static | D~ | c/loop-characteristics |  |
| Z152 | MI inputCollection '=' expression | feel | M | - | repro z152 |
| Z153 | beforeAll only on MI | static | D~ | c/before-all-execution-listener |  |
| Z154 | Sub-process exactly one start event | static | D~ | bl/start-event-required, single-blank-start-event (opt-in) | compact/stream-container-children, expand-test-017 (8) |
| Z155 | Sub-process start must be none | static | D~ | bl/sub-process-blank-start-event (opt-in) | compact/bpmn-miwg-c-9-0/9-2/6-0 |
| Z156 | Sub-process scope link/handler dups | static | D~ | as Z84/85; Z25/28/29 missed |  |
| Z157 | Ad-hoc needs >= 1 activity | static | D~ | c/ad-hoc-sub-process | text/parse-adhoc-no-tools, stream-adhoc-agent-recorded-chunks |
| Z158 | Ad-hoc no start event | static | D~ | bl/ad-hoc-sub-process (opt-in) |  |
| Z159 | Ad-hoc no end event | static | D~ | bl/ad-hoc-sub-process (opt-in) |  |
| Z160 | Ad-hoc+taskDef: no cancelRemaining=false | static | M | - | builder/sub-process-ad-hoc-agent |
| Z161 | Ad-hoc+taskDef: no completionCondition | static | M | - | builder/sub-process-ad-hoc-agent |
| Z162 | Ad-hoc+taskDef: no activeElementsCollection | static | M | - | builder/sub-process-ad-hoc-agent |
| Z163 | Ad-hoc outputElement/Collection both | static | D~ | c/ad-hoc-sub-process |  |
| Z164 | Ad-hoc expressions non-static FEEL | feel | D~ | feel-syntax (parse if '='); static missed |  |
| Z165 | Duplicate zeebe:adHoc/agentDefinition | static | P~ | builder writes once |  |
| Z166 | Ad-hoc fromAi parameter extraction | feel | D~ | c/agent-fromai-contract; reebe ad_hoc (RS) |  |
| Z167 | All zeebe expressions parse as FEEL | feel | D~ | feel-syntax (cond/io/script/ad-hoc only) | text/parse-mappings-bad-feel, compact/bpmn-miwg-c-8-0 |
| Z168 | Mandatory expression present | static | D~ | c/implementation, c/io-mapping | builder/export-validate-off |
| Z169 | Non-static attributes need '=' | feel | M | - | 13 compact static conditions; repros z65/z100/z152 |
| Z170 | satisfiesIfStatic value checks | feel | D~ | c/task-schedule, c/priority-definition (not CSV/businessId) | compact/bpmn-compat-tasks |
| Z171 | Required zeebe attribute missing | static | D~ | c/implementation, io-mapping, listeners (partial) |  |
| Z172 | Exactly one of attributes | static | P~ | builder form exclusivity |  |
| Z173 | Required extension element missing | static | D~ | d/* (top); c/implementation, called-element, loop | see Z90/Z125 |
| Z174 | Duplicate optional extension element | static | P~ | builder writes once; ops placement |  |
| Z175 | executionListener attrs required | static | D~ | c/execution-listener (type only) |  |
| Z176 | One zeebe:executionListeners per element | static | P~ | builder writes once |  |
| Z177 | Execution listeners allowed elements | static | P~ | assertZeebePlacement (builder/ops/apply) |  |
| Z178 | 'cancel' listener only on process | static | D~ | c/cancel-execution-listener |  |
| Z179 | Duplicate execution listeners | static | D~ | c/duplicate-execution-listeners |  |
| Z180 | Execution listener null attribute | static | M | - |  |
| Z181 | Deployment has >= 1 resource | static | M | - |  |
| Z182 | Resource name length | static | M | - |  |
| Z183 | Duplicate process id in deployment | static | P~ | builder dup-id checks (one file) |  |
| Z184 | Duplicate DRG/decision/form ids | static | M | - |  |
| Z185 | Unknown resource extension | static | M | - |  |
| Z186 | Empty/blank resource content | static | P | writers never emit empty |  |
| Z187 | Tenant authorization | context | M | - |  |
| Z188 | Deployment already exists | context | M | - |  |
| Z189 | Timer start creation failure | feel | M | - |  |
| Z191 | Form JSON valid with id | static | D~ | lintForm via casen check (opt-in) |  |
| Z192 | DMN parses, ids present | static | D~ | lintDmn via casen check (opt-in) |  |
| Z193 | RPA resource id present | static | M | - |  |

## Top misses (M / D~ ranked by Zeebe hits on generator outputs, then likelihood)

Counts are Zeebe errors / distinct conformance cases among the 162 failing generator outputs.

1. **Z140/Z141 gateway flow without condition or default** (85 / 29; D~: `feel/empty-condition` top-level only, nested via `compat/sequence-flow-condition` with a version). Builder lets a branch carry neither.
   ```ts
   Bpmn.createProcess("p").startEvent("s").exclusiveGateway("g")
     .branch("a", b => b.condition("=a").endEvent("e1"))
     .branch("b", b => b.defaultFlow().endEvent("e2"))
     .branch("c", b => b.endEvent("e3")).build()
   // Zeebe: Flow_g_e3 - Must have a condition or be default flow
   ```
2. **Z61/Z74/Z77/Z80 event definition without message/signal/error/escalation ref** (71 / ~45; D~: compat refs, version-gated). Compact has no name/code fields at all (`makeEventDef`, compact.ts:546-566), so process-text and compact always emit bare definitions.
   ```text
   parseProcessText("s[start:signal Alarm] > t[task T] > e[end]") -> expand -> Bpmn.export
   // Zeebe: s_SignalEventDefinition - Must reference a signal
   // also: d[event Wait] -> "Must reference a message"; a[end:error Failed] -> "Must reference an error"
   ```
3. **Z90/Z125/Z173 missing zeebe:taskDefinition / zeebe:calledElement** (68 / 40; D~: `deploy/*` top-level + compat). process-text maps `job=` to `jobType` for every kind (process-text.ts:804) and expand writes a taskDefinition on a call activity (compact.ts:633-634); `continueProcess` keeps plain C7 service tasks (builder/from-*).
   ```text
   parseProcessText("s[start] > c[call Run child | job=child-process] > e[end]") -> expand
   // emits <callActivity><zeebe:taskDefinition type="child-process"/> 
   // Zeebe: c - Must have exactly one 'zeebe:calledElement' extension element
   ```
4. **Z69/Z103 send task / message throw without taskDefinition** (40 / 25, 18 builder cases; D~ `compat/implementation`). Builder takes messageName + correlationKey but emits no job type (and Zeebe 8.9 has no zeebe:publishMessage).
   ```ts
   Bpmn.createProcess("p").startEvent("s")
     .sendTask("send", { messageName: "order-shipped", correlationKey: "=orderId" }).endEvent("e").build()
   // Zeebe: send - Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element
   ```
5. **Z01 unbound `xsi` prefix → not well-formed XML** (11 / 11; M: nothing checks XSD or namespace well-formedness; BPMN Kit's own parser accepts it). See bug (a).
   ```text
   parseProcessText("s[start:conditional Stock low | feel=stock < 5] > t[task T] > e[end]") -> expand -> export
   // Zeebe: Unable to parse: The prefix "xsi" for attribute "xsi:type" ... "bpmn:condition" is not bound.
   ```
6. **Z143/Z169 condition is a static value (no leading `=`)** (13 / 6 + C7 imports; M: `feel-syntax` skips text without `=`, nothing flags static).
   ```ts
   expand({ id: "D", processes: [{ id: "P", elements: [{ id: "s", type: "startEvent" },
     { id: "g", type: "exclusiveGateway" }, { id: "a", type: "endEvent" }, { id: "b", type: "endEvent" }],
     flows: [{ id: "f0", from: "s", to: "g" }, { id: "f1", from: "g", to: "a", condition: "x > 1" },
             { id: "f2", from: "g", to: "b", isDefault: true }] }] })
   // Zeebe: f1 > conditionExpression - Expected expression but found static value 'x > 1'. An expression must start with '='
   ```
7. **Z44/Z45 timer with no value / cycle on intermediate catch** (16 / 15; D~ `compat/timer`). process-text `catch:timer` emits an empty timer; compact keeps only `timerDuration` (compact.ts:812), dropping timeDate/timeCycle; builder accepts `timerCycle` on a catch.
   ```ts
   Bpmn.createProcess("p").startEvent("s").intermediateCatchEvent("c", { timerCycle: "R3/PT1M" }).endEvent("e").build()
   // Zeebe: c - Intermediate timer catch event must have either a time duration or a time date.
   // text "s[start Go]\nt[catch:timer Wait] > u[task U]" -> Must be exactly one type of timer
   ```
8. **Z154/Z155 sub-process start events** (17 / 12; D~ only via opt-in `bl/start-event-required`, `bl/sub-process-blank-start-event`; default lint and compat miss). Compact `expand` does not add a start event inside a sub-process.
   ```ts
   expand({ id: "d", processes: [{ id: "P", elements: [{ id: "S", type: "startEvent" },
     { id: "Sub", type: "subProcess", children: { elements: [{ id: "B", type: "task" }], flows: [] } }],
     flows: [{ id: "F", from: "S", to: "Sub" }] }] })   // (shape of compact/expand-test-017)
   // Zeebe: Sub - Must have exactly one start event
   ```
9. **Z63 message without zeebe:subscription** (4 builder cases; D~ `compat/subscription`). Builder writes no subscription when correlationKey is omitted (bug e), even for catch events and event-sub-process starts.
   ```ts
   Bpmn.createProcess("p").startEvent("s").intermediateCatchEvent("c", { messageName: "reply" }).endEvent("e").build()
   // Zeebe: Message_reply - Must have exactly one zeebe:subscription extension element
   ```
10. **Z160-Z162 ad-hoc sub-process with taskDefinition plus completionCondition / cancelRemainingInstances=false / activeElementsCollection** (3 / 1; M). Builder accepts all of them together on the AI-agent ad-hoc shape.
    ```ts
    Bpmn.createProcess("p").startEvent("s").adHocSubProcess("agent", b => b.serviceTask("toolA", { taskType: "a" }),
      { taskDefinition: { type: "io.camunda.agenticai:aiagent-job-worker:1" }, completionCondition: "=done",
        cancelRemainingInstances: false, activeElementsCollection: "=toolCalls" }).endEvent("e").build()
    // Zeebe: agent - Must not define completionCondition in combination with zeebe:taskDefinition. (+2 more)
    ```
11. **Z53 end event with outgoing flow** (1 / 1; M). Builder chains after `endEvent` instead of refusing.
    ```ts
    Bpmn.createProcess("p").startEvent("s").endEvent("e1").serviceTask("orphan", { taskType: "orphan" }).endEvent("e2").build()
    // Zeebe: e1 - End events must not have outgoing sequence flows to other elements.
    ```
12. **Static or wrongly-typed FEEL in non-condition attributes: Z65 correlationKey, Z152 inputCollection, Z93/Z127 type/processId parse, Z79/Z82 catch code expression** (repros only; M). No generator case hits them, but an LLM writing `correlationKey: "orderId"` will. `compat/no-expression` only flags catch-code expressions below 8.4, yet Zeebe 8.9 rejects them.
    ```xml
    <bpmn:message id="M" name="m"><bpmn:extensionElements><zeebe:subscription correlationKey="orderId"/></bpmn:extensionElements></bpmn:message>
    <!-- Zeebe: Expected expression but found static value 'orderId'. An expression must start with '=' -->
    <bpmn:error id="E" errorCode="=code"/> on a boundary -> "The errorCode of the error catch event is not allowed to be an expression"
    ```

Also missed and generator-reachable: Z51/Z89 compensation boundary/handler shape (builder/sub-process-transaction), Z87 compensation activityRef without handler (builder/event-intermediate-throw-compensation), Z26 one message on two start events (builder/diagram-shared-errors-and-messages), Z49 boundary incoming, Z147 event-gateway target with extra incoming, Z28/Z29/Z32 duplicate catch handlers.

## Known serializer / XSD bugs (verified against Zeebe 8.9.28 output)

| # | Bug | Zeebe result | Emitting code (TS; Rust twin) | Cases |
|---|---|---|---|---|
| a | `xsi:type` written without declaring `xmlns:xsi`. Builder declares xsi only for new builds (bpmn-builder.ts:3831, 4279); `continueProcess` on a doc without xsi still adds it; `expand` namespaces omit xsi (compact.ts:1077-1084); serializer repairs only zeebe/camunda/modeler/bioc/color | not well-formed: "prefix xsi ... not bound" | makeConditionExpression bpmn-builder.ts:1006-1011; MI completionCondition bpmn-builder.ts:822-826; compact MI completionCondition compact.ts:822-828; conditional `condition` zeebe-extensions.ts:509 (via compact.ts:815); KNOWN_NAMESPACE_URIS bpmn-serializer.ts:881-887. Rust: elements.rs:691-694, zeebe.rs:776, expand.rs:514, serializer.rs:21-30 | builder/from-at-gateway-new-branch; compact/bpmn-events-and-containers, expand-multi-instance, bpmn-hand-boundary-and-multi-instance (completionCondition), bpmn-miwg-b-2-0, expand-every-event-type, expand-boundary-event-types; text/parse-start-conditional, parse-boundary-conditional-feel, parse-catch-events, parse-boundary-all-triggers |
| b | dataInputAssociation without `targetRef` (XSD requires it) | cvc-complex-type.2.4.b | builder addDataAssociation bpmn-builder.ts:549-551 (input = sourceRefs only); serializer skips missing targetRef bpmn-serializer.ts:243. Rust: bpmnkit-builder/src/shared.rs:205-208 | builder/data-object-association, data-store-reference, data-in-sub-process, meta-auto-layout-boundary-data-annotation |
| c | `isCollection` on dataObjectReference (XSD allows it only on dataObject) | cvc-complex-type.3.2.2 | bpmn-builder.ts:531-532; bpmn-serializer.ts:412; compact.ts:917. Rust: elements.rs:1352-1357, serializer.rs:421 | builder/data-object-collection |
| d | linkEventDefinition without `name` (XSD use=required) | cvc-complex-type.4 | compact has no link-name field: compactify drops it, `makeEventDef` returns `{type:"link"}` compact.ts:564-565. Rust: expand.rs:215 | compact/bpmn-compat-events, bpmn-compat-contents, bpmn-bpmnlint-scopes-and-exemptions, bpmn-hand-link-events-and-documentation |
| e | Message catch / event-sub-process message start with no zeebe:subscription when no correlationKey is passed | Must have exactly one zeebe:subscription | buildMessageSubscriptionExt returns [] bpmn-builder.ts:657-660 (no error, no default). Rust: elements.rs:277 | builder/sub-process-event-sub-process, sub-process-event-sub-process-only, sub-process-ad-hoc-in-branch, event-intermediate-catch-message-no-key |
| f | Compact / C7 conditions copied verbatim, no `=` | Expected expression but found static value | compactifyFlows compact.ts:417; expand compact.ts:776, 1004 (`{text: f.condition}`) | compact/bpmn-miwg-c-1-0, c-1-1, c-3-0, c-8-0, a-2-1, bpmn-c7-*; camunda7 report is the only signal |
