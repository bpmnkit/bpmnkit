//! DMN evaluation: the Rust twin of `@bpmnkit/engine`'s `evaluateDecision` and
//! `evaluateDecisionGraph` (`packages/engine/src/dmn.ts`). TS is the oracle, so its quirks are
//! kept: an expression that does not parse still runs the tree the parser recovered, an input
//! entry with no tree matches anything, and an unknown hit policy yields null. What TS drops
//! silently is reported here as [`Diagnostic`]s, so a caller such as reebe can fail where
//! Zeebe fails.

use crate::model::{DmnDecision, DmnDefinitions};
use bpmnkit_feel::{
    parse_partial, parse_unary_tests_partial, Context, Decimal, ParseOptions, Value, Warning,
};
use bpmnkit_xml::local_name;
use std::collections::HashMap;

/// Something the evaluation passed over. Never changes the result.
#[derive(Debug, Clone, PartialEq)]
pub enum Diagnostic {
    /// An expression or input entry with syntax errors; its recovered tree, if any, was used.
    Syntax {
        decision: String,
        source: String,
        message: String,
    },
    /// A FEEL failure that became null (FEEL-Scala's warning types, as Zeebe reports them).
    Feel { decision: String, warning: Warning },
}

/// Why a decision graph could not be evaluated.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EvalError {
    NotFound(String),
    Cycle(String),
}

impl std::fmt::Display for EvalError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // Same messages as the TS errors.
        match self {
            EvalError::NotFound(id) => write!(f, "Decision '{id}' not found"),
            EvalError::Cycle(id) => write!(f, "Decision '{id}' requires itself"),
        }
    }
}

impl std::error::Error for EvalError {}

/// One decision evaluated within a graph, in evaluation order.
#[derive(Debug, Clone, PartialEq)]
pub struct EvaluatedDecision {
    pub decision_id: String,
    pub result: Value,
}

/// The result of a decision graph evaluation.
#[derive(Debug, Clone, PartialEq)]
pub struct GraphEvaluation {
    pub result: Value,
    /// Required decisions first, the requested one last.
    pub evaluated_decisions: Vec<EvaluatedDecision>,
    pub diagnostics: Vec<Diagnostic>,
}

/// A single decision's result and what was passed over computing it.
#[derive(Debug, Clone, PartialEq)]
pub struct DecisionEvaluation {
    pub result: Value,
    pub diagnostics: Vec<Diagnostic>,
}

struct Evaluator<'a> {
    decision: &'a str,
    vars: &'a Context,
    options: ParseOptions,
    diagnostics: Vec<Diagnostic>,
}

impl Evaluator<'_> {
    fn syntax(&mut self, source: &str, errors: &[bpmnkit_feel::ParseError]) {
        if let Some(e) = errors.first() {
            self.diagnostics.push(Diagnostic::Syntax {
                decision: self.decision.to_string(),
                source: source.to_string(),
                message: e.message.clone(),
            });
        }
    }

    fn feel(&mut self, warnings: Vec<Warning>) {
        self.diagnostics
            .extend(warnings.into_iter().map(|warning| Diagnostic::Feel {
                decision: self.decision.to_string(),
                warning,
            }));
    }

    /// TS `evalExpression`: parse the trimmed text, run whatever tree came back.
    fn expression(&mut self, text: &str) -> Value {
        let src = text.trim();
        let p = parse_partial(src, &self.options);
        self.syntax(src, &p.errors);
        let Some(expr) = p.parsed else {
            return Value::Null;
        };
        let e = expr.evaluate_with_diagnostics(self.vars);
        self.feel(e.warnings);
        e.value
    }

    fn unary(&mut self, text: &str, input: &Value) -> bool {
        let p = parse_unary_tests_partial(text, &self.options);
        self.syntax(text, &p.errors);
        let Some(tests) = p.parsed else {
            return true;
        };
        let (ok, warnings) = tests.test_with_diagnostics(input, self.vars);
        self.feel(warnings);
        ok
    }
}

/// A JS array index ("0", "17"): JS objects list those keys first, in numeric order.
fn array_index(k: &str) -> Option<u32> {
    let n: u32 = k.parse().ok()?;
    (n != u32::MAX && n.to_string() == k).then_some(n)
}

/// The row's first value in JS `Object.keys` order.
fn first_value(row: &Context) -> Value {
    let first = row
        .keys()
        .filter_map(|k| array_index(k).map(|n| (n, k)))
        .min()
        .map(|(_, k)| k)
        .or_else(|| row.keys().next());
    first
        .and_then(|k| row.get(k).cloned())
        .unwrap_or(Value::Null)
}

