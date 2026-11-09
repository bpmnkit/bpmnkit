//! Twin of `zeebe-validate/rules/references.ts`: checks for zeebe-rules.md section E
//! (messages, signals, errors, escalations, links, compensation). Zeebe resolves a
//! `messageRef` / `signalRef` / ... to the root element; a reference that resolves to
//! nothing is the same as no reference.

use super::context::{
    feel_error, feel_failure, is_expression, static_value_message, NodeEntry, ScopeKind,
    ZeebeContext,
};
use bpmnkit_bpmn::{
    BpmnEventDefinition, BpmnFlowElement, BpmnMessage, BpmnMessageEventDefinition, BpmnSignal,
    XmlElement,
};
use bpmnkit_feel::ast::{Node, NodeKind};
use bpmnkit_feel::{parse_partial, Context, ParseOptions, Value};

struct DefEntry<'a> {
    entry: NodeEntry<'a>,
    def: &'a BpmnEventDefinition,
}

fn definitions(node: &BpmnFlowElement) -> &[BpmnEventDefinition] {
    node.event_definitions().unwrap_or(&[])
}

/// Every event definition of the type, in document order, with the node that owns it.
fn defs_of<'a>(
    ctx: &ZeebeContext<'a>,
    type_name: &str,
    node_types: Option<&[&str]>,
) -> Vec<DefEntry<'a>> {
    let mut out = vec![];
    for entry in ctx.nodes.iter().copied() {
        if node_types.is_some_and(|t| !t.contains(&entry.node.type_name())) {
            continue;
        }
        for def in definitions(entry.node) {
            if def.type_name() == type_name {
                out.push(DefEntry { entry, def });
            }
        }
    }
    out
}

const CATCH: [&str; 2] = ["intermediateCatchEvent", "boundaryEvent"];
const THROW: [&str; 2] = ["intermediateThrowEvent", "endEvent"];

/// Zeebe's `getAttributeValue(...) == null || isEmpty()`.
fn blank(value: Option<&str>) -> bool {
    value.is_none_or(str::is_empty)
}

fn is_process_start(ctx: &ZeebeContext, entry: &NodeEntry) -> bool {
    entry.node.type_name() == "startEvent" && ctx.scopes[entry.scope].kind == ScopeKind::Process
}

/// Start events of the sub-processes directly in a process.
fn is_sub_process_start(ctx: &ZeebeContext, entry: &NodeEntry) -> bool {
    let scope = &ctx.scopes[entry.scope];
    entry.node.type_name() == "startEvent"
        && scope.kind != ScopeKind::Process
        && scope
            .parent
            .is_some_and(|p| ctx.scopes[p].kind == ScopeKind::Process)
}

fn result_type(value: &Value) -> &'static str {
    match value {
        Value::Null => "NULL",
        Value::String(_) => "STRING",
        Value::Number(_) => "NUMBER",
        Value::Boolean(_) => "BOOLEAN",
        Value::List(_) => "ARRAY",
        Value::Date(_) => "DATE",
        Value::Time(_) => "TIME",
        Value::DateTime(_) => "DATE_TIME",
        Value::DaysTimeDuration(_) => "DURATION",
        Value::YearsMonthsDuration(_) => "PERIOD",
        _ => "OBJECT",
    }
}

