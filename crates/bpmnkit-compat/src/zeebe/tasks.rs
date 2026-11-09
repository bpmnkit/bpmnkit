//! Twin of `zeebe-validate/rules/tasks.ts`: job workers (task definitions, headers,
//! scripts, send tasks, job priority, agent definitions), variable mappings and
//! secret references, linked resources.

use super::context::{
    feel_error, feel_failure, is_expression, static_value_message, NodeEntry, ScopeKind,
    ZeebeContext,
};
use crate::compat::feel::contains_secret_reference;
use crate::compat::pattern::js_trim;
use bpmnkit_bpmn::BpmnFlowElement;
use bpmnkit_feel::ast::{Node, NodeKind};
use bpmnkit_feel::{parse_partial, ParseOptions};
use bpmnkit_xml::XmlElement;

/// An element whose extension elements Zeebe validates, with the id findings are reported on.
struct Owner<'a> {
    id: &'a str,
    extension_elements: &'a [XmlElement],
    /// Absent for a process and a sequence flow.
    node: Option<&'a BpmnFlowElement>,
    is_process: bool,
}

/// Whether a process is validated: Zeebe skips a non-executable process, contents included.
fn executable(ctx: &ZeebeContext, process_id: &str) -> bool {
    ctx.defs
        .processes
        .iter()
        .any(|p| p.id == process_id && p.is_executable == Some(true))
}

/// The flow elements of executable processes.
fn nodes<'a>(ctx: &ZeebeContext<'a>) -> Vec<NodeEntry<'a>> {
    ctx.nodes
        .iter()
        .filter(|n| executable(ctx, ctx.scopes[n.scope].process_id))
        .copied()
        .collect()
}

/// Every element that can carry Zeebe extension elements: the processes, every flow
/// element of every scope, and every sequence flow.
fn owners<'a>(ctx: &ZeebeContext<'a>) -> Vec<Owner<'a>> {
    let mut out = vec![];
    for p in &ctx.defs.processes {
        if p.is_executable == Some(true) {
            out.push(Owner {
                id: &p.id,
                extension_elements: &p.extension_elements,
                node: None,
                is_process: true,
            });
        }
    }
    for entry in nodes(ctx) {
        out.push(Owner {
            id: &entry.node.base().id,
            extension_elements: &entry.node.base().extension_elements,
            node: Some(entry.node),
            is_process: false,
        });
    }
    for f in &ctx.flows {
        if executable(ctx, ctx.scopes[f.scope].process_id) {
            out.push(Owner {
                id: &f.flow.id,
                extension_elements: &f.flow.extension_elements,
                node: None,
                is_process: false,
            });
        }
    }
    out
}

/// The XML model reads an empty attribute as absent, so `""` counts as missing.
fn attr<'e>(el: &'e XmlElement, name: &str) -> Option<&'e str> {
    el.attributes
        .get(name)
        .map(String::as_str)
        .filter(|v| !v.is_empty())
}

/// What `ExpressionVerification` reports for one attribute.
fn expression_problem(value: Option<&str>, mandatory: bool, non_static: bool) -> Option<String> {
    let Some(value) = value else {
        return mandatory.then(|| "Expected expression but not found.".to_string());
    };
    if feel_error(value).is_some() {
        return Some(feel_failure(value));
    }
    if non_static && !is_expression(value) {
        return Some(static_value_message(value));
    }
    None
}

const PATH_PATTERN_TEXT: &str = "[a-zA-Z_][a-zA-Z0-9_]*(\\.[a-zA-Z_][a-zA-Z0-9_]*)*";
const PATH_RESERVED_WORDS: [&str; 11] = [
    "null", "true", "false", "function", "if", "then", "else", "for", "between", "instance", "of",
];

fn matches_path_pattern(target: &str) -> bool {
    target.split('.').all(|seg| {
        let mut chars = seg.chars();
        matches!(chars.next(), Some(c) if c.is_ascii_alphabetic() || c == '_')
            && chars.all(|c| c.is_ascii_alphanumeric() || c == '_')
    })
}

