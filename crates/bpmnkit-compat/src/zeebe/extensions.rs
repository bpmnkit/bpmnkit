//! Twin of `zeebe-validate/rules/extensions.ts`: user tasks, call activities, business rule
//! tasks, generic FEEL, execution listeners and deployment-context rules.
//!
//! Zeebe reads an attribute set to "" as absent, so `attr` does too.

use super::context::{feel_error, feel_failure, is_expression, ZeebeContext};
use crate::compat::pattern::{is_js_space, js_trim};
use bpmnkit_xml::XmlElement;
use std::collections::HashSet;

/// An attribute value; "" counts as absent because Zeebe's model reads it as null.
fn attr<'e>(el: &'e XmlElement, name: &str) -> Option<&'e str> {
    el.attributes
        .get(name)
        .map(String::as_str)
        .filter(|v| !v.is_empty())
}

fn is_blank(value: Option<&str>) -> bool {
    value.is_none_or(|v| js_trim(v).is_empty())
}

#[derive(Clone, Copy)]
struct Owner<'a> {
    id: &'a str,
    type_name: &'static str,
    holder: &'a [XmlElement],
}

/// Everything that can carry `extensionElements` with listeners: the processes, flow nodes and flows.
fn owners<'a>(ctx: &ZeebeContext<'a>) -> Vec<Owner<'a>> {
    let mut out: Vec<Owner<'a>> = ctx
        .defs
        .processes
        .iter()
        .map(|p| Owner {
            id: &p.id,
            type_name: "process",
            holder: &p.extension_elements,
        })
        .collect();
    for entry in &ctx.nodes {
        let base = entry.node.base();
        // TS reports an event sub-process as a plain subProcess here.
        let type_name = match entry.node.type_name() {
            "eventSubProcess" => "subProcess",
            t => t,
        };
        out.push(Owner {
            id: &base.id,
            type_name,
            holder: &base.extension_elements,
        });
    }
    for entry in &ctx.flows {
        out.push(Owner {
            id: &entry.flow.id,
            type_name: "sequenceFlow",
            holder: &entry.flow.extension_elements,
        });
    }
    out
}

fn node_owners<'a>(ctx: &ZeebeContext<'a>) -> Vec<Owner<'a>> {
    owners(ctx)
        .into_iter()
        .filter(|o| o.type_name != "process" && o.type_name != "sequenceFlow")
        .collect()
}

fn all_digits(s: &str) -> bool {
    !s.is_empty() && s.bytes().all(|b| b.is_ascii_digit())
}

/// The static priority/number text Java's `new BigDecimal(text)` accepts.
fn is_decimal(text: &str) -> bool {
    let t = text.strip_prefix(['+', '-']).unwrap_or(text);
    let (mantissa, exp) = match t.find(['e', 'E']) {
        Some(i) => (&t[..i], Some(&t[i + 1..])),
        None => (t, None),
    };
    if let Some(e) = exp {
        let digits = e.strip_prefix(['+', '-']).unwrap_or(e);
        if !all_digits(digits) {
            return false;
        }
    }
    match mantissa.split_once('.') {
        None => all_digits(mantissa),
        Some((int, frac)) => {
            (all_digits(int) && (frac.is_empty() || all_digits(frac)))
                || (int.is_empty() && all_digits(frac))
        }
    }
}

/// Zeebe's static-number test: a decimal with no fraction.
fn is_static_integer(text: &str) -> bool {
    if !is_decimal(text) {
        return false;
    }
    // Rust's float parser accepts every shape `is_decimal` does.
    text.parse::<f64>()
        .is_ok_and(|n| n.is_finite() && n % 1.0 == 0.0)
}

