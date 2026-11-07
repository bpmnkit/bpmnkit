//! DMN for the Reebe workflow engine: an adapter over the shared `bpmnkit-dmn` crate, which
//! parses (the twin of `@bpmnkit/core`'s DMN parser) and evaluates (the twin of
//! `@bpmnkit/engine`'s `evaluateDecisionGraph`). This crate keeps reebe's API and adds what
//! Zeebe does differently from the TS evaluator: a syntax error fails the decision, and a
//! list hit policy with no matching rule is an empty list.

use bpmnkit_dmn::{Diagnostic, DmnDefinitions};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum DmnError {
    #[error("DMN parse error: {0}")]
    ParseError(String),

    #[error("Decision '{0}' not found")]
    DecisionNotFound(String),

    #[error("Decision evaluation error: {0}")]
    EvaluationError(String),
}

/// A parsed DMN decision requirements graph.
#[derive(Debug, Clone)]
pub struct DmnDecisionRequirementsGraph {
    pub id: String,
    pub name: String,
    pub namespace: Option<String>,
    pub decisions: Vec<DmnDecision>,
    definitions: DmnDefinitions,
}

impl DmnDecisionRequirementsGraph {
    /// The full shared model.
    pub fn definitions(&self) -> &DmnDefinitions {
        &self.definitions
    }
}

/// A decision of the graph: what deployment records need.
#[derive(Debug, Clone)]
pub struct DmnDecision {
    pub id: String,
    pub name: String,
}

/// Parses a DMN 1.3 document.
pub fn parse_dmn(xml: &str) -> Result<DmnDecisionRequirementsGraph, DmnError> {
    let definitions = bpmnkit_dmn::parse_dmn(xml).map_err(|e| DmnError::ParseError(e.0))?;
    Ok(DmnDecisionRequirementsGraph {
        id: definitions.id.clone(),
        name: definitions.name.clone(),
        namespace: Some(definitions.namespace.clone()),
        decisions: definitions
            .decisions
            .iter()
            .map(|d| DmnDecision {
                id: d.id.clone(),
                name: d.name.clone().unwrap_or_default(),
            })
            .collect(),
        definitions,
    })
}

/// Hit policies whose result is a list (without an aggregation).
fn is_list_policy(definitions: &DmnDefinitions, decision_id: &str) -> bool {
    definitions
        .decisions
        .iter()
        .find(|d| d.id == decision_id)
        .and_then(|d| d.decision_table.as_ref())
        .is_some_and(|t| match t.hit_policy.as_deref() {
            Some("COLLECT") => t.aggregation.is_none(),
            Some("RULE ORDER" | "OUTPUT ORDER") => true,
            _ => false,
        })
}

