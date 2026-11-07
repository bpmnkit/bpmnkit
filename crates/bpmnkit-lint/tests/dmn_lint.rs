//! Ported from `packages/core/tests/dmn-lint.test.ts`.

use bpmnkit_lint::{lint_dmn, CheckSeverity};

const NS: &str = r#"xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/""#;

fn doc(body: &str) -> String {
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?><definitions {NS} id="defs" name="d" namespace="x">{body}</definitions>"#
    )
}

#[derive(Default)]
struct T<'a> {
    hit_policy: Option<&'a str>,
    extra: &'a str,
    input: Option<&'a str>,
    rule: Option<&'a str>,
}

fn table(o: T) -> String {
    let hp = o
        .hit_policy
        .map(|h| format!(r#" hitPolicy="{h}""#))
        .unwrap_or_default();
    doc(&format!(
        r#"<decision id="discount" name="Discount">
	<decisionTable id="table"{hp}{}>
		<input id="in1" label="Tier"><inputExpression id="ie1" typeRef="string"><text>{}</text></inputExpression></input>
		<output id="out1" name="discount" typeRef="number"/>
		{}
	</decisionTable>
</decision>"#,
        o.extra,
        o.input.unwrap_or("tier"),
        o.rule.unwrap_or(r#"<rule id="r1"><inputEntry id="e1"><text>"gold"</text></inputEntry><outputEntry id="o1"><text>10</text></outputEntry></rule>"#)
    ))
}

fn rules(xml: &str) -> Vec<String> {
    lint_dmn(xml).into_iter().map(|f| f.rule).collect()
}

#[test]
fn valid_decision_table() {
    assert_eq!(lint_dmn(&table(T::default())), vec![]);
}

#[test]
fn malformed_xml() {
    let f = lint_dmn("<definitions><decision></definitions>");
    assert_eq!(f[0].rule, "dmn/malformed-xml");
    assert!(!f[0].fix.is_empty());
}

#[test]
fn not_dmn() {
    assert_eq!(rules("<process id='p'/>"), ["dmn/not-dmn"]);
}

#[test]
fn duplicate_id() {
    let f = lint_dmn(&table(T {
        rule: Some(
            r#"<rule id="in1"><inputEntry id="e1"><text>-</text></inputEntry><outputEntry id="o1"><text>1</text></outputEntry></rule>"#,
        ),
        ..T::default()
    }));
    assert_eq!(
        f.iter().map(|x| x.rule.as_str()).collect::<Vec<_>>(),
        ["dmn/duplicate-id"]
    );
    assert_eq!(f[0].element_id.as_deref(), Some("in1"));
}

#[test]
fn missing_id_and_no_decision() {
    assert_eq!(
        rules(&doc(
            r#"<inputData name="Tier"/><decision id="d"><literalExpression><text>1</text></literalExpression></decision>"#
        )),
        ["dmn/missing-id"]
    );
    assert_eq!(rules(&doc(r#"<inputData id="i"/>"#)), ["dmn/no-decision"]);
}

#[test]
fn unresolved_requirement() {
    let xml = doc(r##"<inputData id="tier"/>
			<decision id="a"><informationRequirement id="ir1"><requiredDecision href="#nope"/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>
			<decision id="b"><informationRequirement id="ir2"><requiredDecision href="#tier"/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>
			<decision id="c"><informationRequirement id="ir3"><requiredInput href=""/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>"##);
    let found = lint_dmn(&xml);
    let got: Vec<_> = found
        .iter()
        .map(|f| (f.rule.as_str(), f.element_id.as_deref().unwrap_or("")))
        .collect();
    let rule = "dmn/unresolved-requirement";
    assert_eq!(got, [(rule, "a"), (rule, "b"), (rule, "c")]);
    assert!(found[1].fix.contains("requiredInput"));
}

#[test]
fn resolves_requirements_and_skips_other_files() {
    let xml = doc(r##"<inputData id="tier"/>
			<decision id="a"><informationRequirement id="ir1"><requiredInput href="#tier"/></informationRequirement><literalExpression><text>tier</text></literalExpression></decision>
			<decision id="b"><informationRequirement id="ir2"><requiredDecision href="#a"/></informationRequirement><informationRequirement id="ir3"><requiredDecision href="other.dmn#x"/></informationRequirement><literalExpression><text>a</text></literalExpression></decision>"##);
    assert_eq!(lint_dmn(&xml), vec![]);
}

#[test]
fn requirement_cycle() {
    let xml = doc(
        r##"<decision id="a"><informationRequirement id="ir1"><requiredDecision href="#b"/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>
			<decision id="b"><informationRequirement id="ir2"><requiredDecision href="#a"/></informationRequirement><literalExpression><text>1</text></literalExpression></decision>"##,
    );
    let f = lint_dmn(&xml);
    assert_eq!(f.len(), 1);
    assert_eq!(
        f[0].message,
        "Decisions require each other in a cycle: a → b → a."
    );
}

#[test]
fn decision_logic() {
    assert_eq!(
        rules(&doc(r#"<decision id="d"/>"#)),
        ["dmn/decision-no-logic"]
    );
    assert_eq!(
        rules(&doc(
            r#"<decision id="d"><literalExpression><text> </text></literalExpression></decision>"#
        )),
        ["dmn/empty-expression"]
    );
}

#[test]
fn hit_policy_and_aggregation() {
    let f = lint_dmn(&table(T {
        hit_policy: Some("rule_order"),
        ..T::default()
    }));
    assert_eq!(f[0].rule, "dmn/invalid-hit-policy");
    assert!(f[0].fix.contains("\"RULE ORDER\""));
    for (hp, extra, n) in [
        ("COLLECT", r#" aggregation="AVG""#, 1),
        ("FIRST", r#" aggregation="SUM""#, 1),
        ("COLLECT", r#" aggregation="SUM""#, 0),
    ] {
        let r = rules(&table(T {
            hit_policy: Some(hp),
            extra,
            ..T::default()
        }));
        assert_eq!(r.len(), n);
        assert!(r.iter().all(|r| r == "dmn/invalid-aggregation"));
    }
}

#[test]
fn type_ref_suggests_case() {
    let xml = table(T::default()).replace(r#"typeRef="number""#, r#"typeRef="Number""#);
    let f = lint_dmn(&xml);
    assert_eq!(f[0].rule, "dmn/invalid-type-ref");
    assert_eq!(f[0].severity, CheckSeverity::Warning);
    assert!(f[0].fix.contains(r#"typeRef="number""#));
}

/// Regression: an output with neither a name nor an id was shown as `Output "undefined"`.
#[test]
fn type_ref_on_an_output_with_no_name_or_id() {
    let xml = table(T::default()).replace(
        r#"<output id="out1" name="discount" typeRef="number"/>"#,
        r#"<output typeRef="Number"/>"#,
    );
    let f = lint_dmn(&xml);
    assert_eq!(f[0].rule, "dmn/invalid-type-ref");
    assert!(
        f[0].message
            .starts_with(r#"Output "?" has typeRef "Number""#),
        "{}",
        f[0].message
    );
}

#[test]
fn outputs_and_inputs() {
    let no_output = table(T::default())
        .replace(
            r#"<output id="out1" name="discount" typeRef="number"/>"#,
            "",
        )
        .replace(r#"<outputEntry id="o1"><text>10</text></outputEntry>"#, "");
    assert_eq!(rules(&no_output), ["dmn/no-output"]);
    let xml = table(T {
        rule: Some(r#"<rule id="r1"><inputEntry id="e1"><text>-</text></inputEntry><outputEntry id="o1"><text>1</text></outputEntry><outputEntry id="o2"><text>2</text></outputEntry></rule>"#),
        ..T::default()
    })
    .replace(
        r#"<output id="out1" name="discount" typeRef="number"/>"#,
        r#"<output id="out1" name="discount"/><output id="out2" label="Extra"/>"#,
    );
    assert_eq!(rules(&xml), ["dmn/missing-output-name"]);
    assert_eq!(
        rules(&table(T {
            input: Some(""),
            ..T::default()
        })),
        ["dmn/empty-input-expression"]
    );
    let f = lint_dmn(&table(T {
        rule: Some(r#"<rule id="r1"><outputEntry id="o1"><text>1</text></outputEntry></rule>"#),
        ..T::default()
    }));
    assert_eq!(f[0].rule, "dmn/rule-entry-count");
    assert_eq!(f[0].element_id.as_deref(), Some("r1"));
}

#[test]
fn feel_syntax() {
    assert_eq!(
        rules(&table(T {
            input: Some("tier +"),
            ..T::default()
        })),
        ["dmn/feel-syntax"]
    );
    let entry = |i: &str, o: &str| {
        let rule = format!(
            r#"<rule id="r1"><inputEntry id="e1"><text>{i}</text></inputEntry><outputEntry id="o1"><text>{o}</text></outputEntry></rule>"#
        );
        table(T {
            rule: Some(&rule),
            ..T::default()
        })
    };
    let bad = lint_dmn(&entry(">= 10 and &lt; 20", "1"));
    assert_eq!(bad.len(), 1);
    assert_eq!(
        (bad[0].rule.as_str(), bad[0].element_id.as_deref()),
        ("dmn/feel-syntax", Some("e1"))
    );
    assert_eq!(rules(&entry("-", "= 1")), ["dmn/feel-syntax"]);
    assert_eq!(rules(&entry("-", "")), Vec::<String>::new());
    assert_eq!(
        rules(&doc(
            r#"<decision id="d"><literalExpression><text>1 +</text></literalExpression></decision>"#
        )),
        ["dmn/feel-syntax"]
    );
}

#[test]
fn every_finding_has_rule_message_fix() {
    for f in lint_dmn(&table(T {
        hit_policy: Some("X"),
        input: Some(""),
        ..T::default()
    })) {
        assert!(f.rule.starts_with("dmn/"));
        assert!(!f.message.is_empty() && !f.fix.is_empty());
    }
}