/// `ZonedDateTime.parse`: an ISO date-time with an offset, e.g. `2023-03-02T15:35+02:00`.
fn is_zoned_date_time(text: &str) -> bool {
    let c: Vec<char> = text.chars().collect();
    let mut i = 0;
    let digits = |i: &mut usize, n: usize| -> Option<i64> {
        let slice = c.get(*i..*i + n)?;
        if !slice.iter().all(char::is_ascii_digit) {
            return None;
        }
        *i += n;
        slice.iter().collect::<String>().parse().ok()
    };
    let year = match c.first() {
        Some('+' | '-') => {
            let neg = c[0] == '-';
            i = 1;
            let start = i;
            while i < c.len() && c[i].is_ascii_digit() {
                i += 1;
            }
            let n = i - start;
            if !(5..=10).contains(&n) {
                return false;
            }
            let v: i64 = c[start..i].iter().collect::<String>().parse().unwrap_or(0);
            if neg {
                -v
            } else {
                v
            }
        }
        _ => match digits(&mut i, 4) {
            Some(v) => v,
            None => return false,
        },
    };
    if c.get(i) != Some(&'-') {
        return false;
    }
    i += 1;
    let Some(month) = digits(&mut i, 2) else {
        return false;
    };
    if c.get(i) != Some(&'-') {
        return false;
    }
    i += 1;
    let Some(day) = digits(&mut i, 2) else {
        return false;
    };
    if !matches!(c.get(i), Some('T' | 't')) {
        return false;
    }
    i += 1;
    let Some(hour) = digits(&mut i, 2) else {
        return false;
    };
    if c.get(i) != Some(&':') {
        return false;
    }
    i += 1;
    let Some(minute) = digits(&mut i, 2) else {
        return false;
    };
    let mut second = 0;
    if c.get(i) == Some(&':') {
        i += 1;
        let Some(s) = digits(&mut i, 2) else {
            return false;
        };
        second = s;
        if c.get(i) == Some(&'.') {
            i += 1;
            let start = i;
            while i < c.len() && c[i].is_ascii_digit() {
                i += 1;
            }
            if !(1..=9).contains(&(i - start)) {
                return false;
            }
        }
    }
    let mut offset: Option<(i64, i64)> = None;
    match c.get(i) {
        Some('Z' | 'z') => i += 1,
        Some('+' | '-') => {
            i += 1;
            let Some(oh) = digits(&mut i, 2) else {
                return false;
            };
            if c.get(i) != Some(&':') {
                return false;
            }
            i += 1;
            let Some(om) = digits(&mut i, 2) else {
                return false;
            };
            offset = Some((oh, om));
            if c.get(i) == Some(&':') {
                i += 1;
                if digits(&mut i, 2).is_none() {
                    return false;
                }
            }
        }
        _ => return false,
    }
    if c.get(i) == Some(&'[') {
        i += 1;
        let start = i;
        while i < c.len() && c[i] != ']' && !is_js_space(c[i]) {
            i += 1;
        }
        if i == start || c.get(i) != Some(&']') {
            return false;
        }
        i += 1;
    }
    if i != c.len() {
        return false;
    }
    let leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    let days = [
        31,
        if leap { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
    let Some(&max_day) = usize::try_from(month - 1).ok().and_then(|m| days.get(m)) else {
        return false;
    };
    if day < 1 || day > max_day || hour > 24 || minute > 59 || second > 60 {
        return false;
    }
    if hour == 24 && (minute != 0 || second != 0) {
        return false;
    }
    offset.is_none_or(|(h, m)| h <= 18 && m <= 59)
}

/// Zeebe's `parseListOfCsv`: no blank entry between commas (Java's split drops trailing empties).
fn is_list_of_csv(text: &str) -> bool {
    if text.is_empty() {
        return true;
    }
    let all: Vec<&str> = text.split(',').collect();
    let mut parts = all.clone();
    while parts.last() == Some(&"") {
        parts.pop();
    }
    let values = parts.iter().filter(|p| !js_trim(p).is_empty()).count();
    values >= all.len()
}

fn dup_message(name: &str) -> String {
    format!("Must have exactly one 'zeebe:{name}' extension element when exists. Please check process definition XML and retain only one extension element.")
}

const USER_TASK_SINGLES: [&str; 7] = [
    "userTask",
    "assignmentDefinition",
    "formDefinition",
    "taskHeaders",
    "taskSchedule",
    "priorityDefinition",
    "taskListeners",
];

/// Z114
fn duplicate_user_task_extension(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        if entry.node.type_name() != "userTask" {
            continue;
        }
        let base = entry.node.base();
        for name in USER_TASK_SINGLES {
            if ctx.zeebe(&base.extension_elements, name).len() > 1 {
                ctx.report(
                    "duplicate-user-task-extension",
                    &base.id,
                    dup_message(name),
                    &format!("Keep a single zeebe:{name} element on the user task."),
                );
            }
        }
    }
}

/// Z115, Z116, Z117: every zeebe:formDefinition.
fn form_definition(ctx: &mut ZeebeContext) {
    for owner in node_owners(ctx) {
        let id = owner.id;
        let native = !ctx.zeebe(owner.holder, "userTask").is_empty();
        for form in ctx.zeebe(owner.holder, "formDefinition") {
            let form_id = attr(form, "formId");
            if native {
                if is_blank(attr(form, "externalReference")) == is_blank(form_id) {
                    ctx.report(
                        "form-definition-native",
                        id,
                        "Exactly one of the attributes 'formId, externalReference' must be present and not blank for native user tasks".to_string(),
                        "Set either formId or externalReference on the form definition, not both.",
                    );
                }
            } else if is_blank(attr(form, "formKey")) == is_blank(form_id) {
                ctx.report(
                    "form-definition-job-worker",
                    id,
                    "Exactly one of the attributes 'formId, formKey' must be present and not blank"
                        .to_string(),
                    "Set either formId or formKey on the form definition, not both.",
                );
            }
            binding_type(ctx, form, id, "form-binding-type");
        }
    }
}

const BINDING_TYPES: [&str; 3] = ["deployment", "latest", "versionTag"];

/// The binding-type rules shared by calledElement, calledDecision and formDefinition (Z117, Z129, Z135).
fn binding_type(ctx: &mut ZeebeContext, el: &XmlElement, id: &str, rule: &str) {
    let kind = attr(el, "bindingType");
    let version_tag = attr(el, "versionTag");
    if kind.is_some_and(|k| !BINDING_TYPES.contains(&k)) {
        ctx.report(
            rule,
            id,
            "Attribute 'bindingType' must be one of: deployment, latest, versionTag".to_string(),
            "Use bindingType deployment, latest or versionTag.",
        );
    }
    if kind == Some("versionTag") && is_blank(version_tag) {
        ctx.report(
            rule,
            id,
            "Attribute 'versionTag' must be present and not empty if 'bindingType' is 'versionTag'"
                .to_string(),
            "Set versionTag, or use another bindingType.",
        );
    } else if kind != Some("versionTag") && !is_blank(version_tag) {
        ctx.report(
            rule,
            id,
            "Attribute 'versionTag' may only be used if 'bindingType' is 'versionTag'".to_string(),
            "Remove versionTag, or set bindingType to versionTag.",
        );
    }
}

/// The top-level flow nodes of executable processes: all Zeebe's deployment-binding validators visit.
fn top_level<'a>(
    ctx: &ZeebeContext<'a>,
    type_name: &str,
) -> Vec<&'a bpmnkit_bpmn::BpmnFlowElement> {
    let executable: HashSet<&str> = ctx
        .defs
        .processes
        .iter()
        .filter(|p| p.is_executable == Some(true))
        .map(|p| p.id.as_str())
        .collect();
    ctx.nodes
        .iter()
        .filter(|n| {
            let scope = &ctx.scopes[n.scope];
            scope.kind == super::context::ScopeKind::Process
                && executable.contains(scope.id)
                && n.node.type_name() == type_name
        })
        .map(|n| n.node)
        .collect()
}