/// `ZeebeExpressionValidator.verifyPath`: both pattern and reserved-word errors can apply.
fn path_problems(target: Option<&str>) -> Vec<String> {
    let Some(target) = target else {
        return vec!["Expected path expression but not found.".to_string()];
    };
    let mut out = vec![];
    if !matches_path_pattern(target) {
        out.push(format!(
            "Expected path expression '{target}' but doesn't match the pattern '{PATH_PATTERN_TEXT}'."
        ));
    }
    if PATH_RESERVED_WORDS.contains(&target) {
        out.push(format!(
            "Expected path expression '{target}' but is one of the reserved words ({}).",
            PATH_RESERVED_WORDS.join(", ")
        ));
    }
    out
}

fn duplicate_message(local: &str) -> String {
    format!("Must have exactly one 'zeebe:{local}' extension element when exists. Please check process definition XML and retain only one extension element.")
}

const JOB_WORKER_MODE_MESSAGE: &str =
    "'zeebe:jobPriorityDefinition' is only allowed in job-worker mode ('zeebe:taskDefinition')";

fn mappings<'e>(ctx: &ZeebeContext, owner: &Owner<'e>, local: &str) -> Vec<&'e XmlElement> {
    ctx.zeebe(owner.extension_elements, "ioMapping")
        .into_iter()
        .flat_map(|m| ctx.zeebe_children(Some(m), local))
        .collect()
}

pub(super) fn check(ctx: &mut ZeebeContext) {
    service_task_definition(ctx);
    task_definition_attributes(ctx);
    duplicate_task_extension(ctx);
    task_headers(ctx);
    script_task_implementation(ctx);
    scripts(ctx);
    job_priority_mode(ctx);
    job_priority_value(ctx);
    send_tasks(ctx);
    input_mappings(ctx);
    output_mappings(ctx);
    secret_literal(ctx);
    secret_in_list(ctx);
    linked_resource_attributes(ctx);
    linked_resource_deployment(ctx);
    agent_definitions(ctx);
}

// Z90
fn service_task_definition(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let node = entry.node;
        if node.type_name() != "serviceTask" {
            continue;
        }
        if ctx
            .zeebe(&node.base().extension_elements, "taskDefinition")
            .len()
            != 1
        {
            ctx.report(
                "service-task-definition",
                &node.base().id,
                "Must have exactly one 'zeebe:taskDefinition' extension element".to_string(),
                "Add one zeebe:taskDefinition with a job type to the service task.",
            );
        }
    }
}

// Z91, Z92, Z93
fn task_definition_attributes(ctx: &mut ZeebeContext) {
    for owner in owners(ctx) {
        for td in ctx.zeebe(owner.extension_elements, "taskDefinition") {
            let ty = attr(td, "type");
            if ty.is_none() {
                ctx.report(
                    "task-definition-type",
                    owner.id,
                    "Attribute 'type' must be present and not empty".to_string(),
                    "Set the job type on zeebe:taskDefinition.",
                );
            }
            let retries = attr(td, "retries").unwrap_or("3");
            for value in [ty, Some(retries)] {
                if let Some(problem) = expression_problem(value, true, false) {
                    ctx.report(
                        "task-definition-expression",
                        owner.id,
                        problem,
                        "Write the job type and retries as a static value or a valid FEEL expression.",
                    );
                }
            }
        }
    }
}

/// The extension elements Zeebe allows at most once per element type.
fn single_extensions(ctx: &ZeebeContext, node: &BpmnFlowElement) -> Vec<&'static str> {
    let kind = node.type_name();
    let mut out: Vec<&'static str> = if matches!(
        kind,
        "dataObject" | "dataObjectReference" | "dataStoreReference"
    ) {
        vec![]
    } else {
        vec!["ioMapping", "executionListeners"]
    };
    let priority: &[&str] = if ctx.applies("job-priority-value") {
        &["jobPriorityDefinition"]
    } else {
        &[]
    };
    match kind {
        "serviceTask" => {
            out.extend(["taskHeaders", "linkedResources"]);
            out.extend(priority);
            if ctx.applies("agent-type-required") {
                out.push("agentDefinition");
            }
        }
        "sendTask" => {
            out.extend(["taskHeaders", "linkedResources"]);
            out.extend(priority);
        }
        "businessRuleTask" => {
            out.extend(["taskDefinition", "taskHeaders"]);
            out.extend(priority);
        }
        "scriptTask" => {
            out.extend(["script", "taskDefinition", "taskHeaders"]);
            out.extend(priority);
        }
        "endEvent" | "intermediateThrowEvent" => out.push("taskDefinition"),
        _ => {}
    }
    out
}