/// Whether evaluating the tree would look a variable up in the (empty) root context:
/// a name, or a callee that is not a built-in, that no local binding shadows. The TS
/// evaluator is observed through a proxy; this walk answers the same question.
fn touches_variable(node: &Node, bound: &mut Vec<String>) -> bool {
    let free = |bound: &Vec<String>, name: &str| name != "?" && !bound.iter().any(|b| b == name);
    let is_builtin = |name: &str| bpmnkit_feel::builtin_names().any(|b| b == name);
    match &node.kind {
        NodeKind::Name(n) => free(bound, n),
        NodeKind::Call { callee, args } => {
            (!is_builtin(callee) && free(bound, callee)) || seq(args.iter(), bound)
        }
        NodeKind::CallNamed { callee, args } => {
            seq(args.iter().map(|(_, v)| v), bound) || (!is_builtin(callee) && free(bound, callee))
        }
        NodeKind::CallExpr { target, args } => {
            touches_variable(target, bound) || seq(args.iter(), bound)
        }
        NodeKind::List(items) | NodeKind::UnaryTestList(items) | NodeKind::UnaryNot(items) => {
            seq(items.iter(), bound)
        }
        NodeKind::Context(entries) => {
            let mark = bound.len();
            let mut hit = false;
            for (key, value) in entries {
                if touches_variable(value, bound) {
                    hit = true;
                    break;
                }
                bound.push(key.clone());
            }
            bound.truncate(mark);
            hit
        }
        NodeKind::Range { low, high, .. } => {
            touches_variable(low, bound) || touches_variable(high, bound)
        }
        NodeKind::UnaryMinus(operand) => touches_variable(operand, bound),
        NodeKind::Binary { left, right, .. } => {
            touches_variable(left, bound) || touches_variable(right, bound)
        }
        NodeKind::Path { base, .. } => touches_variable(base, bound),
        NodeKind::Filter { base, condition } => {
            if touches_variable(base, bound) {
                return true;
            }
            // The element's own fields are in scope: those of any context literal below the base.
            let mark = bound.len();
            bound.push("item".to_string());
            collect_keys(base, bound);
            let hit = touches_variable(condition, bound);
            bound.truncate(mark);
            hit
        }
        NodeKind::If {
            condition,
            then,
            otherwise,
        } => {
            touches_variable(condition, bound)
                || touches_variable(then, bound)
                || touches_variable(otherwise, bound)
        }
        NodeKind::For { bindings, body } => scoped(bindings, body, bound),
        NodeKind::Some {
            bindings,
            satisfies,
        }
        | NodeKind::Every {
            bindings,
            satisfies,
        } => scoped(bindings, satisfies, bound),
        NodeKind::Between { value, low, high } => {
            touches_variable(value, bound)
                || touches_variable(low, bound)
                || touches_variable(high, bound)
        }
        NodeKind::InTest { value, test } => {
            touches_variable(value, bound) || touches_variable(test, bound)
        }
        NodeKind::InstanceOf { value, .. } => touches_variable(value, bound),
        // The body only runs when the function is called, and the call target is walked above.
        NodeKind::FunctionDef { .. } => false,
        _ => false,
    }
}

fn seq<'n>(mut nodes: impl Iterator<Item = &'n Node>, bound: &mut Vec<String>) -> bool {
    nodes.any(|n| touches_variable(n, bound))
}

fn scoped(bindings: &[bpmnkit_feel::ast::Binding], body: &Node, bound: &mut Vec<String>) -> bool {
    let mark = bound.len();
    let mut hit = false;
    for b in bindings {
        if touches_variable(&b.domain, bound) {
            hit = true;
            break;
        }
        bound.push(b.name.clone());
    }
    hit = hit || touches_variable(body, bound);
    bound.truncate(mark);
    hit
}

fn collect_keys(node: &Node, out: &mut Vec<String>) {
    match &node.kind {
        NodeKind::Context(entries) => out.extend(entries.iter().map(|(k, _)| k.clone())),
        NodeKind::List(items) => items.iter().for_each(|n| collect_keys(n, out)),
        _ => {}
    }
}

enum Constant {
    Value(String),
    Problem(String),
}

/// What the start event name validators say about a name that has to be known
/// without variables: the evaluated string, or Zeebe's message. Variables are
/// `null` there, so `=x` is a NULL, not a failure.
fn constant_name(name: &str, what: &str) -> Constant {
    if !is_expression(name) {
        return Constant::Value(name.to_string());
    }
    let detail = format!(
        "Expected constant expression but found '{name}', which could not be evaluated without context: "
    );
    let source = &name[1..];
    let parsed = parse_partial(source, &ParseOptions::default());
    let ast = match parsed.parsed {
        Some(expr) if parsed.errors.is_empty() => expr,
        _ => return Constant::Problem(format!("{detail}{}", feel_failure(name))),
    };
    // Signal names are evaluated with a context whose variable lookup is null, which
    // feel-scala turns into a failure; message names get an empty answer, a NULL.
    if what == "signal" && touches_variable(ast.ast(), &mut vec![]) {
        return Constant::Problem(format!(
            "{detail}failed to evaluate expression '{source}' : java.lang.NullPointerException: Cannot invoke \"io.camunda.zeebe.util.Either.fold(java.util.function.Function, java.util.function.Function)\" because the return value of \"io.camunda.zeebe.el.EvaluationContext.getVariable(String)\" is null"
        ));
    }
    match ast.evaluate(&Context::new()) {
        Value::String(s) => Constant::Value(s),
        other => Constant::Problem(format!(
            "Expected constant expression of type String for {what} name '{name}', but was {}",
            result_type(&other)
        )),
    }
}

