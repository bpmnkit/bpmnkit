//! The rules that read an element's expressions and properties: FEEL built-ins,
//! variable names, secrets, connector properties, listener headers and link events.

use super::feel::{feel_builtin_calls, secret_reference_violations};
use super::pattern::{
    has_camunda_secret, has_legacy_secret, has_secret_reference, is_variable_name,
};
use super::{
    agent, attr, children, event_definition, event_definitions, loop_of, message_ref, no_loop,
    since, zeebe, Ctx, El,
};
use bpmnkit_bpmn::{BpmnEventDefinition, BpmnProcess, BpmnSequenceFlow, XmlElement};
use bpmnkit_spec::compat::{FEEL_BUILTIN_SINCE, INBOUND_CONNECTOR_PROPERTY_SINCE};

/// Anything the plugin reports on: the process, a flow element or a sequence flow.
#[derive(Clone, Copy)]
pub(super) enum Owner<'a> {
    Process(&'a BpmnProcess),
    Element(&'a El),
    Flow(&'a BpmnSequenceFlow),
}

impl<'a> Owner<'a> {
    fn id(self) -> &'a str {
        match self {
            Owner::Process(p) => &p.id,
            Owner::Element(e) => &e.base().id,
            Owner::Flow(f) => &f.id,
        }
    }

    fn extension_elements(self) -> &'a [XmlElement] {
        match self {
            Owner::Process(p) => &p.extension_elements,
            Owner::Element(e) => &e.base().extension_elements,
            Owner::Flow(f) => &f.extension_elements,
        }
    }

    fn documentation(self) -> Option<&'a str> {
        match self {
            Owner::Process(p) => p.documentation.as_deref(),
            Owner::Element(e) => e.base().documentation.as_deref(),
            Owner::Flow(f) => f.documentation.as_deref(),
        }
    }
}

pub(super) fn check_contents(ctx: &mut Ctx) {
    let mut owners = vec![Owner::Process(ctx.process)];
    owners.extend(ctx.elements.values().map(|l| Owner::Element(l.el)));
    owners.extend(ctx.flows.values().map(|l| Owner::Flow(l.el)));
    let unavailable: Vec<&str> = FEEL_BUILTIN_SINCE
        .iter()
        .filter(|(_, s)| !ctx.at_least(*s))
        .map(|(n, _)| *n)
        .collect();
    for owner in owners {
        if !unavailable.is_empty() {
            check_feel_compatibility(ctx, owner, &unavailable);
        }
        check_connector_properties(ctx, owner);
        match owner {
            Owner::Flow(flow) => agent::check_from_ai_condition(ctx, flow),
            Owner::Process(_) | Owner::Element(_) => {
                check_variable_names(ctx, owner);
                check_secrets(ctx, owner);
                check_secret_references(ctx, owner);
                check_listener_headers(ctx, owner);
                if let Owner::Element(el) = owner {
                    agent::check_from_ai(ctx, el);
                    if agent::is_tool_entry(ctx, el) {
                        agent::check_tool_output(ctx, el);
                    }
                }
            }
        }
    }
    check_link_events(ctx);
    no_loop::check_no_loop(ctx);
}

/// `value.length > 10 ? value.slice(0, 10) + "..." : value`, in UTF-16 units.
fn truncate(value: &str) -> String {
    let units: Vec<u16> = value.encode_utf16().collect();
    if units.len() > 10 {
        format!("{}...", String::from_utf16_lossy(&units[..10]))
    } else {
        value.to_string()
    }
}

/// Attributes `feel-compatibility` does not read, per Zeebe element (`utils/feel.js`).
fn not_feel(name: &str) -> &'static [&'static str] {
    match name {
        "zeebe:input" | "zeebe:output" => &["target"],
        "zeebe:header" => &["key", "value"],
        "zeebe:property" => &["name", "value"],
        "zeebe:calledDecision" | "zeebe:script" => &["resultVariable"],
        _ => &[],
    }
}