// Z94
fn duplicate_task_extension(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let node = entry.node;
        for local in single_extensions(ctx, node) {
            if ctx.zeebe(&node.base().extension_elements, local).len() > 1 {
                ctx.report(
                    "duplicate-task-extension",
                    &node.base().id,
                    duplicate_message(local),
                    &format!("Merge the zeebe:{local} elements into one."),
                );
            }
        }
    }
}

const RESERVED_HEADER_PREFIX: &str = "io.camunda.zeebe:";

// Z95, Z96
fn task_headers(ctx: &mut ZeebeContext) {
    for owner in owners(ctx) {
        for headers in ctx.zeebe(owner.extension_elements, "taskHeaders") {
            let keys: Vec<Option<&str>> = ctx
                .zeebe_children(Some(headers), "header")
                .into_iter()
                .map(|h| attr(h, "key"))
                .collect();
            for key in keys.iter().flatten() {
                if key.starts_with(RESERVED_HEADER_PREFIX) {
                    ctx.report(
                        "header-reserved-key",
                        owner.id,
                        format!("Attribute 'key' contains '{key}', but header keys starting with '{RESERVED_HEADER_PREFIX}' are reserved for internal use."),
                        &format!("Rename the header so it does not start with '{RESERVED_HEADER_PREFIX}'."),
                    );
                }
            }
            // a missing key is Java's null: distinct from the text "null", but printed the same
            let mut seen: Vec<Option<&str>> = vec![];
            let mut reported: Vec<Option<&str>> = vec![];
            for key in keys {
                if !seen.contains(&key) {
                    seen.push(key);
                    continue;
                }
                if reported.contains(&key) {
                    continue;
                }
                reported.push(key);
                ctx.report(
                    "duplicate-header-key",
                    owner.id,
                    format!(
                        "Headers contain duplicate entries for key '{}'",
                        key.unwrap_or("null")
                    ),
                    "Give every task header a distinct key.",
                );
            }
        }
    }
}

// Z98
fn script_task_implementation(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let node = entry.node;
        if node.type_name() != "scriptTask" {
            continue;
        }
        let ext = &node.base().extension_elements;
        let scripts = ctx.zeebe(ext, "script").len();
        let definitions = ctx.zeebe(ext, "taskDefinition").len();
        if !((scripts == 1 && definitions == 0) || (scripts == 0 && definitions == 1)) {
            ctx.report(
                "script-task-implementation",
                &node.base().id,
                "Must have either one 'zeebe:script' or one 'zeebe:taskDefinition' extension element".to_string(),
                "Give the script task one zeebe:script or one zeebe:taskDefinition.",
            );
        }
    }
}

// Z99, Z100
fn scripts(ctx: &mut ZeebeContext) {
    for owner in owners(ctx) {
        for script in ctx.zeebe(owner.extension_elements, "script") {
            let expression = attr(script, "expression");
            for name in ["expression", "resultVariable"] {
                if attr(script, name).is_none() {
                    ctx.report(
                        "script-attributes",
                        owner.id,
                        format!("Attribute '{name}' must be present and not empty"),
                        &format!("Set {name} on zeebe:script."),
                    );
                }
            }
            if let Some(problem) = expression_problem(expression, true, true) {
                ctx.report(
                    "script-expression",
                    owner.id,
                    problem,
                    "Write the script as a valid FEEL expression starting with '='.",
                );
            }
        }
    }
}

// Z101
fn job_priority_mode(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let node = entry.node;
        if !matches!(
            node.type_name(),
            "scriptTask" | "businessRuleTask" | "sendTask"
        ) {
            continue;
        }
        let ext = &node.base().extension_elements;
        if !ctx.zeebe(ext, "jobPriorityDefinition").is_empty()
            && ctx.zeebe(ext, "taskDefinition").is_empty()
        {
            ctx.report(
                "job-priority-mode",
                &node.base().id,
                JOB_WORKER_MODE_MESSAGE.to_string(),
                "Remove zeebe:jobPriorityDefinition, or implement the task as a job worker.",
            );
        }
    }
}