/// TS `aggregate` over the numbers among `values`.
fn aggregate(op: &str, values: &[Decimal]) -> Value {
    if values.is_empty() {
        return Value::Null;
    }
    match op {
        "SUM" => values
            .iter()
            .try_fold(Decimal::ZERO, |a, b| a.checked_add(*b))
            .map_or(Value::Null, Value::Number),
        "MIN" => Value::Number(*values.iter().min().expect("non-empty")),
        "MAX" => Value::Number(*values.iter().max().expect("non-empty")),
        "COUNT" => Value::Number(Decimal::from(values.len())),
        _ => Value::Null,
    }
}

/// Evaluates a decision's table by its hit policy, as `evaluateDecision` does: null when the
/// decision has no table. Variables named in `vars` may contain spaces.
pub fn evaluate_decision_table(decision: &DmnDecision, vars: &Context) -> DecisionEvaluation {
    let mut ev = Evaluator {
        decision: &decision.id,
        vars,
        options: ParseOptions {
            names: vars.keys().cloned().collect(),
        },
        diagnostics: vec![],
    };
    let result = table(&mut ev, decision);
    DecisionEvaluation {
        result,
        diagnostics: ev.diagnostics,
    }
}

fn table(ev: &mut Evaluator, decision: &DmnDecision) -> Value {
    let Some(table) = &decision.decision_table else {
        return Value::Null;
    };
    let hit_policy = table.hit_policy.as_deref().unwrap_or("UNIQUE");
    // Input expressions do not depend on the rule: evaluate each column once.
    let inputs: Vec<Value> = table
        .inputs
        .iter()
        .map(|col| {
            let text = col.input_expression.text.as_deref().unwrap_or("");
            if text.trim().is_empty() {
                Value::Null
            } else {
                ev.expression(text)
            }
        })
        .collect();

    let mut rows: Vec<Context> = vec![];
    for rule in &table.rules {
        let matches = (0..table.inputs.len()).all(|i| match rule.input_entries.get(i) {
            Some(entry) if !entry.text.trim().is_empty() => ev.unary(&entry.text, &inputs[i]),
            _ => true,
        });
        if !matches {
            continue;
        }
        let mut row = Context::new();
        for (col, entry) in table.outputs.iter().zip(&rule.output_entries) {
            let key = col.name.as_ref().or(col.label.as_ref()).unwrap_or(&col.id);
            let value = if entry.text.trim().is_empty() {
                Value::Null
            } else {
                ev.expression(&entry.text)
            };
            row.insert(key.clone(), value);
        }
        rows.push(row);
        if hit_policy == "FIRST" {
            break;
        }
    }

    if rows.is_empty() {
        return Value::Null;
    }
    let single = table.outputs.len() == 1;
    let list = |rows: Vec<Context>| {
        Value::List(if single {
            rows.iter().map(first_value).collect()
        } else {
            rows.into_iter().map(Value::Context).collect()
        })
    };
    match hit_policy {
        "UNIQUE" | "FIRST" | "ANY" => {
            let row = rows.swap_remove(0);
            if single {
                first_value(&row)
            } else {
                Value::Context(row)
            }
        }
        "RULE ORDER" | "OUTPUT ORDER" | "PRIORITY" => list(rows),
        "COLLECT" => match &table.aggregation {
            None => list(rows),
            Some(op) => {
                let values: Vec<Decimal> = rows
                    .iter()
                    .filter_map(|r| match first_value(r) {
                        Value::Number(n) => Some(n),
                        _ => None,
                    })
                    .collect();
                aggregate(op, &values)
            }
        },
        _ => Value::Null,
    }
}

/// The text of a decision's `<literalExpression>`, which the parser keeps in
/// `extension_elements` (TS `literalExpressionText`).
pub fn literal_expression_text(decision: &DmnDecision) -> Option<&str> {
    decision
        .extension_elements
        .as_deref()?
        .iter()
        .find(|c| local_name(&c.name) == "literalExpression")?
        .children
        .iter()
        .find(|c| local_name(&c.name) == "text")?
        .text
        .as_deref()
}