/// The FEEL expressions (values starting with `=`) on an owner and its extensions.
fn feel_expressions(owner: Owner<'_>) -> Vec<&str> {
    fn extension<'x>(x: &'x XmlElement, values: &mut Vec<Option<&'x str>>) {
        if !x.name.starts_with("zeebe:") {
            return;
        }
        let skipped = not_feel(&x.name);
        for (key, value) in &x.attributes {
            if key != "name" && !key.contains(':') && !skipped.contains(&key.as_str()) {
                values.push(Some(value));
            }
        }
        for child in &x.children {
            extension(child, values);
        }
    }
    let mut values: Vec<Option<&str>> = vec![owner.documentation()];
    for x in owner.extension_elements() {
        extension(x, &mut values);
    }
    match owner {
        Owner::Flow(f) => values.push(f.condition_expression.as_ref().map(|c| c.text.as_str())),
        Owner::Element(el) => {
            for def in event_definitions(el) {
                match def {
                    BpmnEventDefinition::Timer(t) => values.extend([
                        t.time_cycle.as_deref(),
                        t.time_date.as_deref(),
                        t.time_duration.as_deref(),
                    ]),
                    BpmnEventDefinition::Conditional(c) => values.push(c.condition.as_deref()),
                    _ => {}
                }
            }
            if let Some(lp) = loop_of(el) {
                values.push(lp.loop_cardinality.as_ref().map(|c| c.text.as_str()));
                values.push(lp.completion_condition.as_ref().map(|c| c.text.as_str()));
                for x in &lp.extension_elements {
                    extension(x, &mut values);
                }
            }
            if let El::AdHocSubProcess(a) = el {
                values.push(a.completion_condition.as_ref().map(|c| c.text.as_str()));
            }
        }
        Owner::Process(_) => {}
    }
    values
        .into_iter()
        .flatten()
        .filter(|v| v.starts_with('='))
        .collect()
}

fn is_gated_builtin(name: &str) -> bool {
    FEEL_BUILTIN_SINCE.iter().any(|(n, _)| *n == name)
}

/// `feel-compatibility`: a FEEL built-in newer than the target.
fn check_feel_compatibility(ctx: &mut Ctx, owner: Owner, unavailable: &[&str]) {
    for expression in feel_expressions(owner) {
        let calls = feel_builtin_calls(&expression[1..], &is_gated_builtin);
        let Some(name) = calls
            .unwrap_or_default()
            .into_iter()
            .find(|c| unavailable.contains(&c.as_str()))
        else {
            continue;
        };
        let Some((_, s)) = FEEL_BUILTIN_SINCE.iter().find(|(n, _)| *n == name) else {
            continue;
        };
        let s = s.as_str();
        ctx.report(
            "feel-compatibility",
            owner.id(),
            format!("FEEL function <{name}> requires Camunda >={s}"),
            &format!("Target Camunda {s} or newer (modeler:executionPlatformVersion), or do without {name}()."),
        );
    }
}

/// `variable-name`: the variables an element writes must be plain FEEL names.
fn check_variable_names(ctx: &mut Ctx, owner: Owner) {
    let ext = owner.extension_elements();
    let io = zeebe(ext, "ioMapping").first().copied();
    let mut written: Vec<(&str, Option<&str>)> = vec![];
    written.extend(
        children(io, "input")
            .into_iter()
            .map(|i| ("input target", attr(Some(i), "target"))),
    );
    written.extend(
        children(io, "output")
            .into_iter()
            .map(|o| ("output target", attr(Some(o), "target"))),
    );
    let el = match owner {
        Owner::Element(el) => Some(el),
        _ => None,
    };
    let zeebe_loop = el.and_then(loop_of).and_then(|lp| {
        zeebe(&lp.extension_elements, "loopCharacteristics")
            .first()
            .copied()
    });
    written.push(("input element", attr(zeebe_loop, "inputElement")));
    written.push(("output collection", attr(zeebe_loop, "outputCollection")));
    let first = |name: &str, a: &str| attr(zeebe(ext, name).first().copied(), a);
    match el {
        Some(El::ScriptTask(_)) => {
            written.push(("result variable", first("script", "resultVariable")))
        }
        Some(El::BusinessRuleTask(_)) => {
            written.push(("result variable", first("calledDecision", "resultVariable")))
        }
        Some(El::AdHocSubProcess(_)) => {
            written.push(("output collection", first("adHoc", "outputCollection")))
        }
        _ => {}
    }
    for (what, value) in written {
        let Some(value) = value else { continue };
        if is_variable_name(value) {
            continue;
        }
        ctx.report(
            "variable-name",
            owner.id(),
            format!("Property value of <{}> not allowed", truncate(value)),
            &format!("The {what} \"{value}\" is not a variable name: use letters, digits and underscores, not starting with a digit, with dots between nested names."),
        );
    }
}

