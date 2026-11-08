//! `lintDiagram` (`@bpmnkit/core`'s `lint.ts`): the static analysis as plain, forwardable
//! data, with engine rules dropped on a model that names no execution platform.

use crate::bpmnlint::{
    apply_bpmnlint_config, ApplyBpmnlintOptions, ResolvedBpmnlintConfig, UnsupportedBpmnlintRule,
};
use crate::compat_config::{apply_camunda_compat_config, split_camunda_compat_config};
use crate::optimize::{optimize, OptimizeOptions};
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::BpmnDefinitions;
use bpmnkit_compat::compat::{dedupe_camunda_compat, is_camunda_compat_finding};
use serde::Serialize;
use std::collections::HashMap;

/// The engine a model says it targets, read from `modeler:executionPlatform`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum ExecutionPlatform {
    CamundaCloud,
    CamundaPlatform,
    None,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct DetectedPlatform {
    pub id: ExecutionPlatform,
    /// The raw attribute value, when there was one.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
}

/// Categories whose findings only mean something against a Camunda 8 engine.
const ENGINE_CATEGORIES: [Category; 3] = [Category::Deploy, Category::Connector, Category::Agentic];

/// A finding as plain data. JSON matches TS's `LintDiagnostic`.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LintDiagnostic {
    pub id: String,
    pub severity: Severity,
    pub category: Category,
    pub message: String,
    pub suggestion: String,
    pub process_id: String,
    pub element_ids: Vec<String>,
    /// The diagram plane the elements are drawn on, when they are drawn at all.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plane: Option<String>,
    /// Whether the live report carries an automatic fix for this finding.
    pub fixable: bool,
    /// The bpmnlint rule it was reported under, when a `.bpmnlintrc` governs it.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bpmnlint_rule: Option<String>,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize)]