/// Evaluates a decision with the decisions it requires (TS `evaluateDecisionGraph`). Each
/// required decision runs once, before its readers, and its result is in scope under its name
/// (its id when it has none). A decision without a table evaluates its literal expression.
pub fn evaluate_decision_graph(
    definitions: &DmnDefinitions,
    decision_id: &str,
    vars: &Context,
) -> Result<GraphEvaluation, EvalError> {
    struct Graph<'a> {
        by_id: HashMap<&'a str, &'a DmnDecision>,
        done: HashMap<String, Value>,
        visiting: Vec<String>,
        out: GraphEvaluation,
    }

    fn visit(g: &mut Graph, id: &str, vars: &Context) -> Result<Value, EvalError> {
        if let Some(v) = g.done.get(id) {
            return Ok(v.clone());
        }
        let decision = *g
            .by_id
            .get(id)
            .ok_or_else(|| EvalError::NotFound(id.to_string()))?;
        if g.visiting.iter().any(|v| v == id) {
            return Err(EvalError::Cycle(id.to_string()));
        }
        g.visiting.push(id.to_string());
        let mut scope = vars.clone();
        for req in &decision.information_requirements {
            let Some(required) = &req.required_decision else {
                continue;
            };
            let value = visit(g, required, vars)?;
            let name = g
                .by_id
                .get(required.as_str())
                .and_then(|d| d.name.clone())
                .unwrap_or_else(|| required.clone());
            scope.insert(name, value);
        }
        g.visiting.pop();
        let mut ev = Evaluator {
            decision: &decision.id,
            vars: &scope,
            options: ParseOptions {
                names: scope.keys().cloned().collect(),
            },
            diagnostics: vec![],
        };
        let result = if decision.decision_table.is_some() {
            table(&mut ev, decision)
        } else {
            match literal_expression_text(decision) {
                Some(text) if !text.trim().is_empty() => ev.expression(text),
                _ => Value::Null,
            }
        };
        g.out.diagnostics.append(&mut ev.diagnostics);
        g.done.insert(id.to_string(), result.clone());
        g.out.evaluated_decisions.push(EvaluatedDecision {
            decision_id: id.to_string(),
            result: result.clone(),
        });
        Ok(result)
    }

    let mut g = Graph {
        by_id: definitions
            .decisions
            .iter()
            .map(|d| (d.id.as_str(), d))
            .collect(),
        done: HashMap::new(),
        visiting: vec![],
        out: GraphEvaluation {
            result: Value::Null,
            evaluated_decisions: vec![],
            diagnostics: vec![],
        },
    };
    g.out.result = visit(&mut g, decision_id, vars)?;
    Ok(g.out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parse_dmn;

    fn table(hit_policy: &str, aggregation: &str) -> String {
        format!(
            r#"<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="d" name="d" namespace="n">
  <decision id="t" name="t"><decisionTable id="tt" hitPolicy="{hit_policy}"{aggregation}>
    <input id="i"><inputExpression id="ie"><text>x</text></inputExpression></input>
    <output id="o" name="o"/>
    <rule id="r"><inputEntry id="re"><text>&gt; 1</text></inputEntry><outputEntry id="ro"><text>x * 2</text></outputEntry></rule>
  </decisionTable></decision>
</definitions>"#
        )
    }

    fn ctx(x: i64) -> Context {
        let mut c = Context::new();
        c.insert("x", Value::from(x));
        c
    }

    /// Every hit policy and aggregation the spec allows is handled (an unknown one is null).
    #[test]
    fn handles_every_spec_hit_policy_and_aggregation() {
        for hp in bpmnkit_spec::elements::dmn_attribute_values("decisionTable", "hitPolicy") {
            let defs = parse_dmn(&table(hp, "")).unwrap();
            let r = evaluate_decision_graph(&defs, "t", &ctx(5)).unwrap().result;
            assert_ne!(r, Value::Null, "{hp}");
        }
        for agg in bpmnkit_spec::elements::dmn_attribute_values("decisionTable", "aggregation") {
            let defs = parse_dmn(&table("COLLECT", &format!(r#" aggregation="{agg}""#))).unwrap();
            let r = evaluate_decision_graph(&defs, "t", &ctx(5)).unwrap().result;
            assert_ne!(r, Value::Null, "{agg}");
        }
        let defs = parse_dmn(&table("BOGUS", "")).unwrap();
        assert_eq!(
            evaluate_decision_graph(&defs, "t", &ctx(5)).unwrap().result,
            Value::Null
        );
    }

    #[test]
    fn reports_syntax_errors_and_feel_warnings() {
        let xml = table("UNIQUE", "")
            .replace("x * 2", "x +")
            .replace("&gt; 1", "&gt; \"a\"");
        let defs = parse_dmn(&xml).unwrap();
        let ev = evaluate_decision_table(&defs.decisions[0], &ctx(5));
        assert_eq!(ev.result, Value::Null);
        assert!(ev
            .diagnostics
            .iter()
            .any(|d| matches!(d, Diagnostic::Feel { warning, .. } if warning.kind == bpmnkit_feel::WarningKind::NotComparable)));
        let xml = table("UNIQUE", "").replace("x * 2", "x +");
        let defs = parse_dmn(&xml).unwrap();
        let ev = evaluate_decision_table(&defs.decisions[0], &ctx(5));
        // TS runs the recovered tree (`x`); the syntax error is still reported.
        assert_eq!(ev.result, Value::from(5));
        assert!(
            matches!(&ev.diagnostics[0], Diagnostic::Syntax { decision, source, .. } if decision == "t" && source == "x +")
        );
    }

    #[test]
    fn graph_errors_read_as_in_ts() {
        let defs = parse_dmn(&table("UNIQUE", "")).unwrap();
        let e = evaluate_decision_graph(&defs, "nope", &Context::new()).unwrap_err();
        assert_eq!(e.to_string(), "Decision 'nope' not found");
    }
}
