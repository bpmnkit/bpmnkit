//! The AI Agent rules: `agent-tool-output-key` and `agent-fromai-contract`.

use super::feel::{from_ai_calls, FromAiArgument};
use super::pattern::{is_context_put_onto_result, js_trim, word_matches};
use super::{
    attr, children, is_activity, is_event_sub_process, name_else_id, since, zeebe, Ctx, El,
};
use bpmnkit_bpmn::BpmnSequenceFlow;
use std::collections::{HashSet, VecDeque};

/// A `zeebe:property` the AI Agent templates set on an ad-hoc sub-process that holds tools.
const TOOL_CONTAINER_PROPERTY: &str = "io.camunda.agenticai.toolContainer";
/// The AI Agent job-worker template, whose older versions predate that property.
const AI_AGENT_TEMPLATE: &str = "io.camunda.connectors.agenticai.aiagent.jobworker.v1";
/// The job type of the AI Agent job worker, which forks of the template keep.
const AI_AGENT_JOB_TYPE_PREFIX: &str = "io.camunda.agenticai:aiagent-job-worker:";

fn is_data(el: &El) -> bool {
    matches!(
        el,
        El::DataObject(_) | El::DataObjectReference(_) | El::DataStoreReference(_)
    )
}

/// `isAgenticAdHocSubProcess`.
fn is_agentic(ctx: &Ctx, ad_hoc: &El) -> bool {
    let b = ad_hoc.base();
    let ext = &b.extension_elements;
    let marked = children(zeebe(ext, "properties").first().copied(), "property")
        .into_iter()
        .any(|p| {
            attr(Some(p), "name") == Some(TOOL_CONTAINER_PROPERTY)
                && attr(Some(p), "value") == Some("true")
        });
    marked
        || b.unknown_attributes
            .get("zeebe:modelerTemplate")
            .map(String::as_str)
            == Some(AI_AGENT_TEMPLATE)
        || attr(zeebe(ext, "taskDefinition").first().copied(), "type")
            .is_some_and(|t| t.starts_with(AI_AGENT_JOB_TYPE_PREFIX))
        || (ctx.at_least(since("agentDefinition")) && !zeebe(ext, "agentDefinition").is_empty())
}

/// The nearest ad-hoc sub-process around an element or flow.
fn enclosing_ad_hoc<'a>(ctx: &Ctx<'a>, parent: Option<&'a El>) -> Option<&'a El> {
    let mut p = parent;
    while let Some(el) = p {
        if matches!(el, El::AdHocSubProcess(_)) {
            return Some(el);
        }
        p = ctx.parent_of(&el.base().id);
    }
    None
}

/// A tool: an activity directly in an agentic ad-hoc sub-process that nothing flows into.
pub(super) fn is_tool_entry(ctx: &Ctx, el: &El) -> bool {
    let parent = ctx.parent_of(&el.base().id);
    is_activity(el.type_name())
        && !is_event_sub_process(Some(el))
        && el.base().incoming.is_empty()
        && parent.is_some_and(|p| matches!(p, El::AdHocSubProcess(_)) && is_agentic(ctx, p))
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Kind {
    Output,
    ResultVariable,
    ResultExpression,
}

struct Channel<'a> {
    kind: Kind,
    value: &'a str,
    source: Option<&'a str>,
    element: &'a El,
}