/// Z118: bindingType=deployment needs the form in the deployment.
fn form_deployment(ctx: &mut ZeebeContext) {
    let Some(resolver) = ctx.resolver else {
        return;
    };
    for node in top_level(ctx, "userTask") {
        let base = node.base();
        let form = ctx
            .zeebe(&base.extension_elements, "formDefinition")
            .first()
            .copied();
        let Some(form) = form else { continue };
        let Some(form_id) = attr(form, "formId") else {
            continue;
        };
        if attr(form, "bindingType") != Some("deployment") {
            continue;
        }
        if form_id.starts_with('=') || resolver.has_form(form_id) != Some(false) {
            continue;
        }
        ctx.report(
            "form-deployment",
            &base.id,
            format!(
                "Expected to find form with id '{form_id}' in current deployment, but not found."
            ),
            "Deploy the form together with the process, or use another bindingType.",
        );
    }
}

/// Z119: the embedded form.
fn embedded_form(ctx: &mut ZeebeContext) {
    for owner in node_owners(ctx) {
        for form in ctx.zeebe(owner.holder, "userTaskForm") {
            if attr(form, "id").is_none() {
                ctx.report(
                    "embedded-form",
                    owner.id,
                    "Element id must be present and not empty.".to_string(),
                    "Give the embedded form an id.",
                );
            }
            if js_trim(form.text.as_deref().unwrap_or("")).is_empty() {
                ctx.report(
                    "embedded-form",
                    owner.id,
                    "User task form text content has to be present and not empty".to_string(),
                    "Add the form schema as the content of the userTaskForm element.",
                );
            }
        }
    }
}