/// `secrets`: `deprecated` for a bare `secrets.X`, `legacy` for `{{secrets.X}}`
/// once `camunda.secrets.X` exists.
fn secret_format(ctx: &Ctx, value: Option<&str>) -> Option<&'static str> {
    let value = value.filter(|v| v.contains("secrets."))?;
    if has_camunda_secret(value) {
        return None;
    }
    let legacy = has_legacy_secret(value);
    if ctx.at_least(since("camundaSecrets")) {
        Some(if legacy { "legacy" } else { "deprecated" })
    } else if legacy {
        None
    } else {
        Some("deprecated")
    }
}

fn inputs<'a>(owner: Owner<'a>) -> Vec<&'a XmlElement> {
    children(
        zeebe(owner.extension_elements(), "ioMapping")
            .first()
            .copied(),
        "input",
    )
}

fn properties<'a>(owner: Owner<'a>) -> Vec<&'a XmlElement> {
    children(
        zeebe(owner.extension_elements(), "properties")
            .first()
            .copied(),
        "property",
    )
}

/// `secrets`: input sources, property values and correlation keys.
fn check_secrets(ctx: &mut Ctx, owner: Owner) {
    let mut values: Vec<(&str, Option<&str>)> = vec![];
    values.extend(
        inputs(owner)
            .into_iter()
            .map(|i| ("source", attr(Some(i), "source"))),
    );
    values.extend(
        properties(owner)
            .into_iter()
            .map(|p| ("value", attr(Some(p), "value"))),
    );
    if let Owner::Element(el) = owner {
        let reference = message_ref(el);
        let message = ctx
            .definitions
            .messages
            .iter()
            .find(|m| Some(m.id.as_str()) == reference);
        let subscription = message
            .and_then(|m| m.extension_elements.as_deref())
            .and_then(|ext| zeebe(ext, "subscription").first().copied());
        if subscription.is_some() {
            values.push(("correlationKey", attr(subscription, "correlationKey")));
        }
    }
    let modern = ctx.at_least(since("camundaSecrets"));
    for (property, value) in values {
        let Some(format) = secret_format(ctx, value) else {
            continue;
        };
        ctx.report(
            "secrets",
            owner.id(),
            format!("Property <{property}> uses {format} secret expression format"),
            if modern {
                "Reference the secret as =camunda.secrets.NAME."
            } else {
                "Write the secret as {{secrets.NAME}}."
            },
        );
    }
}

/// `unresolvable-secret-reference`: `camunda.secrets.X` where the engine cannot resolve it.
fn check_secret_references(ctx: &mut Ctx, owner: Owner) {
    let literal = |ctx: &mut Ctx, property: &str, value: Option<&str>| {
        let Some(value) = value.filter(|v| v.contains("secrets.")) else {
            return;
        };
        let inert = match value.strip_prefix('=') {
            Some(expr) => secret_reference_violations(expr).string_literal,
            None => has_secret_reference(value),
        };
        if inert {
            ctx.report(
                "unresolvable-secret-reference",
                owner.id(),
                format!("Property <{property}> must use a secret reference as an expression (e.g. =camunda.secrets.NAME), not as a string literal"),
                "Write the reference as a FEEL expression, outside quotes.",
            );
        }
    };
    for input in inputs(owner) {
        let source = attr(Some(input), "source");
        literal(ctx, "source", source);
        let Some(expr) = source
            .filter(|s| s.contains("secrets."))
            .and_then(|s| s.strip_prefix('='))
        else {
            continue;
        };
        let violations = secret_reference_violations(expr);
        if violations.inside_list {
            ctx.report(
                "unresolvable-secret-reference",
                owner.id(),
                "Property <source> must not assign a secret reference inside a list".into(),
                "Map the secret to a variable of its own, and build the list from that variable.",
            );
        }
        if violations.inside_if_branch_context {
            ctx.report(
                "unresolvable-secret-reference",
                owner.id(),
                "Property <source> must not assign a secret reference inside a context returned by an if expression branch".into(),
                "Map the secret to a variable of its own, and build the context from that variable.",
            );
        }
    }
    for property in properties(owner) {
        literal(ctx, "value", attr(Some(property), "value"));
    }
}

