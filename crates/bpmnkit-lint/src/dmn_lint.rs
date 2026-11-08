//! `lintDmn` from `@bpmnkit/core`'s `dmn/lint.ts`: the mistakes Zeebe rejects at deploy
//! time, read from the raw XML so a document the model cannot represent is still reported on.

use crate::check_finding::{with_card_hint, CheckFinding, CheckSeverity};
use crate::js;
use bpmnkit_feel::ParseOptions;
use bpmnkit_spec::elements::dmn_attribute_values;
use bpmnkit_xml::{parse_xml, XmlElement};
use indexmap::IndexMap;

/// The type names Camunda's DMN engine resolves; anything else is silently treated as `Any`.
const TYPE_REFS: &[&str] = &[
    "string",
    "number",
    "boolean",
    "date",
    "time",
    "dateTime",
    "date and time",
    "dayTimeDuration",
    "days and time duration",
    "yearMonthDuration",
    "years and months duration",
    "duration",
    "context",
    "list",
    "Any",
];

/// Which DRG element each requirement reference must point at.
fn requirement_target(kind: &str) -> Option<&'static str> {
    match kind {
        "requiredDecision" => Some("decision"),
        "requiredInput" => Some("inputData"),
        "requiredKnowledge" => Some("businessKnowledgeModel"),
        "requiredAuthority" => Some("knowledgeSource"),
        _ => None,
    }
}

const DRG_ELEMENTS: &[&str] = &[
    "decision",
    "inputData",
    "businessKnowledgeModel",
    "knowledgeSource",
];

fn child<'a>(el: &'a XmlElement, name: &str) -> Option<&'a XmlElement> {
    el.children.iter().find(|c| c.local_name() == name)
}

fn children_named<'a>(el: &'a XmlElement, name: &'a str) -> impl Iterator<Item = &'a XmlElement> {
    el.children.iter().filter(move |c| c.local_name() == name)
}

fn text_of(el: Option<&XmlElement>) -> String {
    let text = el
        .and_then(|el| child(el, "text"))
        .and_then(|t| t.text.as_deref())
        .unwrap_or("");
    js::trim(text).to_owned()
}

fn walk<'a>(el: &'a XmlElement, out: &mut Vec<&'a XmlElement>) {
    out.push(el);
    for c in &el.children {
        walk(c, out);
    }
}

fn finding(
    rule: &str,
    severity: CheckSeverity,
    element_id: Option<&str>,
    message: String,
    fix: String,
) -> CheckFinding {
    CheckFinding {
        rule: rule.into(),
        severity,
        element_id: element_id.map(str::to_owned),
        message,
        fix,
    }
}

fn error(
    rule: &str,
    element_id: Option<&str>,
    message: String,
    fix: impl Into<String>,
) -> CheckFinding {
    finding(rule, CheckSeverity::Error, element_id, message, fix.into())
}

/// Checks a DMN document for malformed XML, duplicate ids, requirement references that
/// resolve to nothing, FEEL that does not parse, invalid hit policies and unknown types.
pub fn lint_dmn(xml: &str) -> Vec<CheckFinding> {
    with_card_hint(lint_dmn_findings(xml), "dmn")
}