fn ext(elements: &Option<Vec<XmlElement>>) -> &[XmlElement] {
    elements.as_deref().unwrap_or(&[])
}

fn same<T>(a: Option<&T>, b: &T) -> bool {
    a.is_some_and(|a| std::ptr::eq(a, b))
}

pub(super) fn check(ctx: &mut ZeebeContext) {
    message_reference_rules(ctx);
    message_root_rules(ctx);
    message_start_rules(ctx);
    message_throw_rules(ctx);
    receive_task_rules(ctx);
    signal_rules(ctx);
    error_rules(ctx);
    escalation_rules(ctx);
    link_rules(ctx);
    compensation_rules(ctx);
}

fn as_message(def: &BpmnEventDefinition) -> Option<&BpmnMessageEventDefinition> {
    match def {
        BpmnEventDefinition::Message(m) => Some(m),
        _ => None,
    }
}

// ---------------------------------------------------------------------------
// Messages: Z61-Z73
// ---------------------------------------------------------------------------

fn message_reference_rules(ctx: &mut ZeebeContext) {
    // Z61: every message definition that is not on a throw event (start, catch, boundary).
    for DefEntry { entry, def } in defs_of(ctx, "message", None) {
        if THROW.contains(&entry.node.type_name()) {
            continue;
        }
        let m = as_message(def).and_then(|m| m.message_ref.as_deref());
        if ctx.message(m).is_none() {
            ctx.report(
                "message-reference",
                &entry.node.base().id,
                "Must reference a message".into(),
                "Reference a message with messageRef on the message event definition.",
            );
        }
    }
    // Z72
    for entry in ctx.nodes.clone() {
        if matches!(entry.node, BpmnFlowElement::ReceiveTask(_))
            && ctx.message(entry.node.message_ref()).is_none()
        {
            ctx.report(
                "receive-task-message",
                &entry.node.base().id,
                "Must reference a message".into(),
                "Set messageRef on the receive task to a message.",
            );
        }
    }
}

/// Where a root message or signal is referenced from, as Zeebe's `MessageValidator` sees it.
struct Usage {
    catches: bool,
    throws: bool,
    sub_process_starts: usize,
    process_starts: usize,
}

fn message_usage(ctx: &ZeebeContext, message: &BpmnMessage) -> Usage {
    let all: Vec<DefEntry> = defs_of(ctx, "message", None)
        .into_iter()
        .filter(|d| {
            let r = as_message(d.def).and_then(|m| m.message_ref.as_deref());
            same(ctx.message(r), message)
        })
        .collect();
    let by_node = |types: &[&str]| {
        all.iter()
            .any(|d| types.contains(&d.entry.node.type_name()))
    };
    let task_ref = |type_name: &str| {
        ctx.nodes.iter().any(|n| {
            n.node.type_name() == type_name && same(ctx.message(n.node.message_ref()), message)
        })
    };
    Usage {
        catches: by_node(&CATCH) || task_ref("receiveTask"),
        throws: by_node(&THROW) || task_ref("sendTask"),
        sub_process_starts: all
            .iter()
            .filter(|d| is_sub_process_start(ctx, &d.entry))
            .count(),
        process_starts: all
            .iter()
            .filter(|d| is_process_start(ctx, &d.entry))
            .count(),
    }
}