pub struct SeverityCounts {
    pub error: usize,
    pub warning: usize,
    pub info: usize,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LintReport {
    pub diagnostics: Vec<LintDiagnostic>,
    /// The engine the model claims, and therefore which rules were applied.
    pub platform: DetectedPlatform,
    /// Categories that were run — engine rules are dropped on a neutral model.
    pub categories: Vec<Category>,
    pub counts: SeverityCounts,
    pub total: usize,
    /// Present when a `.bpmnlintrc` was applied: what BPMN Kit has no equivalent for.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bpmnlint_unsupported: Option<Vec<UnsupportedBpmnlintRule>>,
}

/// `LintOptions`: the optimizer's options plus the lint-only ones.
#[derive(Default)]
pub struct LintOptions {
    pub optimize: OptimizeOptions,
    /// Run engine rules even when the model names no platform.
    pub force_engine_rules: bool,
    /// A resolved `.bpmnlintrc` to apply.
    pub bpmnlint: Option<ResolvedBpmnlintConfig>,
    /// Real bpmnlint already reported the configured rules; drop BPMN Kit's equivalents.
    pub bpmnlint_delegated: bool,
}

/// Reads the execution platform a model declares.
pub fn detect_execution_platform(definitions: &BpmnDefinitions) -> DetectedPlatform {
    let attrs = &definitions.unknown_attributes;
    let name = attrs.get("modeler:executionPlatform");
    let version = attrs.get("modeler:executionPlatformVersion").cloned();
    let Some(name) = name.filter(|n| !n.is_empty()) else {
        return DetectedPlatform {
            id: ExecutionPlatform::None,
            name: None,
            version: None,
        };
    };
    let lower = name.to_lowercase();
    let id = if lower.contains("cloud") {
        ExecutionPlatform::CamundaCloud
    } else if lower.contains("camunda") {
        ExecutionPlatform::CamundaPlatform
    } else {
        ExecutionPlatform::None
    };
    DetectedPlatform {
        id,
        name: Some(name.clone()),
        version,
    }
}

/// Maps every element that carries diagram interchange to the plane drawing it.
fn plane_index(definitions: &BpmnDefinitions) -> HashMap<&str, &str> {
    let mut index = HashMap::new();
    for d in &definitions.diagrams {
        let plane = d.plane.bpmn_element.as_str();
        for s in &d.plane.shapes {
            index.insert(s.bpmn_element.as_str(), plane);
        }
        for e in &d.plane.edges {
            index.insert(e.bpmn_element.as_str(), plane);
        }
    }
    index
}

/// Runs the static analysis and returns it as plain data. On a model that names no
/// execution platform the engine categories (`deploy`, `connector`, `agentic`) are dropped,
/// unless `force_engine_rules`; a `.bpmnlintrc` (and its camunda-compat part) is applied when
/// given.
pub fn lint_diagram(definitions: &BpmnDefinitions, options: LintOptions) -> LintReport {
    let platform = detect_execution_platform(definitions);
    let engine_rules = options.force_engine_rules || platform.id != ExecutionPlatform::None;

    let LintOptions {
        optimize: mut optimize_options,
        force_engine_rules,
        bpmnlint,
        bpmnlint_delegated,
    } = options;
    // A `.bpmnlintrc` extending `plugin:camunda-compat/camunda-cloud-X-Y`, or an explicit
    // `camunda_version`, pins the version the `compat/…` findings check.
    let split = bpmnlint.as_ref().map(split_camunda_compat_config);
    let pinned = split
        .as_ref()
        .and_then(|s| s.compat.as_ref())
        .and_then(|c| c.version)
        .map(|v| v.as_str().to_owned())
        .or_else(|| optimize_options.camunda_version.clone());
    optimize_options.camunda_version = pinned.clone();
    let report = optimize(definitions, &optimize_options);

    let requested = optimize_options.categories.clone();
    let engine_filtered: Vec<Finding> = if engine_rules {
        report.findings
    } else {
        report
            .findings
            .into_iter()
            .filter(|f| {
                !ENGINE_CATEGORIES.contains(&f.data.category)
                    || (is_camunda_compat_finding(&f.data.id) && pinned.is_some())
            })
            .collect()
    };

    let (findings, unsupported) = match split {
        None => (engine_filtered, None),
        Some(split) => {
            let (findings, compat_unsupported) = match &split.compat {
                None => (engine_filtered, vec![]),
                Some(compat) => {
                    let applied =
                        apply_camunda_compat_config(engine_filtered, compat, bpmnlint_delegated);
                    (applied.findings, applied.unsupported)
                }
            };
            let applied = apply_bpmnlint_config(
                definitions,
                findings,
                &split.rest,
                &ApplyBpmnlintOptions {
                    delegated: bpmnlint_delegated,
                    categories: requested.clone(),
                },
            );
            // bpmnlint's own rules run last, so a compatibility finding one of them now
            // reports on the same element (`link-event`) is dropped here.
            let mut unsupported = applied.unsupported;
            unsupported.extend(compat_unsupported);
            (dedupe_camunda_compat(applied.findings), Some(unsupported))
        }
    };

    let planes = plane_index(definitions);
    let diagnostics: Vec<LintDiagnostic> = findings
        .into_iter()
        .map(|f| {
            let fixable = f.fixable();
            let d = f.data;
            let plane = d
                .element_ids
                .iter()
                .find_map(|id| planes.get(id.as_str()))
                .map(|p| (*p).to_owned());
            LintDiagnostic {
                id: d.id,
                severity: d.severity,
                category: d.category,
                message: d.message,
                suggestion: d.suggestion,
                process_id: d.process_id,
                element_ids: d.element_ids,
                plane,
                fixable,
                bpmnlint_rule: d.bpmnlint_rule,
            }
        })
        .collect();

    let mut counts = SeverityCounts::default();
    for d in &diagnostics {
        match d.severity {
            Severity::Error => counts.error += 1,
            Severity::Warning => counts.warning += 1,
            Severity::Info => counts.info += 1,
        }
    }

    LintReport {
        total: diagnostics.len(),
        diagnostics,
        platform,
        categories: lint_categories(definitions, requested.as_deref(), force_engine_rules),
        counts,
        bpmnlint_unsupported: unsupported,
    }
}

/// The categories that should run against a model: `categories` (default: all, in run
/// order), without the engine layer on a model that names no platform unless
/// `force_engine_rules`.
pub fn lint_categories(
    definitions: &BpmnDefinitions,
    categories: Option<&[Category]>,
    force_engine_rules: bool,
) -> Vec<Category> {
    let base = categories.unwrap_or(&Category::ALL);
    let engine_rules =
        force_engine_rules || detect_execution_platform(definitions).id != ExecutionPlatform::None;
    base.iter()
        .copied()
        .filter(|c| engine_rules || !ENGINE_CATEGORIES.contains(c))
        .collect()
}