fn lint_dmn_findings(xml: &str) -> Vec<CheckFinding> {
    let root = match parse_xml(xml) {
        Ok(root) => root,
        Err(e) => {
            return vec![error(
                "dmn/malformed-xml",
                None,
                format!("The document is not well-formed XML: {}", ts_xml_error(&e.0)),
                "Fix the XML syntax (unclosed or mismatched tags, unquoted attributes, a stray `&` written instead of `&amp;`).",
            )]
        }
    };
    if root.local_name() != "definitions" {
        return vec![error(
            "dmn/not-dmn",
            None,
            format!("The root element is <{}>, not <definitions>.", root.name),
            "Wrap the decisions in <definitions xmlns=\"https://www.omg.org/spec/DMN/20191111/MODEL/\">.",
        )];
    }

    let mut findings = vec![];
    let mut all = vec![];
    walk(&root, &mut all);
    let mut by_id: IndexMap<&str, &XmlElement> = IndexMap::new();
    for el in all {
        let Some(id) = el.attr("id") else { continue };
        if let Some(first) = by_id.get(id) {
            findings.push(error(
                "dmn/duplicate-id",
                Some(id),
                format!(
                    "The id \"{id}\" is used by more than one element (<{}> and <{}>).",
                    first.name, el.name
                ),
                "Give one of them a different id; ids must be unique across the whole document.",
            ));
        } else {
            by_id.insert(id, el);
        }
    }

    let drg: Vec<&XmlElement> = root
        .children
        .iter()
        .filter(|c| DRG_ELEMENTS.contains(&c.local_name()))
        .collect();
    for el in &drg {
        if el.attr("id").is_none_or(str::is_empty) {
            let named = match el.attr("name") {
                Some(n) if !n.is_empty() => format!(" named \"{n}\""),
                _ => String::new(),
            };
            findings.push(error(
                "dmn/missing-id",
                None,
                format!("A <{}>{named} has no id.", el.name),
                "Add an id attribute — requirements and zeebe:calledDecision reference elements by id.",
            ));
        }
    }

    let decisions: Vec<&XmlElement> = drg
        .iter()
        .copied()
        .filter(|el| el.local_name() == "decision")
        .collect();
    if decisions.is_empty() {
        findings.push(error(
            "dmn/no-decision",
            None,
            "The document contains no <decision>.".into(),
            "Add at least one <decision> with a <decisionTable> or <literalExpression>; Zeebe rejects a DRG without decisions.",
        ));
    }

    for el in &drg {
        check_requirements(el, &by_id, &mut findings);
    }
    check_cycles(&decisions, &mut findings);
    for decision in &decisions {
        check_decision(decision, &mut findings);
    }
    findings
}

/// TS's wording for the XML errors its scanner and quick-xml both detect; others keep
/// quick-xml's.
fn ts_xml_error(message: &str) -> String {
    let mismatch = message
        .strip_prefix("ill-formed document: expected `</")
        .and_then(|rest| rest.split_once(">`, but `</"))
        .and_then(|(open, rest)| Some((open, rest.strip_suffix(">` was found")?)));
    match mismatch {
        Some((open, close)) => {
            format!("Mismatched closing tag: expected </{open}>, got </{close}>")
        }
        None => message.to_owned(),
    }
}

fn href_target(href: Option<&str>) -> Option<&str> {
    href?.strip_prefix('#')
}

fn check_requirements(
    owner: &XmlElement,
    by_id: &IndexMap<&str, &XmlElement>,
    findings: &mut Vec<CheckFinding>,
) {
    let owner_id = owner.attr("id");
    let owner_shown = owner_id.unwrap_or("?");
    for req in &owner.children {
        let kind = req.local_name();
        if !kind.ends_with("Requirement") {
            continue;
        }
        for r in &req.children {
            let ref_kind = r.local_name();
            let Some(expected) = requirement_target(ref_kind) else {
                continue;
            };
            let href = r.attr("href");
            // A reference into another file (`other.dmn#id`) is resolved at deploy time, not here.
            if let Some(h) = href {
                if !h.is_empty() && !h.starts_with('#') {
                    continue;
                }
            }
            let id = href_target(href);
            let target = id.and_then(|id| by_id.get(id));
            let rule = "dmn/unresolved-requirement";
            match (id, target) {
                (None, _) | (Some(""), _) => findings.push(error(
                    rule,
                    owner_id,
                    format!("<{kind}> on \"{owner_shown}\" has a <{ref_kind}> with no href."),
                    format!("Set href=\"#<id of the {expected}>\"."),
                )),
                (Some(id), None) => findings.push(error(
                    rule,
                    owner_id,
                    format!(
                        "<{ref_kind} href=\"{}\"> on \"{owner_shown}\" points at \"{id}\", which does not exist.",
                        href.unwrap_or_default()
                    ),
                    format!(
                        "Point it at the id of an existing <{expected}>, or add a <{expected} id=\"{id}\">."
                    ),
                )),
                (Some(_), Some(t)) if t.local_name() != expected => findings.push(error(
                    rule,
                    owner_id,
                    format!(
                        "<{ref_kind} href=\"{}\"> on \"{owner_shown}\" points at a <{}>, not a <{expected}>.",
                        href.unwrap_or_default(),
                        t.name
                    ),
                    match t.local_name() {
                        "inputData" => "Use <requiredInput> for input data.".into(),
                        "decision" => "Use <requiredDecision> for a decision.".into(),
                        _ => format!("Point it at a <{expected}>."),
                    },
                )),
                _ => {}
            }
        }
    }
}

