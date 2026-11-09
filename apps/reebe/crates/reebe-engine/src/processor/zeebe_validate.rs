//! Zeebe's deploy-time validation, shared with BPMN Kit (`bpmnkit_compat::zeebe`),
//! so reebe rejects what a real broker rejects, with the same messages.
//!
//! Runs before anything of the deployment is stored. The resolver sees the other
//! resources of the same deployment, which a single-file check cannot: it decides
//! `bindingType="deployment"` targets and duplicate process ids across resources.
//! Zeebe's straight-through-loop check (a transformer check, not in the validator)
//! comes from `compat/no-loop`, the port of Modeler's rule for it.

use bpmnkit_compat::compat::find_straight_through_loops;
use bpmnkit_compat::zeebe::{validate_deployable_xml, ValidateOptions, ZeebeResolver};
use bpmnkit_compat::{Finding, Severity};
use std::collections::{HashMap, HashSet};

/// A resource of the deployment: its name, its XML, and whether it is a DMN.
pub(super) struct Resource<'a> {
    pub name: &'a str,
    pub xml: &'a str,
    /// Decision ids when the resource is a DMN; `None` for BPMN.
    pub decisions: Option<Vec<&'a str>>,
}

/// What the other resources of the deployment define.
struct Others {
    processes: HashSet<String>,
    decisions: HashSet<String>,
}

impl ZeebeResolver for Others {
    fn has_process(&self, id: &str) -> Option<bool> {
        Some(self.processes.contains(id))
    }
    fn has_decision(&self, id: &str) -> Option<bool> {
        Some(self.decisions.contains(id))
    }
    // Forms and other resource types are not deployable on reebe yet, so their
    // presence stays undecided rather than rejecting every reference to them.
}

fn executable_processes(xml: &str) -> Vec<String> {
    bpmnkit_bpmn::parse_bpmn(xml)
        .map(|d| {
            d.processes
                .into_iter()
                .filter(|p| p.is_executable == Some(true))
                .map(|p| p.id)
                .collect()
        })
        .unwrap_or_default()
}

/// BPMN Kit's parser requires `definitions@id`; Zeebe does not. Give an id-less
/// `definitions` one so that alone is not a rejection. Same line count, so the
/// line numbers in XML errors stay right.
fn with_definitions_id(xml: &str) -> std::borrow::Cow<'_, str> {
    let mut from = 0;
    while let Some(off) = xml[from..].find('<') {
        let start = from + off + 1;
        let rest = &xml[start..];
        let name_len = rest
            .find(|c: char| c.is_whitespace() || c == '>' || c == '/')
            .unwrap_or(rest.len());
        let name = &rest[..name_len];
        from = start;
        if name.starts_with('?') || name.starts_with('!') {
            continue;
        }
        if name.rsplit(':').next() != Some("definitions") {
            // The first element is the root; anything else is not BPMN.
            return xml.into();
        }
        let tag = &rest[name_len..rest.find('>').unwrap_or(rest.len())];
        let has_id = tag.match_indices("id").any(|(i, _)| {
            tag[..i].ends_with(char::is_whitespace) && tag[i + 2..].trim_start().starts_with('=')
        });
        if has_id {
            return xml.into();
        }
        let at = start + name_len;
        return format!("{} id=\"definitions\"{}", &xml[..at], &xml[at..]).into();
    }
    xml.into()
}

/// Zeebe's message for a straight-through loop, from `compat/no-loop`'s
/// "Loop detected: a -> b -> a".
fn loop_errors(xml: &str) -> Vec<String> {
    let Ok(defs) = bpmnkit_bpmn::parse_bpmn(xml) else {
        return Vec::new();
    };
    find_straight_through_loops(&defs, Some("8.10"))
        .into_iter()
        .filter(|f| f.data.id == "compat/no-loop")
        .map(|f| {
            let path = f.data.message.trim_start_matches("Loop detected: ");
            format!(
                "Processes are not allowed to contain a straight-through processing loop: {}",
                path.replace(" -> ", " > ")
            )
        })
        .collect()
}

fn element_block(f: &Finding) -> String {
    let element = f.data.element_ids.first().map(String::as_str).unwrap_or("");
    let message = f
        .data
        .message
        .strip_prefix("PARSE: ")
        .unwrap_or(&f.data.message);
    if element.is_empty() {
        format!("- {message}\n")
    } else {
        format!("- Element: {element}\n    - ERROR: {message}\n")
    }
}