fn feel_parse(ctx: &mut ZeebeContext, id: &str, value: Option<&str>) {
    let Some(value) = value else { return };
    if feel_error(value).is_some() {
        ctx.report(
            "feel-parse",
            id,
            feel_failure(value),
            "Fix the FEEL expression, or remove the leading '=' for a static value.",
        );
    }
}

/// Z120, Z121, Z122 and the FEEL parse of their attributes (Z167).
fn user_task_expressions(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        if entry.node.type_name() != "userTask" {
            continue;
        }
        let base = entry.node.base();
        let id = base.id.as_str();
        let ext = &base.extension_elements;
        for assignment in ctx.zeebe(ext, "assignmentDefinition") {
            feel_parse(ctx, id, attr(assignment, "assignee"));
            for name in ["candidateGroups", "candidateUsers"] {
                let value = attr(assignment, name);
                feel_parse(ctx, id, value);
                if let Some(value) = value {
                    if !is_expression(value) && !is_list_of_csv(value) {
                        ctx.report(
                            "assignment-expression",
                            id,
                            format!("Expected static value to be a list of comma-separated values, e.g. 'a,b,c', but found '{value}'."),
                            &format!("Write {name} as comma-separated values without empty entries, or as a FEEL expression."),
                        );
                    }
                }
            }
        }
        for schedule in ctx.zeebe(ext, "taskSchedule") {
            for name in ["dueDate", "followUpDate"] {
                let value = attr(schedule, name);
                feel_parse(ctx, id, value);
                if let Some(value) = value {
                    if !is_expression(value) && !is_zoned_date_time(value) {
                        ctx.report(
                            "task-schedule-date",
                            id,
                            format!("Expected static value to be a valid DateTime String, e.g. '2023-03-02T15:35+02:00', but found '{value}'."),
                            &format!("Write {name} as an ISO 8601 date-time with an offset, or as a FEEL expression."),
                        );
                    }
                }
            }
        }
        for definition in ctx.zeebe(ext, "priorityDefinition") {
            // An absent priority defaults to 50 in Zeebe's model, so it is never missing.
            let value = attr(definition, "priority");
            feel_parse(ctx, id, value);
            let Some(value) = value else { continue };
            if is_expression(value) {
                continue;
            }
            if !is_static_integer(value) {
                ctx.report(
                    "user-task-priority",
                    id,
                    format!("Expected static value to be a valid Number between 0 and 100, but found '{value}'."),
                    "Set the priority to a whole number from 0 to 100, or a FEEL expression.",
                );
            } else if all_digits(value.strip_prefix(['+', '-']).unwrap_or(value)) {
                let n: f64 = value.parse().unwrap_or(0.0);
                if n.abs() <= 2147483647.0 && !(0.0..=100.0).contains(&n) {
                    ctx.report(
                        "user-task-priority",
                        id,
                        format!("Priority must be a number between 0 and 100, but was '{value}'."),
                        "Set the priority to a whole number from 0 to 100.",
                    );
                }
            }
        }
    }
}

const TASK_LISTENER_EVENTS: [&str; 10] = [
    "create",
    "assignment",
    "update",
    "complete",
    "cancel",
    "creating",
    "assigning",
    "updating",
    "completing",
    "canceling",
];