#[derive(Clone, Copy, PartialEq)]
enum Visit {
    Visiting,
    Done,
}

fn check_cycles(decisions: &[&XmlElement], findings: &mut Vec<CheckFinding>) {
    let mut requires: IndexMap<&str, Vec<&str>> = IndexMap::new();
    for d in decisions {
        let Some(id) = d.attr("id") else { continue };
        let deps = children_named(d, "informationRequirement")
            .filter_map(|req| {
                href_target(child(req, "requiredDecision").and_then(|r| r.attr("href")))
            })
            .collect();
        requires.insert(id, deps);
    }
    struct Walk<'a, 'b> {
        requires: &'b IndexMap<&'a str, Vec<&'a str>>,
        state: IndexMap<&'a str, Visit>,
        reported: Vec<&'a str>,
        findings: &'b mut Vec<CheckFinding>,
    }
    fn visit<'a>(w: &mut Walk<'a, '_>, id: &'a str, path: Vec<&'a str>) {
        match w.state.get(id) {
            Some(Visit::Done) => return,
            Some(Visit::Visiting) => {
                // `path.slice(path.indexOf(id))`: a missing id slices from the last element.
                let from = path
                    .iter()
                    .position(|p| *p == id)
                    .unwrap_or(path.len().saturating_sub(1));
                let mut cycle: Vec<&str> = path[from..].to_vec();
                cycle.push(id);
                if !w.reported.contains(&id) {
                    w.reported.push(id);
                    w.findings.push(error(
                        "dmn/requirement-cycle",
                        Some(id),
                        format!("Decisions require each other in a cycle: {}.", cycle.join(" → ")),
                        "Remove one of the <requiredDecision> references so the requirement graph is acyclic.",
                    ));
                }
                return;
            }
            None => {}
        }
        w.state.insert(id, Visit::Visiting);
        let deps = w.requires.get(id).cloned().unwrap_or_default();
        for dep in deps {
            if w.requires.contains_key(dep) {
                let mut next = path.clone();
                next.push(id);
                visit(w, dep, next);
            }
        }
        w.state.insert(id, Visit::Done);
    }
    let mut w = Walk {
        requires: &requires,
        state: IndexMap::new(),
        reported: vec![],
        findings,
    };
    for id in requires.keys() {
        visit(&mut w, id, vec![]);
    }
}

fn check_type_ref(
    el: &XmlElement,
    element_id: Option<&str>,
    what: &str,
    findings: &mut Vec<CheckFinding>,
) {
    let Some(type_ref) = el.attr("typeRef") else {
        return;
    };
    if type_ref.is_empty() || TYPE_REFS.contains(&type_ref) {
        return;
    }
    let lower = type_ref.to_lowercase();
    let suggestion = TYPE_REFS.iter().find(|t| t.to_lowercase() == lower);
    findings.push(finding(
        "dmn/invalid-type-ref",
        CheckSeverity::Warning,
        element_id,
        format!(
            "{what} has typeRef \"{type_ref}\", which is not a DMN/FEEL type; the engine treats the value as untyped."
        ),
        match suggestion {
            Some(s) => format!("Use typeRef=\"{s}\" (type names are case-sensitive)."),
            None => "Use one of string, number, boolean, date, time, dateTime, dayTimeDuration, yearMonthDuration, context, list or Any.".into(),
        },
    ));
}