/// `Err` with Zeebe's rejection text when any BPMN resource has an error finding.
pub(super) fn validate(resources: &[Resource<'_>]) -> Result<(), String> {
    let xmls: Vec<_> = resources
        .iter()
        .map(|r| with_definitions_id(r.xml))
        .collect();
    // Process id -> the first resource that defines it.
    let mut first: HashMap<String, usize> = HashMap::new();
    let processes: Vec<Vec<String>> = resources
        .iter()
        .zip(&xmls)
        .enumerate()
        .map(|(i, (r, xml))| {
            let ids = match r.decisions {
                Some(_) => Vec::new(),
                None => executable_processes(xml),
            };
            for id in &ids {
                first.entry(id.clone()).or_insert(i);
            }
            ids
        })
        .collect();
    let decisions: HashSet<String> = resources
        .iter()
        .filter_map(|o| o.decisions.as_ref())
        .flatten()
        .map(|d| d.to_string())
        .collect();

    let mut out = String::new();
    for (i, (r, xml)) in resources.iter().zip(&xmls).enumerate() {
        if r.decisions.is_some() {
            continue;
        }
        let others = Others {
            processes: processes
                .iter()
                .enumerate()
                .filter(|(j, _)| *j != i)
                .flat_map(|(_, p)| p.iter().cloned())
                .collect(),
            decisions: decisions.clone(),
        };
        let options = ValidateOptions {
            resolver: Some(&others),
            ..ValidateOptions::default()
        };
        let mut lines = String::new();
        for f in validate_deployable_xml(xml, &options) {
            if f.data.severity != Severity::Error {
                continue;
            }
            if f.data.id == "zeebe/duplicate-process-id" {
                // Zeebe reports a duplicate once, on the later resource, naming both.
                let pid = f.data.element_ids.first().cloned().unwrap_or_default();
                match first.get(&pid) {
                    Some(&j) if j < i => out.push_str(&format!(
                        "Duplicated process id in resources '{}' and '{}'\n",
                        resources[j].name, r.name
                    )),
                    _ => {}
                }
                continue;
            }
            lines.push_str(&element_block(&f));
        }
        if lines.is_empty() {
            for message in loop_errors(xml) {
                lines.push_str(&format!("- {message}\n"));
            }
        }
        if !lines.is_empty() {
            out.push_str(&format!("'{}': {lines}", r.name));
        }
    }
    if out.is_empty() {
        Ok(())
    } else {
        Err(format!(
            "Expected to deploy new resources, but encountered the following errors:\n{}",
            out.trim_end()
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::{validate, Resource};

    const REPO: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../../../..");

    fn read(rel: &str) -> String {
        std::fs::read_to_string(format!("{REPO}/{rel}")).unwrap_or_else(|e| panic!("{rel}: {e}"))
    }

    fn bpmn<'a>(name: &'a str, xml: &'a str) -> Resource<'a> {
        Resource {
            name,
            xml,
            decisions: None,
        }
    }

    const HEAD: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="t">"#;

    fn process(body: &str) -> String {
        format!(
            r#"{HEAD}<bpmn:process id="p" isExecutable="true"><bpmn:startEvent id="s"/>{body}</bpmn:process></bpmn:definitions>"#
        )
    }

    #[test]
    fn accepts_a_valid_process_and_a_definitions_without_id() {
        let xml = process(
            r#"<bpmn:endEvent id="e"/><bpmn:sequenceFlow id="f" sourceRef="s" targetRef="e"/>"#,
        );
        assert_eq!(validate(&[bpmn("a.bpmn", &xml)]), Ok(()));
        let no_id = xml.replace(r#" id="d""#, "");
        assert_eq!(validate(&[bpmn("a.bpmn", &no_id)]), Ok(()));
    }

    #[test]
    fn rejects_a_static_value_where_an_expression_is_needed() {
        let xml = process(
            r#"<bpmn:scriptTask id="t"><bpmn:extensionElements><zeebe:script expression="a + 1" resultVariable="r"/></bpmn:extensionElements></bpmn:scriptTask><bpmn:sequenceFlow id="f" sourceRef="s" targetRef="t"/>"#,
        );
        let err = validate(&[bpmn("a.bpmn", &xml)]).unwrap_err();
        assert!(err.starts_with(
            "Expected to deploy new resources, but encountered the following errors:\n'a.bpmn': - Element: t\n    - ERROR: Expected expression but found static value 'a + 1'."
        ), "{err}");
    }

    #[test]
    fn rejects_a_job_worker_task_without_a_type() {
        let xml = process(
            r#"<bpmn:serviceTask id="t"/><bpmn:sequenceFlow id="f" sourceRef="s" targetRef="t"/>"#,
        );
        let err = validate(&[bpmn("a.bpmn", &xml)]).unwrap_err();
        assert!(err.contains("- Element: t\n    - ERROR: Must have exactly one 'zeebe:taskDefinition' extension element"), "{err}");
    }

    #[test]
    fn rejects_xml_that_is_not_bpmn() {
        let err = validate(&[bpmn("a.bpmn", "<bpmn:definitions")]).unwrap_err();
        assert!(err.contains("'a.bpmn': - "), "{err}");
    }

    #[test]
    fn rejects_an_unconditioned_gateway_flow() {
        let xml = process(
            r#"<bpmn:exclusiveGateway id="g"/><bpmn:endEvent id="e1"/><bpmn:endEvent id="e2"/>
            <bpmn:sequenceFlow id="f0" sourceRef="s" targetRef="g"/>
            <bpmn:sequenceFlow id="f1" sourceRef="g" targetRef="e1"/>
            <bpmn:sequenceFlow id="f2" sourceRef="g" targetRef="e2"/>"#,
        );
        let err = validate(&[bpmn("a.bpmn", &xml)]).unwrap_err();
        assert!(
            err.contains("- Element: f1\n    - ERROR: Must have a condition or be default flow"),
            "{err}"
        );
    }

    /// The broker-only repros: what a single-file check cannot decide.
    #[test]
    fn decides_the_broker_only_repros() {
        let dir = "doc/deployability/broker-repro";
        let spec: serde_json::Value =
            serde_json::from_str(&read(&format!("{dir}/deployments.json"))).unwrap();
        for (name, d) in spec["deployments"].as_object().unwrap() {
            let files: Vec<(String, String)> = d["resources"]
                .as_array()
                .unwrap()
                .iter()
                .map(|f| {
                    let f = f.as_str().unwrap().to_string();
                    let xml = read(&format!("{dir}/{f}"));
                    (f, xml)
                })
                .collect();
            let resources: Vec<_> = files.iter().map(|(f, x)| bpmn(f, x)).collect();
            let got = validate(&resources);
            if d["ok"].as_bool().unwrap() {
                assert_eq!(got, Ok(()), "{name}");
            } else {
                let err = got.expect_err(name);
                for needle in d["contains"].as_array().unwrap() {
                    assert!(err.contains(needle.as_str().unwrap()), "{name}: {err}");
                }
            }
        }
    }

    #[test]
    fn a_duplicate_process_id_is_reported_once_naming_both_resources() {
        let a = read("doc/deployability/broker-repro/z183_dup_a.bpmn");
        let err = validate(&[bpmn("a.bpmn", &a), bpmn("b.bpmn", &a)]).unwrap_err();
        assert_eq!(err.matches("Duplicated process id").count(), 1, "{err}");
        assert!(
            err.contains("Duplicated process id in resources 'a.bpmn' and 'b.bpmn'"),
            "{err}"
        );
    }

    #[test]
    fn a_decision_in_the_same_deployment_satisfies_deployment_binding() {
        let xml = process(
            r#"<bpmn:businessRuleTask id="t"><bpmn:extensionElements><zeebe:calledDecision decisionId="dec" resultVariable="r" bindingType="deployment"/></bpmn:extensionElements></bpmn:businessRuleTask><bpmn:sequenceFlow id="f" sourceRef="s" targetRef="t"/>"#,
        );
        let err = validate(&[bpmn("a.bpmn", &xml)]).unwrap_err();
        assert!(err.contains("dec"), "{err}");
        let dmn = Resource {
            name: "d.dmn",
            xml: "",
            decisions: Some(vec!["dec"]),
        };
        assert_eq!(validate(&[bpmn("a.bpmn", &xml), dmn]), Ok(()));
    }

    /// Every repro Zeebe 8.9 rejects (doc/deployability/repro) is rejected here too.
    #[test]
    fn rejects_every_rejected_repro() {
        let dir = "doc/deployability/repro";
        let verdicts: serde_json::Value =
            serde_json::from_str(&read(&format!("{dir}/expected-verdicts.json"))).unwrap();
        for (file, v) in verdicts.as_object().unwrap() {
            let xml = read(&format!("{dir}/{file}"));
            let got = validate(&[bpmn(file, &xml)]);
            assert_eq!(got.is_ok(), v["ok"].as_bool().unwrap(), "{file}: {got:?}");
        }
    }
}