/// Every write of a tool's result along its flow, and whether that flow is one chain.
fn result_channels<'a>(ctx: &Ctx<'a>, entry: &'a El) -> (Vec<Channel<'a>>, bool) {
    let mut channels = vec![];
    let mut visited: HashSet<&str> = HashSet::new();
    let mut queue = VecDeque::from([entry]);
    let mut linear = true;
    while let Some(el) = queue.pop_front() {
        let b = el.base();
        if !visited.insert(b.id.as_str()) {
            continue;
        }
        for x in &b.extension_elements {
            if x.name == "zeebe:ioMapping" {
                for output in children(Some(x), "output") {
                    channels.push(Channel {
                        kind: Kind::Output,
                        value: attr(Some(output), "target").unwrap_or(""),
                        source: attr(Some(output), "source"),
                        element: el,
                    });
                }
            }
            if x.name == "zeebe:script" || x.name == "zeebe:calledDecision" {
                if let Some(value) = attr(Some(x), "resultVariable").filter(|v| !v.is_empty()) {
                    channels.push(Channel {
                        kind: Kind::ResultVariable,
                        value,
                        source: None,
                        element: el,
                    });
                }
            }
            if x.name == "zeebe:taskHeaders" {
                for header in children(Some(x), "header") {
                    let kind = match attr(Some(header), "key") {
                        Some("resultVariable") => Kind::ResultVariable,
                        Some("resultExpression") => Kind::ResultExpression,
                        _ => continue,
                    };
                    channels.push(Channel {
                        kind,
                        value: attr(Some(header), "value").unwrap_or(""),
                        source: None,
                        element: el,
                    });
                }
            }
        }
        if b.outgoing.len() > 1 || b.incoming.len() > 1 {
            linear = false;
        }
        for flow_id in &b.outgoing {
            let target = ctx
                .flows
                .get(flow_id.as_str())
                .map_or("", |f| f.el.target_ref.as_str());
            if let Some(t) = ctx.elements.get(target) {
                queue.push_back(t.el);
            }
        }
        let siblings = match ctx.parent_of(&b.id) {
            Some(p) => super::flow_elements(p),
            None => &ctx.process.contents.flow_elements,
        };
        for sibling in siblings {
            if matches!(sibling, El::BoundaryEvent(e) if e.attached_to_ref == b.id) {
                linear = false;
                queue.push_back(sibling);
            }
        }
        if let Some(c) = el.contents() {
            queue.extend(c.flow_elements.iter().filter(|c| !is_data(c)));
        }
    }
    (channels, linear)
}

fn writes_tool_call_result(c: &Channel) -> bool {
    if c.kind == Kind::ResultExpression {
        return !word_matches(c.value, "toolCallResult", false).is_empty();
    }
    c.value == "toolCallResult" || c.value.starts_with("toolCallResult.")
}

/// The first `toolCallResult` written in the wrong case, if any.
fn miscased<'a>(c: &Channel<'a>) -> Option<&'a str> {
    if c.kind == Kind::ResultExpression {
        return word_matches(c.value, "toolcallresult", true)
            .into_iter()
            .find(|t| *t != "toolCallResult");
    }
    let lower = c.value.to_lowercase();
    let variant = lower == "toolcallresult" || lower.starts_with("toolcallresult.");
    (variant && !writes_tool_call_result(c)).then_some(c.value)
}

/// A write that replaces `toolCallResult` whole.
fn overwrites(c: &Channel) -> bool {
    if c.kind != Kind::Output {
        return true;
    }
    c.value == "toolCallResult" && !is_context_put_onto_result(c.source.unwrap_or(""))
}

/// `agent-tool-output-key`: a tool must hand its result back as `toolCallResult`.
pub(super) fn check_tool_output(ctx: &mut Ctx, entry: &El) {
    let (channels, linear) = result_channels(ctx, entry);
    const RULE: &str = "agent-tool-output-key";
    let casing = |ctx: &mut Ctx, c: &Channel, text: &str| {
        ctx.report(
            RULE,
            &c.element.base().id,
            format!("Wrong casing \"{text}\": use toolCallResult (case-sensitive)."),
            "Write toolCallResult exactly; Camunda reads variable names case-sensitively.",
        )
    };
    if channels.is_empty() {
        ctx.report(
            RULE,
            &entry.base().id,
            "Tool returns nothing to the agent. Set a \"toolCallResult\" (at minimum, note the task completed).".into(),
            "Add an output mapping with target toolCallResult.",
        );
        return;
    }
    if !channels.iter().any(writes_tool_call_result) {
        for c in &channels {
            if let Some(wrong) = miscased(c) {
                casing(ctx, c, wrong);
                continue;
            }
            ctx.report(
                RULE,
                &c.element.base().id,
                "\"toolCallResult\" output is not mapped.".into(),
                "Map the tool's result to toolCallResult — the agent reads nothing else.",
            );
        }
        return;
    }
    for c in &channels {
        if let Some(wrong) = miscased(c) {
            casing(ctx, c, wrong);
        }
    }
    if !linear {
        return;
    }
    let writes: Vec<&Channel> = channels
        .iter()
        .filter(|c| writes_tool_call_result(c) && overwrites(c))
        .collect();
    for pair in writes.windows(2) {
        let earlier = pair[0].element.base();
        ctx.report(
            RULE,
            &pair[1].element.base().id,
            format!(
                "This overwrites the \"toolCallResult\" value set on \"{}\".",
                name_else_id(&earlier.name, &earlier.id)
            ),
            "Write parts of the result (toolCallResult.part), or combine them with context put(toolCallResult, ...).",
        );
    }
}