fn message_root_rules(ctx: &mut ZeebeContext) {
    let defs = ctx.defs;
    for message in &defs.messages {
        let usage = message_usage(ctx, message);
        let name = message.name.as_deref();
        if usage.catches || usage.sub_process_starts == 1 {
            if blank(name) {
                message_name_missing(ctx, &message.id);
            }
            // Z63
            if ctx
                .zeebe(ext(&message.extension_elements), "subscription")
                .len()
                != 1
            {
                ctx.report(
                    "message-subscription",
                    &message.id,
                    "Must have exactly one zeebe:subscription extension element".into(),
                    "Add one zeebe:subscription with a correlationKey to the message.",
                );
            }
        } else if (usage.throws || usage.process_starts == 1) && blank(name) {
            message_name_missing(ctx, &message.id);
        }
        // Z64 / Z65: every zeebe:subscription, referenced or not.
        for sub in ctx.zeebe(ext(&message.extension_elements), "subscription") {
            let key = sub.attributes.get("correlationKey").map(String::as_str);
            let Some(key) = key.filter(|k| !k.is_empty()) else {
                ctx.report(
                    "subscription-correlation-key",
                    &message.id,
                    "Attribute 'correlationKey' must be present and not empty".into(),
                    "Set correlationKey on zeebe:subscription to a FEEL expression such as '=orderId'.",
                );
                // Zeebe's expression check treats an empty key as missing: one rejection, not two.
                continue;
            };
            if !is_expression(key) {
                ctx.report(
                    "correlation-key-expression",
                    &message.id,
                    static_value_message(key),
                    "Start the correlationKey with '=' so it is a FEEL expression.",
                );
            } else if feel_error(key).is_some() {
                ctx.report(
                    "correlation-key-expression",
                    &message.id,
                    feel_failure(key),
                    "Fix the FEEL syntax of the correlationKey.",
                );
            }
        }
        // Z66
        if let Some(name) = name.filter(|n| feel_error(n).is_some()) {
            ctx.report(
                "message-name-expression",
                &message.id,
                feel_failure(name),
                "Fix the FEEL syntax of the message name.",
            );
        }
    }
}

fn message_name_missing(ctx: &mut ZeebeContext, id: &str) {
    ctx.report(
        "message-name",
        id,
        "Name must be present and not empty".into(),
        "Give the message a non-empty name.",
    );
}

fn message_start_rules(ctx: &mut ZeebeContext) {
    for DefEntry { entry, def } in defs_of(ctx, "message", Some(&["startEvent"])) {
        if !is_process_start(ctx, &entry) {
            continue;
        }
        let r = as_message(def).and_then(|m| m.message_ref.as_deref());
        let Some(name) = ctx.message(r).and_then(|m| m.name.as_deref()) else {
            continue;
        };
        let id = &entry.node.base().id;
        match constant_name(name, "message") {
            Constant::Problem(problem) => {
                // Z67
                ctx.report(
                    "message-start-name-constant",
                    id,
                    problem,
                    "Use a static message name, or a FEEL expression that needs no variables.",
                );
            }
            Constant::Value(value) => {
                let length = value.encode_utf16().count();
                if length > ctx.limits.max_name_length {
                    // Z68
                    let max = ctx.limits.max_name_length;
                    ctx.report(
                        "message-start-name-length",
                        id,
                        format!("Expected message name '{value}' to be at most {max} characters long (configured max-name-length), but was {length} characters."),
                        "Shorten the message name.",
                    );
                }
            }
        }
    }
}

fn message_throw_rules(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        if !THROW.contains(&node.type_name()) {
            continue;
        }
        let Some(def) = definitions(node).iter().find_map(as_message) else {
            continue;
        };
        let publish = ctx
            .zeebe(ext(&def.extension_elements), "publishMessage")
            .len();
        let task = ctx
            .zeebe(&node.base().extension_elements, "taskDefinition")
            .len();
        let exactly_one = (publish == 1 && task == 0) || (publish == 0 && task == 1);
        let id = &node.base().id;
        if !exactly_one {
            // Z69
            ctx.report(
                "message-throw-implementation",
                id,
                "Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element".into(),
                "Add a zeebe:publishMessage to the message event definition, or a zeebe:taskDefinition to the event.",
            );
        } else if task == 0 && ctx.message(def.message_ref.as_deref()).is_none() {
            // Z70
            ctx.report(
                "message-throw-reference",
                id,
                "Must reference a message".into(),
                "Reference a message with messageRef on the message event definition.",
            );
        }
    }
    // Z71: Zeebe checks every zeebe:publishMessage, wherever it sits.
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        let mut holders: Vec<&[XmlElement]> = vec![&node.base().extension_elements];
        holders.extend(
            definitions(node)
                .iter()
                .filter_map(as_message)
                .map(|d| ext(&d.extension_elements)),
        );
        for holder in holders {
            for publish in ctx.zeebe(holder, "publishMessage") {
                if blank(publish.attributes.get("correlationKey").map(String::as_str)) {
                    ctx.report(
                        "publish-message-correlation-key",
                        &node.base().id,
                        "Attribute 'correlationKey' must be present and not empty".into(),
                        "Set correlationKey on zeebe:publishMessage to a FEEL expression such as '=orderId'.",
                    );
                }
            }
        }
    }
}