#[derive(Clone, Copy, PartialEq)]
enum Mode {
    Expression,
    Unary,
}

fn check_feel(
    text: &str,
    mode: Mode,
    element_id: Option<&str>,
    what: &str,
    findings: &mut Vec<CheckFinding>,
) {
    if text.is_empty() {
        return;
    }
    let options = ParseOptions::default();
    let errors = match mode {
        Mode::Unary => bpmnkit_feel::parse_unary_tests_partial(text, &options).errors,
        Mode::Expression => bpmnkit_feel::parse_partial(text, &options).errors,
    };
    let Some(first) = errors.first() else { return };
    let unary = mode == Mode::Unary;
    findings.push(error(
        "dmn/feel-syntax",
        element_id,
        format!(
            "{what} is not valid FEEL{}: {} (at {}) in `{text}`.",
            if unary { " unary tests" } else { "" },
            first.message,
            js::utf16_offset(text, first.start)
        ),
        if unary {
            "Write unary tests: a value (`\"gold\"`, `42`), a comparison (`> 10`), a range (`[1..5]`), a list (`\"a\",\"b\"`), `not(...)`, or `-` for any."
        } else {
            "Fix the FEEL expression; strings need double quotes and DMN entries have no leading `=`."
        },
    ));
}

fn check_decision(decision: &XmlElement, findings: &mut Vec<CheckFinding>) {
    let decision_id = decision.attr("id");
    let label = format!(
        "Decision \"{}\"",
        decision.attr("name").or(decision_id).unwrap_or("?")
    );
    let table = child(decision, "decisionTable");
    let literal = child(decision, "literalExpression");
    if let Some(variable) = child(decision, "variable") {
        check_type_ref(
            variable,
            decision_id,
            &format!("{label}'s variable"),
            findings,
        );
    }

    if let Some(literal) = literal {
        let what = format!("{label}'s literal expression");
        check_type_ref(literal, decision_id, &what, findings);
        let text = text_of(Some(literal));
        if text.is_empty() {
            findings.push(error(
                "dmn/empty-expression",
                decision_id,
                format!("{label} has an empty literal expression."),
                "Put a FEEL expression in <literalExpression><text>…</text></literalExpression>.",
            ));
        }
        check_feel(&text, Mode::Expression, decision_id, &what, findings);
    }

    let Some(table) = table else {
        if literal.is_none() {
            findings.push(error(
                "dmn/decision-no-logic",
                decision_id,
                format!("{label} has neither a <decisionTable> nor a <literalExpression>."),
                "Add a decision table or a literal expression; Zeebe cannot evaluate an empty decision.",
            ));
        }
        return;
    };

    let hit_policies = dmn_attribute_values("decisionTable", "hitPolicy");
    let aggregations = dmn_attribute_values("decisionTable", "aggregation");
    let table_id = table.attr("id").or(decision_id);
    let hit_policy = table.attr("hitPolicy");
    if let Some(hp) = hit_policy {
        if !hit_policies.contains(&hp) {
            let upper = hp.to_uppercase().replace('_', " ");
            findings.push(error(
                "dmn/invalid-hit-policy",
                table_id,
                format!("{label} has hitPolicy \"{hp}\"."),
                if hit_policies.contains(&upper.as_str()) {
                    format!("Write hitPolicy=\"{upper}\".")
                } else {
                    format!(
                        "Use one of {} (UNIQUE when omitted).",
                        hit_policies.join(", ")
                    )
                },
            ));
        }
    }
    if let Some(agg) = table.attr("aggregation") {
        if !aggregations.contains(&agg) {
            findings.push(error(
                "dmn/invalid-aggregation",
                table_id,
                format!("{label} has aggregation \"{agg}\"."),
                format!("Use one of {}.", aggregations.join(", ")),
            ));
        } else if hit_policy != Some("COLLECT") {
            findings.push(error(
                "dmn/invalid-aggregation",
                table_id,
                format!(
                    "{label} sets aggregation \"{agg}\" with hitPolicy \"{}\".",
                    hit_policy.unwrap_or("UNIQUE")
                ),
                "Aggregation only applies to hitPolicy=\"COLLECT\" — set that, or remove the aggregation.",
            ));
        }
    }

    let inputs: Vec<&XmlElement> = children_named(table, "input").collect();
    let outputs: Vec<&XmlElement> = children_named(table, "output").collect();
    if outputs.is_empty() {
        findings.push(error(
            "dmn/no-output",
            table_id,
            format!("{label}'s decision table has no <output>."),
            "Add an <output id=\"…\" name=\"result\" typeRef=\"string\"/> column.",
        ));
    }

    for input in &inputs {
        let input_id = input.attr("id");
        let expr = child(input, "inputExpression");
        let what = format!(
            "Input \"{}\" of {label}",
            input.attr("label").or(input_id).unwrap_or("?")
        );
        let text = text_of(expr);
        let Some(expr) = expr.filter(|_| !text.is_empty()) else {
            findings.push(error(
                "dmn/empty-input-expression",
                input_id,
                format!("{what} has no input expression."),
                "Set <inputExpression><text>variableName</text></inputExpression> to the value the column tests.",
            ));
            continue;
        };
        check_type_ref(expr, input_id, &what, findings);
        check_feel(
            &text,
            Mode::Expression,
            input_id,
            &format!("{what}'s expression"),
            findings,
        );
    }

    for output in &outputs {
        let output_id = output.attr("id");
        let shown = output.attr("name").or(output_id).unwrap_or("?");
        check_type_ref(output, output_id, &format!("Output \"{shown}\""), findings);
        if outputs.len() > 1 && output.attr("name").unwrap_or("").is_empty() {
            findings.push(error(
                "dmn/missing-output-name",
                output_id,
                format!(
                    "Output \"{}\" of {label} has no name, and the table has {} outputs.",
                    output.attr("label").or(output_id).unwrap_or("?"),
                    outputs.len()
                ),
                "Give every output a name — with several outputs the result is a context keyed by output name.",
            ));
        }
    }

    for rule in children_named(table, "rule") {
        let rule_id = rule.attr("id");
        let rule_shown = rule_id.unwrap_or("?");
        let in_entries: Vec<&XmlElement> = children_named(rule, "inputEntry").collect();
        let out_entries: Vec<&XmlElement> = children_named(rule, "outputEntry").collect();
        if in_entries.len() != inputs.len() || out_entries.len() != outputs.len() {
            findings.push(error(
                "dmn/rule-entry-count",
                rule_id,
                format!(
                    "Rule \"{rule_shown}\" of {label} has {} input and {} output entries; the table has {} inputs and {} outputs.",
                    in_entries.len(),
                    out_entries.len(),
                    inputs.len(),
                    outputs.len()
                ),
                "Give every rule exactly one <inputEntry> per input and one <outputEntry> per output, in column order (use `-` for any).",
            ));
        }
        for entry in in_entries {
            let text = text_of(Some(entry));
            check_feel(
                if text == "-" { "" } else { &text },
                Mode::Unary,
                entry.attr("id").or(rule_id),
                &format!("Input entry of rule \"{rule_shown}\""),
                findings,
            );
        }
        for entry in out_entries {
            check_feel(
                &text_of(Some(entry)),
                Mode::Expression,
                entry.attr("id").or(rule_id),
                &format!("Output entry of rule \"{rule_shown}\""),
                findings,
            );
        }
    }
}