/// `agent-fromai-contract` on a sequence flow's condition.
pub(super) fn check_from_ai_condition(ctx: &mut Ctx, flow: &BpmnSequenceFlow) {
    let Some(body) = flow
        .condition_expression
        .as_ref()
        .and_then(|c| c.text.strip_prefix('='))
    else {
        return;
    };
    let calls = from_ai_calls(js_trim(body));
    let parent = ctx.flows.get(flow.id.as_str()).and_then(|l| l.parent);
    let ad_hoc = enclosing_ad_hoc(ctx, parent);
    if calls.is_empty() || !ad_hoc.is_some_and(|a| is_agentic(ctx, a)) {
        return;
    }
    for _ in &calls {
        ctx.report(
            "agent-fromai-contract",
            &flow.id,
            "fromAi() defines a tool input and cannot be used in a sequence flow condition. Define it in an input mapping on the tool's entry element.".into(),
            "Read the value from the toolCall variable instead.",
        );
    }
}

/// Why a `fromAi()` key argument cannot name a tool parameter, if it cannot.
fn from_ai_key_problem(arg: &FromAiArgument) -> Option<String> {
    let text = &arg.text;
    Some(match arg.kind.as_str() {
        "StringLiteral" => format!(
            "fromAi() key must be a FEEL path, not a string literal. Remove the quotes around {text}."
        ),
        "null" => "fromAi() key must be a FEEL path starting with \"toolCall.\", not null.".into(),
        "NumericLiteral" => {
            "fromAi() key must be a FEEL path starting with \"toolCall.\", not a number.".into()
        }
        "ArithmeticExpression" => "fromAi() key must be a FEEL path starting with \"toolCall.\", not an arithmetic expression.".into(),
        "FilterExpression" => "fromAi() key must use dot notation, not bracket notation. Use toolCall.name instead of toolCall[\"name\"].".into(),
        "VariableName" => format!(
            "fromAi() key must start with \"toolCall.\". Use toolCall.{text} instead of a bare name."
        ),
        "PathExpression" => {
            if !text.starts_with("toolCall.") {
                return Some(format!(
                    "fromAi() key must start with \"toolCall.\". Got {text}."
                ));
            }
            let segments: Vec<&str> = text.split('.').collect();
            if segments.len() <= 2 {
                return None;
            }
            format!(
                "fromAi() key must be a single name under toolCall. Use toolCall.{} instead of {text}.",
                segments[segments.len() - 1]
            )
        }
        "IfExpression" => "fromAi() key must be a FEEL path starting with \"toolCall.\", not a conditional expression. The connector requires a plain reference regardless of which branch would apply at runtime.".into(),
        other => format!(
            "fromAi() key must be a FEEL path starting with \"toolCall.\", not a {other}."
        ),
    })
}