/// Z123, Z124: task listeners.
fn task_listeners(ctx: &mut ZeebeContext) {
    for owner in node_owners(ctx) {
        let id = owner.id;
        let native = !ctx.zeebe(owner.holder, "userTask").is_empty();
        for listeners in ctx.zeebe(owner.holder, "taskListeners") {
            let children = ctx.zeebe_children(Some(listeners), "taskListener");
            if !children.is_empty() && !native {
                ctx.report(
                    "task-listener-placement",
                    id,
                    "Task listeners are only allowed on Camunda user tasks.".to_string(),
                    "Add zeebe:userTask to the user task, or remove the task listeners.",
                );
            }
            for listener in children {
                match attr(listener, "eventType") {
                    None => ctx.report(
                        "task-listener-attributes",
                        id,
                        "Attribute 'eventType' must be present and not empty".to_string(),
                        "Set eventType on the task listener.",
                    ),
                    Some(e) if !TASK_LISTENER_EVENTS.contains(&e) => ctx.report(
                        "task-listener-attributes",
                        id,
                        format!("No enum constant io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeTaskListenerEventType.{e}"),
                        "Use a task listener event type such as creating, assigning or completing.",
                    ),
                    Some(_) => {}
                }
                if attr(listener, "type").is_none() {
                    ctx.report(
                        "task-listener-attributes",
                        id,
                        "Attribute 'type' must be present and not empty".to_string(),
                        "Set type on the task listener.",
                    );
                }
            }
        }
    }
}

/// Z125, Z126, Z127: call activity and its calledElement.
fn called_element(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        if entry.node.type_name() != "callActivity" {
            continue;
        }
        let base = entry.node.base();
        let id = base.id.as_str();
        let elements = ctx.zeebe(&base.extension_elements, "calledElement");
        if elements.len() != 1 {
            ctx.report(
                "call-activity-called-element",
                id,
                "Must have exactly one 'zeebe:calledElement' extension element".to_string(),
                "Add a single zeebe:calledElement with the called process id.",
            );
        }
        for el in elements {
            match attr(el, "processId") {
                None => {
                    ctx.report(
                        "called-element-process-id",
                        id,
                        "Attribute 'processId' must be present and not empty".to_string(),
                        "Set processId on the zeebe:calledElement.",
                    );
                    ctx.report(
                        "called-element-expression",
                        id,
                        "Expected expression but not found.".to_string(),
                        "Set processId on the zeebe:calledElement.",
                    );
                }
                Some(pid) if feel_error(pid).is_some() => ctx.report(
                    "called-element-expression",
                    id,
                    feel_failure(pid),
                    "Fix the FEEL expression in processId, or remove the leading '='.",
                ),
                Some(_) => {}
            }
            // businessId arrived after 8.9.28, whose model does not know the attribute; the rule is
            // read from the spec (EngineConfiguration / BusinessIdValidator), not confirmed by ZCheck.
            if let Some(business_id) = attr(el, "businessId") {
                if feel_error(business_id).is_some() {
                    ctx.report(
                        "called-element-business-id",
                        id,
                        feel_failure(business_id),
                        "Fix the FEEL expression in businessId, or remove the leading '='.",
                    );
                } else if !is_expression(business_id) && business_id.encode_utf16().count() > 256 {
                    ctx.report(
                        "called-element-business-id",
                        id,
                        format!("Expected static value to be no longer than 256 characters, but found '{business_id}'."),
                        "Shorten businessId to at most 256 characters.",
                    );
                }
            }
            binding_type(ctx, el, id, "called-element-binding-type");
        }
    }
}

/// Z130: bindingType=deployment needs the called process in the deployment.
fn called_element_deployment(ctx: &mut ZeebeContext) {
    let Some(resolver) = ctx.resolver else {
        return;
    };
    let own: HashSet<&str> = ctx
        .defs
        .processes
        .iter()
        .filter(|p| p.is_executable == Some(true))
        .map(|p| p.id.as_str())
        .collect();
    for node in top_level(ctx, "callActivity") {
        let base = node.base();
        let Some(el) = ctx
            .zeebe(&base.extension_elements, "calledElement")
            .first()
            .copied()
        else {
            continue;
        };
        let Some(process_id) = attr(el, "processId") else {
            continue;
        };
        if attr(el, "bindingType") != Some("deployment") {
            continue;
        }
        if process_id.starts_with('=')
            || own.contains(process_id)
            || resolver.has_process(process_id) != Some(false)
        {
            continue;
        }
        ctx.report(
            "called-element-deployment",
            &base.id,
            format!("Expected to find process with id '{process_id}' in current deployment, but not found."),
            "Deploy the called process together with this one, or use another bindingType.",
        );
    }
}