/// `connector-properties`: inbound connector properties newer than the target.
fn check_connector_properties(ctx: &mut Ctx, owner: Owner) {
    let props = properties(owner);
    let named = |name: &str| {
        props
            .iter()
            .copied()
            .find(|p| attr(Some(p), "name") == Some(name))
    };
    let Some(connector) = attr(named("inbound.type"), "value") else {
        return;
    };
    for p in INBOUND_CONNECTOR_PROPERTY_SINCE {
        if ctx.at_least(p.since) || !p.connectors.contains(&connector) || named(p.name).is_none() {
            continue;
        }
        let (name, s) = (p.name, p.since.as_str());
        ctx.report(
            "connector-properties",
            owner.id(),
            format!("Connector property <name> with value <{name}> only allowed by Camunda {s} or newer."),
            &format!("Remove the {name} property, or target Camunda {s} or newer."),
        );
    }
}

/// `duplicate-execution-listener-headers`: one header key twice on one listener.
fn check_listener_headers(ctx: &mut Ctx, owner: Owner) {
    let container = zeebe(owner.extension_elements(), "executionListeners")
        .first()
        .copied();
    for listener in children(container, "executionListener") {
        let Some(headers) = children(Some(listener), "taskHeaders").first().copied() else {
            continue;
        };
        let keys: Vec<Option<&str>> = children(Some(headers), "header")
            .into_iter()
            .map(|h| attr(Some(h), "key"))
            .collect();
        for key in super::duplicates(&keys) {
            ctx.report(
                "duplicate-execution-listener-headers",
                owner.id(),
                format!(
                    "Properties of type <zeebe:Header> have property <key> with duplicate value of <{}>",
                    key.unwrap_or("undefined")
                ),
                "Remove the duplicate header from the execution listener.",
            );
        }
    }
}

fn link_name(el: &El) -> Option<Option<&str>> {
    match event_definition(el) {
        Some(BpmnEventDefinition::Link(l)) => Some(l.name.as_deref()),
        _ => None,
    }
}

/// `link-event`: link events need a name, and a link catch name must be unique.
fn check_link_events(ctx: &mut Ctx) {
    let elements: Vec<&El> = ctx.elements.values().map(|l| l.el).collect();
    for el in elements {
        if !matches!(
            el,
            El::IntermediateCatchEvent(_) | El::IntermediateThrowEvent(_)
        ) {
            continue;
        }
        let Some(name) = link_name(el) else { continue };
        if !super::pattern::js_trim(name.unwrap_or("")).is_empty() {
            continue;
        }
        ctx.report(
            "link-event",
            &el.base().id,
            "Element of type <bpmn:LinkEventDefinition> must have property <name>".into(),
            "Name the link — a throw and its catch are paired by name.",
        );
    }

    fn collect<'a>(elements: &'a [El], out: &mut Vec<&'a El>) {
        for el in elements {
            if matches!(el, El::IntermediateCatchEvent(_)) && link_name(el).is_some() {
                out.push(el);
            } else if let Some(c) = el.contents() {
                collect(&c.flow_elements, out);
            }
        }
    }
    let mut catches = vec![];
    collect(&ctx.process.contents.flow_elements, &mut catches);
    let names: Vec<Option<&str>> = catches.iter().map(|el| link_name(el).flatten()).collect();
    let mut dupes: Vec<&str> = vec![];
    for (i, name) in names.iter().enumerate() {
        if let Some(n) = name.filter(|n| !n.is_empty()) {
            if names.iter().position(|x| x == name) != Some(i) && !dupes.contains(&n) {
                dupes.push(n);
            }
        }
    }
    for name in dupes {
        for el in catches
            .iter()
            .filter(|c| link_name(c).flatten() == Some(name))
        {
            ctx.report(
                "link-event",
                &el.base().id,
                format!("Property of type <bpmn:LinkEventDefinition> has property <name> with duplicate value of <{name}>"),
                "Give each link catch event in the process its own name.",
            );
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn truncates_by_utf16_units() {
        assert_eq!(super::truncate("abcdefghij"), "abcdefghij");
        assert_eq!(super::truncate("abcdefghijk"), "abcdefghij...");
    }
}