/// `agent-fromai-contract`: `fromAi()` only defines a tool input in an input mapping
/// of a tool's entry element, with a `toolCall.<name>` key and a literal description.
pub(super) fn check_from_ai(ctx: &mut Ctx, el: &El) {
    const RULE: &str = "agent-fromai-contract";
    let b = el.base();
    let id = b.id.as_str();
    let parent = ctx.parent_of(id);
    let ad_hoc = enclosing_ad_hoc(ctx, parent);
    let agentic = ad_hoc.is_some_and(|a| is_agentic(ctx, a));
    let mappings = zeebe(&b.extension_elements, "ioMapping");
    let same = |a: Option<&El>, b: Option<&El>| match (a, b) {
        (Some(a), Some(b)) => std::ptr::eq(a, b),
        (None, None) => true,
        _ => false,
    };
    let source_expr = |x: &bpmnkit_bpmn::XmlElement| -> Option<String> {
        attr(Some(x), "source")
            .and_then(|s| s.strip_prefix('='))
            .map(|s| js_trim(s).to_string())
    };

    if is_activity(el.type_name()) && b.incoming.is_empty() && agentic && same(parent, ad_hoc) {
        let mut keys: indexmap::IndexMap<String, usize> = indexmap::IndexMap::new();
        for input in children(mappings.first().copied(), "input") {
            let Some(expr) = source_expr(input) else {
                continue;
            };
            for call in from_ai_calls(&expr) {
                if let Some(Some(key)) = call.args.first() {
                    if key.kind == "PathExpression" && key.text.starts_with("toolCall.") {
                        *keys.entry(key.text.clone()).or_default() += 1;
                    }
                }
            }
        }
        for (key, count) in keys {
            if count < 2 {
                continue;
            }
            ctx.report(
                RULE,
                id,
                format!("fromAi() key {key} is declared more than once in this tool. Declare it once and reference it directly elsewhere."),
                "Declare each tool parameter once.",
            );
        }
    }

    if is_data(el) {
        return;
    }
    for mapping in &mappings {
        for output in children(Some(mapping), "output") {
            let Some(expr) = source_expr(output) else {
                continue;
            };
            if !agentic {
                continue;
            }
            for _ in from_ai_calls(&expr) {
                ctx.report(
                    RULE,
                    id,
                    "fromAi() defines a tool input and has no effect in an output mapping. Define it in an input mapping on the tool's entry element.".into(),
                    "Move the fromAi() call to an input mapping.",
                );
            }
        }
        for input in children(Some(mapping), "input") {
            let Some(expr) = source_expr(input) else {
                continue;
            };
            let calls = from_ai_calls(&expr);
            if calls.is_empty() {
                continue;
            }
            if ad_hoc.is_none() || !agentic || !b.incoming.is_empty() || !same(parent, ad_hoc) {
                let (message, suggestion) = match ad_hoc {
                    None => (
                        "fromAi() should only be used inside an agentic sub-process.".to_string(),
                        "Use fromAi() only in a tool of an AI Agent ad-hoc sub-process.".to_string(),
                    ),
                    Some(a) if !agentic => (
                        format!(
                            "The \"{}\" sub-process is not marked as agentic, so fromAi() has no effect.",
                            name_else_id(&a.base().name, &a.base().id)
                        ),
                        format!("Set the zeebe:property {TOOL_CONTAINER_PROPERTY}=\"true\" on the ad-hoc sub-process, or apply the AI Agent template."),
                    ),
                    Some(_) => (
                        "fromAi() is ignored here: only the tool's entry element defines AI inputs. Define it there and read the toolCall variable directly.".to_string(),
                        "Move the fromAi() call to the tool's first element.".to_string(),
                    ),
                };
                for _ in &calls {
                    ctx.report(RULE, id, message.clone(), &suggestion);
                }
                continue;
            }
            for call in calls {
                if call.name != "fromAi" {
                    ctx.report(
                        RULE,
                        id,
                        format!(
                            "Wrong function name \"{}\". Use fromAi (case-sensitive).",
                            call.name
                        ),
                        "Write fromAi exactly.",
                    );
                    continue;
                }
                let key = call.args.first().cloned().flatten();
                let description = call.args.get(1).cloned().flatten();
                let Some(key) = key else {
                    ctx.report(
                        RULE,
                        id,
                        "fromAi() requires a key argument: a FEEL path like toolCall.url.".into(),
                        "Pass the parameter as fromAi(toolCall.name, ...).",
                    );
                    continue;
                };
                if let Some(problem) = from_ai_key_problem(&key) {
                    ctx.report(
                        RULE,
                        id,
                        problem,
                        "Pass the parameter as fromAi(toolCall.name, ...).",
                    );
                }
                if description.is_some_and(|d| d.kind != "StringLiteral") {
                    ctx.report(
                        RULE,
                        id,
                        "fromAi() description must be a string literal: a quoted string describing what the agent should provide.".into(),
                        "Describe the parameter in a quoted string: fromAi(toolCall.name, \"…\").",
                    );
                }
            }
        }
    }
}