/// Z132, Z133, Z134, Z135, Z137: business rule task.
fn business_rule_task(ctx: &mut ZeebeContext) {
    for entry in ctx.nodes.clone() {
        if entry.node.type_name() != "businessRuleTask" {
            continue;
        }
        let base = entry.node.base();
        let id = base.id.as_str();
        let decisions = ctx.zeebe(&base.extension_elements, "calledDecision");
        let definitions = ctx.zeebe(&base.extension_elements, "taskDefinition");
        if !((decisions.len() == 1 && definitions.is_empty())
            || (decisions.is_empty() && definitions.len() == 1))
        {
            ctx.report(
                "business-rule-task-implementation",
                id,
                "Must have either one 'zeebe:calledDecision' or one 'zeebe:taskDefinition' extension element".to_string(),
                "Give the task one zeebe:calledDecision or one zeebe:taskDefinition, not both.",
            );
        }
        if decisions.len() > 1 {
            ctx.report(
                "duplicate-called-decision",
                id,
                dup_message("calledDecision"),
                "Keep a single zeebe:calledDecision element on the task.",
            );
        }
        for el in decisions {
            match attr(el, "decisionId") {
                None => {
                    ctx.report(
                        "called-decision-attributes",
                        id,
                        "Attribute 'decisionId' must be present and not empty".to_string(),
                        "Set decisionId on the zeebe:calledDecision.",
                    );
                    ctx.report(
                        "called-decision-expression",
                        id,
                        "Expected expression but not found.".to_string(),
                        "Set decisionId on the zeebe:calledDecision.",
                    );
                }
                Some(d) if feel_error(d).is_some() => ctx.report(
                    "called-decision-expression",
                    id,
                    feel_failure(d),
                    "Fix the FEEL expression in decisionId, or remove the leading '='.",
                ),
                Some(_) => {}
            }
            if attr(el, "resultVariable").is_none() {
                ctx.report(
                    "called-decision-attributes",
                    id,
                    "Attribute 'resultVariable' must be present and not empty".to_string(),
                    "Set resultVariable on the zeebe:calledDecision.",
                );
            }
            binding_type(ctx, el, id, "called-decision-binding-type");
        }
    }
}

/// Z136: bindingType=deployment needs the decision in the deployment.
fn called_decision_deployment(ctx: &mut ZeebeContext) {
    let Some(resolver) = ctx.resolver else {
        return;
    };
    for node in top_level(ctx, "businessRuleTask") {
        let base = node.base();
        let Some(el) = ctx
            .zeebe(&base.extension_elements, "calledDecision")
            .first()
            .copied()
        else {
            continue;
        };
        let Some(decision_id) = attr(el, "decisionId") else {
            continue;
        };
        if attr(el, "bindingType") != Some("deployment") {
            continue;
        }
        if decision_id.starts_with('=') || resolver.has_decision(decision_id) != Some(false) {
            continue;
        }
        ctx.report(
            "called-decision-deployment",
            &base.id,
            format!("Expected to find decision with id '{decision_id}' in current deployment, but not found."),
            "Deploy the decision together with the process, or use another bindingType.",
        );
    }
}

const EXECUTION_LISTENER_ELEMENTS: [&str; 21] = [
    "process",
    "subProcess",
    "callActivity",
    "adHocSubProcess",
    "task",
    "sendTask",
    "serviceTask",
    "scriptTask",
    "userTask",
    "receiveTask",
    "businessRuleTask",
    "manualTask",
    "startEvent",
    "intermediateThrowEvent",
    "intermediateCatchEvent",
    "boundaryEvent",
    "endEvent",
    "exclusiveGateway",
    "inclusiveGateway",
    "parallelGateway",
    "eventBasedGateway",
];