fn receive_task_rules(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        if !matches!(node, BpmnFlowElement::ReceiveTask(_)) {
            continue;
        }
        let Some(message) = ctx.message(node.message_ref()) else {
            continue;
        };
        let clash = ctx.boundaries(&node.base().id).iter().any(|b| {
            definitions(b.node)
                .iter()
                .filter_map(as_message)
                .any(|def| {
                    let other = ctx.message(def.message_ref.as_deref());
                    other
                        .and_then(|o| o.name.as_deref())
                        .is_some_and(|n| !n.is_empty() && Some(n) == message.name.as_deref())
                })
        });
        if clash {
            // Z73
            ctx.report(
                "receive-task-boundary-message",
                &node.base().id,
                "Cannot reference the same message name as a boundary event".into(),
                "Give the receive task and its boundary event messages different names.",
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Signals: Z74-Z76
// ---------------------------------------------------------------------------

fn signal_ref(def: &BpmnEventDefinition) -> Option<&str> {
    match def {
        BpmnEventDefinition::Signal(s) => s.signal_ref.as_deref(),
        _ => None,
    }
}

fn signal_usage(ctx: &ZeebeContext, signal: &BpmnSignal) -> (bool, usize, usize) {
    let all: Vec<DefEntry> = defs_of(ctx, "signal", None)
        .into_iter()
        .filter(|d| same(ctx.signal(signal_ref(d.def)), signal))
        .collect();
    let by_node = |types: &[&str]| {
        all.iter()
            .any(|d| types.contains(&d.entry.node.type_name()))
    };
    (
        by_node(&CATCH) || by_node(&THROW),
        all.iter()
            .filter(|d| is_sub_process_start(ctx, &d.entry))
            .count(),
        all.iter()
            .filter(|d| is_process_start(ctx, &d.entry))
            .count(),
    )
}

fn signal_rules(ctx: &mut ZeebeContext) {
    // Z74
    for DefEntry { entry, def } in defs_of(ctx, "signal", None) {
        if ctx.signal(signal_ref(def)).is_none() {
            ctx.report(
                "signal-reference",
                &entry.node.base().id,
                "Must reference a signal".into(),
                "Reference a signal with signalRef on the signal event definition.",
            );
        }
    }
    let defs = ctx.defs;
    for signal in &defs.signals {
        let (roles, sub_starts, process_starts) = signal_usage(ctx, signal);
        // Z75
        if (roles || sub_starts == 1 || process_starts > 0) && blank(signal.name.as_deref()) {
            ctx.report(
                "signal-name",
                &signal.id,
                "Name must be present and not empty".into(),
                "Give the signal a non-empty name.",
            );
        }
        // Z76, FEEL part
        if let Some(name) = signal.name.as_deref().filter(|n| feel_error(n).is_some()) {
            ctx.report(
                "signal-name-expression",
                &signal.id,
                feel_failure(name),
                "Fix the FEEL syntax of the signal name.",
            );
        }
    }
    // Z76, start events: no variables at deploy time
    for DefEntry { entry, def } in defs_of(ctx, "signal", Some(&["startEvent"])) {
        if !is_process_start(ctx, &entry) {
            continue;
        }
        let Some(name) = ctx.signal(signal_ref(def)).and_then(|s| s.name.as_deref()) else {
            continue;
        };
        if let Constant::Problem(problem) = constant_name(name, "signal") {
            ctx.report(
                "signal-name-expression",
                &entry.node.base().id,
                problem,
                "Use a static signal name, or a FEEL expression that needs no variables.",
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Errors and escalations: Z77-Z82
// ---------------------------------------------------------------------------

fn error_rules(ctx: &mut ZeebeContext) {
    for DefEntry { entry, def } in defs_of(ctx, "error", None) {
        let BpmnEventDefinition::Error(def) = def else {
            continue;
        };
        let error = ctx.error(def.error_ref.as_deref());
        let id = &entry.node.base().id;
        if entry.node.type_name() == "endEvent" {
            match error {
                // Z77
                None => ctx.report(
                    "error-end-reference",
                    id,
                    "Must reference an error".into(),
                    "Reference an error with errorRef on the error event definition.",
                ),
                // Z78
                Some(e) if blank(e.error_code.as_deref()) => ctx.report(
                    "error-code",
                    id,
                    "ErrorCode must be present and not empty".into(),
                    "Set an errorCode on the error.",
                ),
                Some(_) => {}
            }
        } else if error.is_some_and(|e| e.error_code.as_deref().is_some_and(|c| c.starts_with('=')))
        {
            // Z79: the code is matched literally, so a FEEL expression can never match
            ctx.report(
                "error-catch-code-expression",
                id,
                "The errorCode of the error catch event is not allowed to be an expression".into(),
                "Use a literal errorCode, without a leading '='.",
            );
        }
    }
}

fn escalation_rules(ctx: &mut ZeebeContext) {
    let mut thrown: Vec<&str> = vec![];
    for DefEntry { entry, def } in defs_of(ctx, "escalation", None) {
        let BpmnEventDefinition::Escalation(def) = def else {
            continue;
        };
        let escalation = ctx.escalation(def.escalation_ref.as_deref());
        let type_name = entry.node.type_name();
        let id = &entry.node.base().id;
        let throws = THROW.contains(&type_name);
        if throws && escalation.is_none() {
            // Z80
            ctx.report(
                "escalation-throw-reference",
                id,
                "Must reference an escalation".into(),
                "Reference an escalation with escalationRef on the escalation event definition.",
            );
        }
        let is_catch = type_name == "startEvent" || CATCH.contains(&type_name);
        if is_catch
            && escalation.is_some_and(|e| {
                e.escalation_code
                    .as_deref()
                    .is_some_and(|c| c.starts_with('='))
            })
        {
            // Z82
            ctx.report(
                "escalation-catch-code-expression",
                id,
                "The escalationCode of the escalation catch event is not allowed to be an expression".into(),
                "Use a literal escalationCode, without a leading '='.",
            );
        }
        if throws {
            if let Some(r) = def.escalation_ref.as_deref() {
                thrown.push(r);
            }
        }
    }
    // Z81
    let defs = ctx.defs;
    for escalation in &defs.escalations {
        if thrown.contains(&escalation.id.as_str()) && blank(escalation.escalation_code.as_deref())
        {
            ctx.report(
                "escalation-code",
                &escalation.id,
                "EscalationCode must be present and not empty".into(),
                "Set an escalationCode on the escalation.",
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Links: Z83-Z85
// ---------------------------------------------------------------------------

fn is_within(ctx: &ZeebeContext, scope: usize, ancestor: usize) -> bool {
    let mut s = Some(scope);
    while let Some(i) = s {
        if i == ancestor {
            return true;
        }
        s = ctx.scopes[i].parent;
    }
    false
}

fn link_name(def: &BpmnEventDefinition) -> Option<&str> {
    match def {
        BpmnEventDefinition::Link(l) => l.name.as_deref(),
        _ => None,
    }
}

fn link_rules(ctx: &mut ZeebeContext) {
    let links = defs_of(ctx, "link", None);
    // Z83
    for DefEntry { entry, def } in &links {
        if blank(link_name(def)) {
            ctx.report(
                "link-name",
                &entry.node.base().id,
                "Link name must be present and not empty.".into(),
                "Give the link event definition a name.",
            );
        }
    }
    let named = |type_name: &str| -> Vec<&DefEntry> {
        links
            .iter()
            .filter(|d| d.entry.node.type_name() == type_name && !blank(link_name(d.def)))
            .collect()
    };
    let catches = named("intermediateCatchEvent");
    let throws = named("intermediateThrowEvent");
    // Zeebe runs this for the process and for every sub-process: the catch events are
    // collected through nested sub-processes, the throw events only directly in it.
    for scope in 0..ctx.scopes.len() {
        let scope_id = ctx.scopes[scope].id;
        let below: Vec<&&DefEntry> = catches
            .iter()
            .filter(|d| is_within(ctx, d.entry.scope, scope))
            .collect();
        let mut counts: Vec<(&str, usize)> = vec![];
        for d in &below {
            let name = link_name(d.def).unwrap_or("");
            match counts.iter_mut().find(|(n, _)| *n == name) {
                Some((_, c)) => *c += 1,
                None => counts.push((name, 1)),
            }
        }
        for (name, count) in counts {
            if count > 1 {
                // Z85
                ctx.report(
                    "duplicate-link-catch",
                    scope_id,
                    format!("Multiple intermediate catch link event definitions with the same name '{name}' are not allowed."),
                    "Give each link catch event its own name.",
                );
            }
        }
        let direct: Vec<Option<&str>> = below
            .iter()
            .filter(|d| d.entry.scope == scope)
            .map(|d| link_name(d.def))
            .collect();
        for d in &throws {
            let name = link_name(d.def);
            if d.entry.scope != scope || direct.contains(&name) {
                continue;
            }
            // Z84
            ctx.report(
                "link-throw-catch",
                scope_id,
                format!(
                    "Can't find an catch link event for the throw link event with the name '{}'.",
                    name.unwrap_or("")
                ),
                "Add a link catch event with the same name in the same scope.",
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Compensation: Z86-Z89
// ---------------------------------------------------------------------------

const ACTIVITY_TYPES: [&str; 13] = [
    "task",
    "serviceTask",
    "scriptTask",
    "userTask",
    "businessRuleTask",
    "sendTask",
    "receiveTask",
    "manualTask",
    "callActivity",
    "subProcess",
    "eventSubProcess",
    "adHocSubProcess",
    "transaction",
];
const SUB_PROCESS_TYPES: [&str; 3] = ["subProcess", "adHocSubProcess", "transaction"];
const TASK_TYPES: [&str; 8] = [
    "task",
    "serviceTask",
    "scriptTask",
    "userTask",
    "businessRuleTask",
    "sendTask",
    "receiveTask",
    "manualTask",
];

fn compensation_rules(ctx: &mut ZeebeContext) {
    for DefEntry { entry, def } in defs_of(ctx, "compensate", None) {
        let BpmnEventDefinition::Compensate(def) = def else {
            continue;
        };
        let r = def.activity_ref.as_deref();
        let activity = ctx
            .node(r)
            .filter(|t| ACTIVITY_TYPES.contains(&t.node.type_name()));
        let id = &entry.node.base().id;
        let Some(activity) = activity else {
            if let Some(r) = r.filter(|r| !r.is_empty()) {
                // Z86
                ctx.report(
                    "compensation-activity-exists",
                    id,
                    format!("The referenced compensation activity '{r}' doesn't exist"),
                    "Point activityRef at an existing activity.",
                );
            }
            continue;
        };
        let activity_id = &activity.node.base().id;
        let has_handler = ctx.boundaries(activity_id).iter().any(|b| {
            definitions(b.node)
                .iter()
                .any(|d| d.type_name() == "compensate")
        });
        // A sub-process triggered by an event is not an embedded sub-process.
        let triggered = match activity.node {
            BpmnFlowElement::SubProcess(s) => s.triggered_by_event == Some(true),
            _ => false,
        };
        let embedded = SUB_PROCESS_TYPES.contains(&activity.node.type_name()) && !triggered;
        if !has_handler && !embedded {
            // Z87
            ctx.report(
                "compensation-activity-handler",
                id,
                format!("The referenced compensation activity '{activity_id}' must have either a compensation boundary event or be a subprocess"),
                "Attach a compensation boundary event to the activity, or reference an embedded sub-process.",
            );
        }
        let scope = &ctx.scopes[entry.scope];
        let same_scope = activity.scope == entry.scope
            || (scope.kind == ScopeKind::EventSubProcess && Some(activity.scope) == scope.parent);
        if !same_scope {
            // Z88
            ctx.report(
                "compensation-activity-scope",
                id,
                format!("The referenced compensation activity '{activity_id}' must be in the same scope as the compensation throw event"),
                "Reference an activity from the same scope as the compensation throw event.",
            );
        }
    }
    for entry in ctx.nodes.clone() {
        let node = entry.node;
        let base = node.base();
        if !TASK_TYPES.contains(&node.type_name()) || base.is_for_compensation != Some(true) {
            continue;
        }
        if !ctx.incoming(&base.id).is_empty() {
            handler_flows(ctx, &base.id, "incoming sequence flows");
        }
        if !ctx.outgoing(&base.id).is_empty() {
            handler_flows(ctx, &base.id, "outgoing sequence flows");
        }
        if !ctx.boundaries(&base.id).is_empty() {
            handler_flows(ctx, &base.id, "boundary events");
        }
    }
}

fn handler_flows(ctx: &mut ZeebeContext, id: &str, what: &str) {
    ctx.report(
        "compensation-handler-flows",
        id,
        format!("A compensation handler should have no {what}"),
        &format!("Remove the {what} of the compensation handler."),
    );
}