/// Evaluates a decision, with the decisions it requires, against `input` (a JSON object of
/// variables). Returns the decision's result as JSON.
pub fn evaluate_decision(
    drg: &DmnDecisionRequirementsGraph,
    decision_id: &str,
    input: &serde_json::Value,
) -> Result<serde_json::Value, DmnError> {
    let context = reebe_feel::to_shared_context(&reebe_feel::FeelContext::from_json(input.clone()));
    let evaluation = bpmnkit_dmn::evaluate_decision_graph(&drg.definitions, decision_id, &context)
        .map_err(|e| match e {
            bpmnkit_dmn::EvalError::NotFound(id) => DmnError::DecisionNotFound(id),
            other => DmnError::EvaluationError(other.to_string()),
        })?;
    // Zeebe fails a decision on an expression that does not parse; TS runs what it recovered.
    if let Some(Diagnostic::Syntax {
        decision,
        source,
        message,
    }) = evaluation
        .diagnostics
        .iter()
        .find(|d| matches!(d, Diagnostic::Syntax { .. }))
    {
        return Err(DmnError::EvaluationError(format!(
            "failed to parse expression '{source}' of decision '{decision}': {message}"
        )));
    }
    let value: serde_json::Value = reebe_feel::from_shared_value(evaluation.result).into();
    if value.is_null() && is_list_policy(&drg.definitions, decision_id) {
        return Ok(serde_json::Value::Array(vec![]));
    }
    Ok(value)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    const INVOICE_CLASSIFICATION_DMN: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             namespace="http://camunda.org/schema/1.0/dmn"
             name="DRD"
             id="invoice-classification-drg">
  <decision id="invoice-classification" name="Invoice Classification">
    <decisionTable id="decisionTable1" hitPolicy="UNIQUE">
      <input id="input1" label="Invoice Amount">
        <inputExpression id="inputExpression1" typeRef="double">
          <text>amount</text>
        </inputExpression>
      </input>
      <output id="output1" name="classification" typeRef="string"/>
      <rule id="rule1">
        <inputEntry id="inputEntry1"><text>&lt; 250</text></inputEntry>
        <outputEntry id="outputEntry1"><text>"low"</text></outputEntry>
      </rule>
      <rule id="rule2">
        <inputEntry id="inputEntry2"><text>[250..1000]</text></inputEntry>
        <outputEntry id="outputEntry2"><text>"medium"</text></outputEntry>
      </rule>
      <rule id="rule3">
        <inputEntry id="inputEntry3"><text>&gt;= 1000</text></inputEntry>
        <outputEntry id="outputEntry3"><text>"high"</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
</definitions>"#;

    const COLLECT_DMN: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             namespace="http://camunda.org/schema/1.0/dmn"
             name="DRD"
             id="multi-match-drg">
  <decision id="product-features" name="Product Features">
    <decisionTable id="dt1" hitPolicy="COLLECT">
      <input id="i1" label="Product Type">
        <inputExpression id="ie1" typeRef="string">
          <text>productType</text>
        </inputExpression>
      </input>
      <output id="o1" name="feature" typeRef="string"/>
      <rule id="r1">
        <inputEntry id="ie1r1"><text>"premium"</text></inputEntry>
        <outputEntry id="oe1r1"><text>"discount"</text></outputEntry>
      </rule>
      <rule id="r2">
        <inputEntry id="ie1r2"><text>"premium"</text></inputEntry>
        <outputEntry id="oe1r2"><text>"support"</text></outputEntry>
      </rule>
      <rule id="r3">
        <inputEntry id="ie1r3"><text>"standard"</text></inputEntry>
        <outputEntry id="oe1r3"><text>"basic"</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
</definitions>"#;

    const LITERAL_DMN: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             namespace="http://camunda.org/schema/1.0/dmn"
             name="DRD"
             id="literal-drg">
  <decision id="discount" name="Discount">
    <literalExpression>
      <text>amount * 0.1</text>
    </literalExpression>
  </decision>
</definitions>"#;

    #[test]
    fn test_parse_simple_decision_table() {
        let drg = parse_dmn(INVOICE_CLASSIFICATION_DMN).expect("should parse");
        assert_eq!(drg.id, "invoice-classification-drg");
        assert_eq!(drg.name, "DRD");
        assert_eq!(drg.decisions.len(), 1);

        let dec = &drg.decisions[0];
        assert_eq!(dec.id, "invoice-classification");

        assert_eq!(dec.name, "Invoice Classification");
        let table = drg.definitions().decisions[0]
            .decision_table
            .as_ref()
            .expect("table");
        assert_eq!(table.hit_policy.as_deref(), Some("UNIQUE"));
        assert_eq!(table.rules[0].input_entries[0].text, "< 250");
    }

    #[test]
    fn test_evaluate_unique_hit_policy_low() {
        let drg = parse_dmn(INVOICE_CLASSIFICATION_DMN).expect("should parse");
        let result = evaluate_decision(&drg, "invoice-classification", &json!({"amount": 100}))
            .expect("should evaluate");
        assert_eq!(result, json!("low"));
    }

    #[test]
    fn test_evaluate_unique_hit_policy_medium() {
        let drg = parse_dmn(INVOICE_CLASSIFICATION_DMN).expect("should parse");
        let result = evaluate_decision(&drg, "invoice-classification", &json!({"amount": 500}))
            .expect("should evaluate");
        assert_eq!(result, json!("medium"));
    }

    #[test]
    fn test_evaluate_unique_hit_policy_high() {
        let drg = parse_dmn(INVOICE_CLASSIFICATION_DMN).expect("should parse");
        let result = evaluate_decision(&drg, "invoice-classification", &json!({"amount": 2000}))
            .expect("should evaluate");
        assert_eq!(result, json!("high"));
    }

    #[test]
    fn test_evaluate_collect_hit_policy() {
        let drg = parse_dmn(COLLECT_DMN).expect("should parse");
        let result =
            evaluate_decision(&drg, "product-features", &json!({"productType": "premium"}))
                .expect("should evaluate");

        let arr = result.as_array().expect("should be array");
        assert_eq!(arr.len(), 2);
        assert_eq!(arr[0], json!("discount"));
        assert_eq!(arr[1], json!("support"));
    }

    #[test]
    fn test_evaluate_collect_hit_policy_no_match() {
        let drg = parse_dmn(COLLECT_DMN).expect("should parse");
        let result = evaluate_decision(
            &drg,
            "product-features",
            &json!({"productType": "enterprise"}),
        )
        .expect("should evaluate");

        let arr = result.as_array().expect("should be array");
        assert_eq!(arr.len(), 0);
    }

    #[test]
    fn test_evaluate_literal_expression() {
        let drg = parse_dmn(LITERAL_DMN).expect("should parse");
        let result =
            evaluate_decision(&drg, "discount", &json!({"amount": 200})).expect("should evaluate");

        // 200 * 0.1 = 20.0
        let v = result.as_f64().expect("should be number");
        assert!((v - 20.0).abs() < 0.001, "expected ~20.0, got {}", v);
    }

    #[test]
    fn test_decision_not_found() {
        let drg = parse_dmn(INVOICE_CLASSIFICATION_DMN).expect("should parse");
        let err = evaluate_decision(&drg, "nonexistent", &json!({})).expect_err("should fail");
        assert!(matches!(err, DmnError::DecisionNotFound(_)));
    }

    const DRD_DMN: &str = r##"<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" namespace="n" name="DRD" id="drd">
  <decision id="tier" name="Tier">
    <literalExpression><text>if spend &gt; 100 then "gold" else "basic"</text></literalExpression>
  </decision>
  <decision id="rate" name="Rate">
    <informationRequirement id="ir"><requiredDecision href="#tier"/></informationRequirement>
    <literalExpression><text>if Tier = "gold" then 0.2 else 0</text></literalExpression>
  </decision>
</definitions>"##;

    #[test]
    fn test_required_decisions_are_in_scope_by_name() {
        let drg = parse_dmn(DRD_DMN).expect("should parse");
        let result = evaluate_decision(&drg, "rate", &json!({"spend": 500})).expect("evaluates");
        assert_eq!(result, json!(0.2));
    }

    #[test]
    fn test_syntax_error_fails_the_decision() {
        let drg = parse_dmn(&LITERAL_DMN.replace("amount * 0.1", "amount *")).expect("parses");
        let err = evaluate_decision(&drg, "discount", &json!({"amount": 1})).expect_err("fails");
        assert!(
            err.to_string()
                .contains("failed to parse expression 'amount *'"),
            "{err}"
        );
    }

    #[test]
    fn test_unique_with_several_matching_rules_fails_the_decision() {
        let overlapping = INVOICE_CLASSIFICATION_DMN.replace("[250..1000]", "&gt; 50");
        let drg = parse_dmn(&overlapping).expect("should parse");
        let err = evaluate_decision(&drg, "invoice-classification", &json!({"amount": 100}))
            .expect_err("fails");
        assert!(matches!(err, DmnError::EvaluationError(_)));
        assert!(
            err.to_string().contains("Hit policy UNIQUE violated"),
            "{err}"
        );
    }

    #[test]
    fn test_value_of_another_type_than_its_type_ref_fails_the_decision() {
        let drg = parse_dmn(INVOICE_CLASSIFICATION_DMN).expect("should parse");
        // The input is declared `double`, a legacy numeric type, so a string is rejected.
        let err = evaluate_decision(&drg, "invoice-classification", &json!({"amount": "12"}))
            .expect_err("fails");
        assert!(err.to_string().contains("typeRef is 'double'"), "{err}");
    }

    #[test]
    fn test_collect_without_match_is_an_empty_list_as_in_zeebe() {
        let drg = parse_dmn(COLLECT_DMN).expect("should parse");
        let result = evaluate_decision(&drg, "product-features", &json!({})).expect("evaluates");
        assert_eq!(result, json!([]));
    }
}