/// Java's `Integer.parseInt`: an optional sign, ASCII digits, within 32 bits.
fn is_java_int(text: &str) -> bool {
    let (negative, digits) = match text.as_bytes().first() {
        Some(b'-') => (true, &text[1..]),
        Some(b'+') => (false, &text[1..]),
        _ => (false, text),
    };
    if digits.is_empty() || !digits.bytes().all(|b| b.is_ascii_digit()) {
        return false;
    }
    let significant = digits.trim_start_matches('0');
    if significant.len() > 10 {
        return false;
    }
    let n: i64 = if significant.is_empty() {
        0
    } else {
        significant.parse().unwrap_or(i64::MAX)
    };
    let n = if negative { -n } else { n };
    (-2_147_483_648..=2_147_483_647).contains(&n)
}

// Z102
fn job_priority_value(ctx: &mut ZeebeContext) {
    for owner in owners(ctx) {
        for def in ctx.zeebe(owner.extension_elements, "jobPriorityDefinition") {
            let Some(priority) = attr(def, "priority") else {
                continue;
            };
            if priority.starts_with('=') || is_java_int(priority) {
                continue;
            }
            ctx.report(
                "job-priority-value",
                owner.id,
                format!("Expected 'priority' to be a literal integer or a FEEL expression (starting with '='), but got '{priority}'."),
                "Write the priority as an integer or a FEEL expression starting with '='.",
            );
        }
    }
}

// Z103, Z104
fn send_tasks(ctx: &mut ZeebeContext) {
    for entry in nodes(ctx) {
        let node = entry.node;
        if node.type_name() != "sendTask" {
            continue;
        }
        let ext = &node.base().extension_elements;
        let publish = ctx.zeebe(ext, "publishMessage").len();
        let definitions = ctx.zeebe(ext, "taskDefinition").len();
        if !((publish == 1 && definitions == 0) || (publish == 0 && definitions == 1)) {
            ctx.report(
                "send-task-implementation",
                &node.base().id,
                "Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element".to_string(),
                "Give the send task one zeebe:taskDefinition (or one zeebe:publishMessage).",
            );
        }
        if publish > 0 && ctx.message(node.message_ref()).is_none() {
            ctx.report(
                "send-task-message",
                &node.base().id,
                "Must reference a message".to_string(),
                "Set messageRef to a message defined in the file.",
            );
        }
    }
}

// Z105
fn input_mappings(ctx: &mut ZeebeContext) {
    for owner in owners(ctx) {
        for input in mappings(ctx, &owner, "input") {
            let mut problems = vec![expression_problem(attr(input, "source"), false, false)];
            problems.extend(path_problems(attr(input, "target")).into_iter().map(Some));
            for problem in problems.into_iter().flatten() {
                ctx.report(
                    "input-mapping",
                    owner.id,
                    problem,
                    "Use a valid FEEL source and a variable name or dotted path as target.",
                );
            }
        }
    }
}

// Z106
fn output_mappings(ctx: &mut ZeebeContext) {
    for owner in owners(ctx) {
        for output in mappings(ctx, &owner, "output") {
            let mut problems = vec![expression_problem(attr(output, "source"), true, true)];
            problems.extend(path_problems(attr(output, "target")).into_iter().map(Some));
            for problem in problems.into_iter().flatten() {
                ctx.report(
                    "output-mapping",
                    owner.id,
                    problem,
                    "Use a FEEL expression starting with '=' as source and a variable name or dotted path as target.",
                );
            }
        }
    }
}

/// Zeebe parses the source; an invalid expression is reported by the expression rules instead.
fn parses(source: &str) -> bool {
    feel_error(source).is_none()
}

/// Every whole double-quoted FEEL string literal (escapes included), as the global
/// regex `"[^"\\]*(?:\\.[^"\\]*)*"` finds them; `.` does not match a line terminator.
fn string_literals(text: &str) -> Vec<&str> {
    let is_line_terminator = |c: char| matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}');
    let mut out = vec![];
    let mut pos = 0;
    while let Some(rel) = text[pos..].find('"') {
        let start = pos + rel;
        let mut chars = text[start + 1..].char_indices();
        let mut end = None;
        while let Some((i, c)) = chars.next() {
            match c {
                '"' => {
                    end = Some(start + 1 + i + 1);
                    break;
                }
                '\\' => match chars.next() {
                    Some((_, n)) if !is_line_terminator(n) => {}
                    _ => break,
                },
                _ => {}
            }
        }
        match end {
            Some(end) => {
                out.push(&text[start..end]);
                pos = end;
            }
            None => pos = start + 1,
        }
    }
    out
}

