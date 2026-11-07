//! `optimize/agentic.ts`: the Camunda 8 AI Agent Sub-process pattern.

use super::utils::*;
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::{BpmnFlowElement, BpmnProcess};

/// `AI_AGENT_JOB_WORKER_TASK_TYPE` in `bpmn/agentic.ts`.
pub const AI_AGENT_JOB_WORKER_TASK_TYPE: &str = "io.camunda.agenticai:aiagent-job-worker:1";

/// The first arguments `/fromAi\(\s*([^,)]+)/g` captures, untrimmed.
fn from_ai_first_args(source: &str) -> Vec<&str> {
    const CALL: &str = "fromAi(";
    let mut out = vec![];
    let mut at = 0;
    while let Some(found) = source[at..].find(CALL) {
        let start = at + found + CALL.len();
        let len = source[start..]
            .find([',', ')'])
            .unwrap_or(source.len() - start);
        if len == 0 {
            at = at + found + 1;
            continue;
        }
        out.push(&source[start..start + len]);
        at = start + len;
    }
    out
}

pub fn analyze_agentic(p: &BpmnProcess) -> Vec<Finding> {
    let mut findings = vec![];
    let process_id = p.id.as_str();
    let mut push = |id: &str, severity, message: String, suggestion: &str, el: &str| {
        findings.push(finding(
            id,
            Category::Agentic,
            severity,
            message,
            suggestion,
            process_id,
            vec![el.to_owned()],
        ));
    };

    for el in &p.contents.flow_elements {
        let BpmnFlowElement::AdHocSubProcess(a) = el else {
            continue;
        };
        let ext = &a.base.extension_elements;
        if read_zeebe_task_type(ext).as_deref() != Some(AI_AGENT_JOB_WORKER_TASK_TYPE) {
            continue;
        }
        let agent = label(el);
        let id = a.base.id.as_str();

        let output_collection = ext
            .iter()
            .find(|e| e.name == "zeebe:adHoc")
            .and_then(|e| e.attr("outputCollection"));
        if !truthy(output_collection) {
            push(
                "agentic/no-output-collection",
                Severity::Warning,
                format!(
                    "AI Agent \"{agent}\" has no outputCollection — tool call results won't be aggregated."
                ),
                "Set zeebe:adHoc outputCollection (e.g. \"toolCallResults\").",
                id,
            );
        }

        let has_limit = read_zeebe_io_mapping(ext).is_some_and(|io| {
            io.inputs
                .iter()
                .any(|i| i.target == "data.limits.maxModelCalls")
        });
        if !has_limit {
            push(
                "agentic/limits-missing",
                Severity::Info,
                format!("AI Agent \"{agent}\" has no data.limits.maxModelCalls binding."),
                "Set a model-call limit as a safety net against infinite tool loops.",
                id,
            );
        }

        for tool in &a.contents.flow_elements {
            let tb = tool.base();
            let tool_label = label(tool);
            if !tb.incoming.is_empty() {
                push(
                    "agentic/tool-not-root",
                    Severity::Error,
                    format!(
                        "\"{tool_label}\" inside AI Agent \"{agent}\" has an incoming sequence flow — the connector only discovers tools with no incoming flow."
                    ),
                    "Remove the incoming sequence flow; tools must be root nodes.",
                    &tb.id,
                );
            }
            if tb
                .documentation
                .as_deref()
                .map(js_trim)
                .unwrap_or_default()
                .is_empty()
            {
                push(
                    "agentic/tool-no-description",
                    Severity::Warning,
                    format!(
                        "Tool \"{tool_label}\" has no documentation — the LLM sees no description for this tool."
                    ),
                    "Set <bpmn:documentation> describing what this tool does.",
                    &tb.id,
                );
            }
            let inputs = read_zeebe_io_mapping(&tb.extension_elements)
                .map(|io| io.inputs)
                .unwrap_or_default();
            for input in &inputs {
                for arg in from_ai_first_args(&input.source) {
                    let first = js_trim(arg);
                    if !first.is_empty() && !first.starts_with("toolCall.") {
                        push(
                            "agentic/fromai-bad-ref",
                            Severity::Error,
                            format!(
                                "fromAi() on \"{tool_label}\" input \"{}\" references \"{first}\", not a toolCall.* field.",
                                input.target
                            ),
                            "fromAi()'s first argument must reference \"toolCall.<param>\".",
                            &tb.id,
                        );
                    }
                }
            }
        }
    }

    findings
}

#[cfg(test)]
mod tests {
    #[test]
    fn from_ai_args_follow_the_ts_regex() {
        assert_eq!(
            super::from_ai_first_args("=fromAi(toolCall.a, \"x\") + fromAi( b ) + fromAi()"),
            vec!["toolCall.a", " b "]
        );
        assert_eq!(super::from_ai_first_args("fromAi( )"), vec![" "]);
    }
}