/// Z175, Z177, Z178, Z179: execution listeners.
fn execution_listeners(ctx: &mut ZeebeContext) {
    // 'cancel' and 'beforeAll' only became event types together with their placement rules.
    let cancel_known = ctx.applies("cancel-listener-placement");
    let before_all_known = ctx.applies("before-all-listener");
    for owner in owners(ctx) {
        let (id, type_name) = (owner.id, owner.type_name);
        for listeners in ctx.zeebe(owner.holder, "executionListeners") {
            let children = ctx.zeebe_children(Some(listeners), "executionListener");
            for listener in &children {
                match attr(listener, "eventType") {
                    None => ctx.report(
                        "execution-listener-attributes",
                        id,
                        "Attribute 'eventType' must be present and not empty".to_string(),
                        "Set eventType on the execution listener.",
                    ),
                    Some(e)
                        if e != "start"
                            && e != "end"
                            && !(cancel_known && e == "cancel")
                            && !(before_all_known && e == "beforeAll") =>
                    {
                        ctx.report(
                            "execution-listener-attributes",
                            id,
                            format!("No enum constant io.camunda.zeebe.model.bpmn.instance.zeebe.ZeebeExecutionListenerEventType.{e}"),
                            "Use the execution listener event type start or end.",
                        );
                    }
                    Some(_) => {}
                }
                if attr(listener, "type").is_none() {
                    ctx.report(
                        "execution-listener-attributes",
                        id,
                        "Attribute 'type' must be present and not empty".to_string(),
                        "Set type on the execution listener.",
                    );
                }
            }
            if children.is_empty() {
                continue;
            }
            if !EXECUTION_LISTENER_ELEMENTS.contains(&type_name) {
                ctx.report(
                    "execution-listener-placement",
                    id,
                    format!("Execution listeners are not supported for the '{type_name}' element. Currently, only [{}] elements can have execution listeners.", EXECUTION_LISTENER_ELEMENTS.join(", ")),
                    "Move the execution listeners to a supported element or remove them.",
                );
                continue;
            }
            for listener in &children {
                if attr(listener, "eventType") == Some("cancel") && type_name != "process" {
                    ctx.report(
                        "cancel-listener-placement",
                        id,
                        format!("The 'cancel' execution listener event type is not supported for the '{type_name}' element. The 'cancel' event type is only supported on the 'process' element."),
                        "Use the cancel event type on the process only.",
                    );
                }
            }
            // (eventType, type, count) in first-seen order.
            let mut groups: Vec<(&str, &str, usize)> = vec![];
            for listener in &children {
                let event_type = attr(listener, "eventType").unwrap_or("null");
                let listener_type = attr(listener, "type").unwrap_or("null");
                match groups
                    .iter_mut()
                    .find(|g| g.0 == event_type && g.1 == listener_type)
                {
                    Some(g) => g.2 += 1,
                    None => groups.push((event_type, listener_type, 1)),
                }
            }
            for (event_type, listener_type, count) in groups {
                if count > 1 {
                    ctx.report(
                        "duplicate-execution-listener",
                        id,
                        format!("Found '{count}' duplicates based on eventType[{event_type}] and type[{listener_type}], these combinations should be unique."),
                        "Remove the repeated execution listeners.",
                    );
                }
            }
        }
    }
}

/// Z183: a process id another resource of the deployment already defines.
fn duplicate_process_id(ctx: &mut ZeebeContext) {
    let Some(resolver) = ctx.resolver else {
        return;
    };
    for process in &ctx.defs.processes {
        if resolver.has_process(&process.id) == Some(true) {
            ctx.report(
                "duplicate-process-id",
                &process.id,
                format!("Duplicated process id in resources, '{}' is also defined in another resource of the deployment", process.id),
                "Give each process in the deployment its own id.",
            );
        }
    }
}

pub(super) fn check(ctx: &mut ZeebeContext) {
    duplicate_user_task_extension(ctx);
    form_definition(ctx);
    form_deployment(ctx);
    embedded_form(ctx);
    user_task_expressions(ctx);
    task_listeners(ctx);
    called_element(ctx);
    called_element_deployment(ctx);
    business_rule_task(ctx);
    called_decision_deployment(ctx);
    execution_listeners(ctx);
    duplicate_process_id(ctx);
}