/// `SecretReference.REFERENCE_PATTERN` matches in order, once each (Java's `\p{Alnum}` is ASCII).
fn secret_references(text: &str) -> Vec<String> {
    const PREFIX: &str = "camunda.secrets.";
    let mut out: Vec<String> = vec![];
    let mut pos = 0;
    while let Some(rel) = text[pos..].find(PREFIX) {
        let name_start = pos + rel + PREFIX.len();
        let name_len = text[name_start..]
            .bytes()
            .take_while(|b| b.is_ascii_alphanumeric() || *b == b'_' || *b == b'-')
            .count();
        if name_len == 0 {
            pos += rel + 1;
            continue;
        }
        let end = name_start + name_len;
        let m = text[pos + rel..end].to_string();
        if !out.contains(&m) {
            out.push(m);
        }
        pos = end;
    }
    out
}

/// `SecretReferenceLiteralValidator`: the references written as literal text.
fn literal_secret_references(source: &str) -> Vec<String> {
    if is_expression(source) {
        secret_references(&string_literals(&source[1..]).join("\n"))
    } else {
        secret_references(source)
    }
}

// Z107
fn secret_literal(ctx: &mut ZeebeContext) {
    fn check(ctx: &mut ZeebeContext, owner_id: &str, source: Option<&str>, location: &str) {
        let Some(source) = source else { return };
        if !parses(source) {
            return;
        }
        let refs = literal_secret_references(source);
        if refs.is_empty() {
            return;
        }
        let list = refs
            .iter()
            .map(|r| format!("'{r}'"))
            .collect::<Vec<_>>()
            .join(", ");
        ctx.report(
            "secret-literal",
            owner_id,
            format!("Secret reference(s) {list} must be used as an expression (e.g. '=camunda.secrets.<name>'), not as a string literal, in {location} '{source}'."),
            "Write the secret reference as a FEEL expression, outside quotes.",
        );
    }
    for owner in owners(ctx) {
        for input in mappings(ctx, &owner, "input") {
            check(ctx, owner.id, attr(input, "source"), "input mapping source");
        }
        for props in ctx.zeebe(owner.extension_elements, "properties") {
            for prop in ctx.zeebe_children(Some(props), "property") {
                check(ctx, owner.id, attr(prop, "value"), "property value");
            }
        }
    }
}

/// `SecretReference.containsReferenceInsideContainerLiteral`.
fn inside_container(node: &Node) -> bool {
    match &node.kind {
        NodeKind::List(_) | NodeKind::Context(_) => contains_secret_reference(node, false),
        NodeKind::If {
            then, otherwise, ..
        } => inside_container(then) || inside_container(otherwise),
        _ => false,
    }
}

/// `SecretReference.isImprecise`: a root context is descended entry by entry.
fn is_imprecise(node: &Node) -> bool {
    if let NodeKind::Context(entries) = &node.kind {
        return entries.iter().any(|(_, v)| is_imprecise(v));
    }
    inside_container(node)
}

// Z108
fn secret_in_list(ctx: &mut ZeebeContext) {
    for owner in owners(ctx) {
        for input in mappings(ctx, &owner, "input") {
            let Some(source) = attr(input, "source") else {
                continue;
            };
            if !is_expression(source) || !parses(source) {
                continue;
            }
            let partial = parse_partial(&source[1..], &ParseOptions::default());
            let Some(parsed) = partial.parsed else {
                continue;
            };
            if !is_imprecise(parsed.ast()) {
                continue;
            }
            ctx.report(
                "secret-in-list",
                owner.id,
                format!("Input mapping source '{source}' puts a secret reference inside a list, or inside a context built by an 'if' branch. Camunda can only replace a secret where the mapping assigns it directly to a value, so this secret would never be filled in. Assign each secret reference to its own input mapping instead."),
                "Map each secret reference to its own input variable.",
            );
        }
    }
}

const BINDING_TYPES: [&str; 3] = ["latest", "deployment", "versionTag"];

fn linked_resources<'e>(ctx: &ZeebeContext, owner: &Owner<'e>) -> Vec<&'e XmlElement> {
    ctx.zeebe(owner.extension_elements, "linkedResources")
        .into_iter()
        .flat_map(|r| ctx.zeebe_children(Some(r), "linkedResource"))
        .collect()
}

// Z110
fn linked_resource_attributes(ctx: &mut ZeebeContext) {
    for owner in owners(ctx) {
        for res in linked_resources(ctx, &owner) {
            let binding = attr(res, "bindingType");
            if let Some(binding) = binding {
                if !BINDING_TYPES.contains(&binding) {
                    // the model throws reading an unknown enum value, before any validator reports
                    ctx.report(
                        "linked-resource-attributes",
                        owner.id,
                        format!("No enum constant io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeBindingType.{binding}"),
                        &format!("Set bindingType to one of: {}.", BINDING_TYPES.join(", ")),
                    );
                    continue;
                }
            }
            for name in ["resourceId", "resourceType"] {
                if attr(res, name).is_none() {
                    ctx.report(
                        "linked-resource-attributes",
                        owner.id,
                        format!("Attribute '{name}' must be present and not empty"),
                        &format!("Set {name} on zeebe:linkedResource."),
                    );
                }
            }
        }
    }
}

// Z111: Zeebe looks only at the process's direct flow elements, and at their first zeebe:linkedResources
fn linked_resource_deployment(ctx: &mut ZeebeContext) {
    let Some(resolver) = ctx.resolver else { return };
    for entry in nodes(ctx) {
        if ctx.scopes[entry.scope].kind != ScopeKind::Process {
            continue;
        }
        let node = entry.node;
        let first = ctx
            .zeebe(&node.base().extension_elements, "linkedResources")
            .first()
            .copied();
        for res in ctx.zeebe_children(first, "linkedResource") {
            let Some(id) = attr(res, "resourceId") else {
                continue;
            };
            if attr(res, "bindingType") != Some("deployment") || id.starts_with('=') {
                continue;
            }
            if js_trim(id).is_empty() {
                continue;
            }
            let is_form = attr(res, "resourceType").unwrap_or("").to_lowercase() == "form";
            let found = if is_form {
                resolver.has_form(id)
            } else {
                resolver.has_resource(id)
            };
            if found != Some(false) {
                continue;
            }
            let what = if is_form { "form" } else { "resource" };
            ctx.report(
                "linked-resource-deployment",
                &node.base().id,
                format!(
                    "Expected to find {what} with id '{id}' in current deployment, but not found."
                ),
                &format!(
                    "Deploy the {what} '{id}' together with the process, or bind it by 'latest'."
                ),
            );
        }
    }
}

const AGENT_TYPES: [&str; 3] = ["aiAgentSubProcess", "aiAgentTask", "external"];

// Z112, Z113
fn agent_definitions(ctx: &mut ZeebeContext) {
    for owner in owners(ctx) {
        let defs = ctx.zeebe(owner.extension_elements, "agentDefinition");
        for def in &defs {
            match attr(def, "agentType") {
                None => ctx.report(
                    "agent-type-required",
                    owner.id,
                    "Attribute 'agentType' must be present and not empty".to_string(),
                    &format!(
                        "Set agentType on zeebe:agentDefinition to one of: {}.",
                        AGENT_TYPES.join(", ")
                    ),
                ),
                Some(ty) if !AGENT_TYPES.contains(&ty) => ctx.report(
                    "agent-type-required",
                    owner.id,
                    format!("No enum constant io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeAgentType.{ty}"),
                    &format!("Set agentType to one of: {}.", AGENT_TYPES.join(", ")),
                ),
                Some(_) => {}
            }
        }
        // AgentDefinitionValidator applies to flow elements, and only to the first definition
        if owner.is_process {
            continue;
        }
        let ty = defs.first().and_then(|d| attr(d, "agentType"));
        let kind = owner.node.map(BpmnFlowElement::type_name);
        let message = match ty {
            Some("aiAgentSubProcess") if kind != Some("adHocSubProcess") => {
                Some("agentType 'aiAgentSubProcess' is only allowed on an ad-hoc sub-process.")
            }
            Some("aiAgentTask") if kind != Some("serviceTask") => {
                Some("agentType 'aiAgentTask' is only allowed on a service task.")
            }
            Some("external") if kind != Some("serviceTask") && kind != Some("adHocSubProcess") => {
                Some("agentType 'external' is only allowed on a service task or an ad-hoc sub-process.")
            }
            _ => None,
        };
        if let Some(message) = message {
            ctx.report(
                "agent-type-placement",
                owner.id,
                message.to_string(),
                "Use the agent type that matches the element, or move the agent definition.",
            );
        }
    }
}
