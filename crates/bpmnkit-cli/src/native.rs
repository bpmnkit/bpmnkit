//! Native `lint`, `layout`, `diff`, `render` and `convert`, on the same Rust crates the library
//! facade ships. Output mirrors the legacy Node CLI where it can (`→`/`✓` prefixes, finding
//! lines); `main` falls back to the legacy CLI for flags only it understands.

use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::path::{Path, PathBuf};

use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn, BpmnDefinitions};
use bpmnkit_compat::camunda7::migrate::{
    analyze_camunda7, convert_camunda7, Camunda7ConvertOptions,
};
use bpmnkit_diff::{diff_bpmn, BpmnDiff, ChangeKind};
use bpmnkit_layout::{apply_auto_layout, LayoutEngine};
use bpmnkit_lint::{
    lint_categories, lint_diagram, optimize::UserTaskForms, Category, LintOptions, Severity,
};
use bpmnkit_render::{bpmn_to_png, bpmn_to_svg, PngOptions, RenderOptions, Theme};
use clap::{Args, ValueEnum};

#[derive(Args)]
pub struct ConnectorGenArgs {
    /// OpenAPI 3 or Swagger 2 spec (YAML or JSON)
    pub spec: PathBuf,
    /// Output directory
    #[arg(short, long, default_value = "./connector-templates")]
    pub out: PathBuf,
    /// Override the spec's base URL
    #[arg(long)]
    pub base_url: Option<String>,
    /// Reverse-DNS template id prefix
    #[arg(long, default_value = "io.generated")]
    pub id_prefix: String,
    /// Regex on operationId/summary/path (case-insensitive)
    #[arg(long)]
    pub filter: Option<String>,
    /// Decompose top-level body properties into fields
    #[arg(long)]
    pub expand_body: bool,
    /// noAuth, apiKey, basic, bearer, oauth-client-credentials-flow
    #[arg(long)]
    pub auth: Option<String>,
    /// `one-per-op` or `array` (one file)
    #[arg(long, value_parser = ["one-per-op", "array"], default_value = "one-per-op")]
    pub format: String,
    /// Print the templates instead of writing files
    #[arg(long)]
    pub dry_run: bool,
    /// Also write the API index (ApiService JSON) for `worker classify|gen --openapi`
    #[arg(long, value_name = "FILE")]
    pub api_index: Option<PathBuf>,
}

#[derive(Args)]
pub struct ConnectorBindArgs {
    /// The .bpmn file
    pub file: PathBuf,
    /// Id of the task or event to bind
    pub element_id: String,
    /// Catalog template id, or a path to a template .json
    #[arg(short, long)]
    pub template: String,
    /// Property values, `key=value` (repeatable); `name` sets the element name
    #[arg(long = "set", value_name = "KEY=VALUE")]
    pub set: Vec<String>,
    /// Write here instead of stdout
    #[arg(short, long)]
    pub out: Option<PathBuf>,
    /// Rewrite the input file
    #[arg(long, conflicts_with = "out")]
    pub in_place: bool,
    /// Skip the Zeebe deployability check of the bound element
    #[arg(long)]
    pub no_validate: bool,
    /// Leave out properties that only carry the template default
    #[arg(long)]
    pub omit_defaults: bool,
}

#[derive(Clone, Copy, ValueEnum, PartialEq, Eq)]
pub enum Format {
    Text,
    Json,
}

#[derive(Args)]
pub struct LintArgs {
    /// The .bpmn file
    pub file: PathBuf,
    /// Output format
    #[arg(long, value_enum, default_value = "text")]
    pub format: Format,
    /// Comma-separated categories to run (default: all)
    #[arg(long)]
    pub categories: Option<String>,
    /// `deploy` runs every category and shows errors only; `sketch` skips Camunda 8 deployability rules
    #[arg(long, value_parser = ["deploy", "sketch"])]
    pub profile: Option<String>,
    /// `require` or `off` (default: off, `require` with --profile deploy)
    #[arg(long, value_parser = ["require", "off"])]
    pub user_task_forms: Option<String>,
    /// Ignore the project's .bpmnlintrc (the native linter never reads one)
    #[arg(long)]
    pub no_bpmnlintrc: bool,
}

#[derive(Args)]
pub struct LayoutArgs {
    /// The .bpmn file
    pub file: PathBuf,
    /// Layout engine
    #[arg(long, value_parser = ["semantic", "grid", "layered"], default_value = "semantic")]
    pub engine: String,
    /// Write here instead of stdout
    #[arg(short, long)]
    pub out: Option<PathBuf>,
    /// Rewrite the input file
    #[arg(long, conflicts_with = "out")]
    pub in_place: bool,
}

#[derive(Args)]
pub struct DiffArgs {
    /// The earlier .bpmn file
    pub before: PathBuf,
    /// The later .bpmn file
    pub after: PathBuf,
    /// Output format
    #[arg(long, value_enum, default_value = "text")]
    pub format: Format,
    /// Exit non-zero when the diagrams differ
    #[arg(long)]
    pub exit_code: bool,
}

#[derive(Args)]
pub struct RenderArgs {
    /// The .bpmn file
    pub file: PathBuf,
    /// Write here instead of stdout (SVG); a `.png` extension renders a PNG
    #[arg(short, long)]
    pub out: Option<PathBuf>,
    /// `light` or `dark`
    #[arg(long, value_parser = ["light", "dark"], default_value = "light")]
    pub theme: String,
}

#[derive(Args)]
pub struct ConvertArgs {
    /// Camunda 7 .bpmn files
    #[arg(required = true)]
    pub files: Vec<PathBuf>,
    /// Output directory (default: next to each input)
    #[arg(long)]
    pub out: Option<PathBuf>,
    /// Report only; write nothing and fail on manual or unsupported findings
    #[arg(long)]
    pub check: bool,
    /// Overwrite converted files that already exist
    #[arg(long)]
    pub force: bool,
    /// Fill the placeholders a deployable model needs
    #[arg(long)]
    pub placeholders: bool,
    /// Skip the Camunda 8 deployability gate
    #[arg(long)]
    pub no_validate: bool,
    /// Output format
    #[arg(long, value_enum, default_value = "text")]
    pub format: Format,
}

fn load(path: &Path) -> Result<(String, BpmnDefinitions), String> {
    let xml = std::fs::read_to_string(path)
        .map_err(|e| format!("cannot read {}: {e}", path.display()))?;
    let defs = parse_bpmn(&xml).map_err(|e| format!("{}: {e}", path.display()))?;
    Ok((xml, defs))
}

/// Whether a `.bpmnlintrc` governs `file`: the legacy CLI applies it, the native linter cannot.
pub fn has_bpmnlintrc(file: &Path) -> bool {
    const NAMES: [&str; 3] = [".bpmnlintrc", ".bpmnlintrc.json", ".bpmnlintrc.js"];
    let start = file.parent().filter(|p| !p.as_os_str().is_empty());
    let start = match start {
        Some(p) => p.to_path_buf(),
        None => std::env::current_dir().unwrap_or_default(),
    };
    let start = start.canonicalize().unwrap_or(start);
    start
        .ancestors()
        .any(|d| NAMES.iter().any(|n| d.join(n).is_file()))
}

fn write_out(out: &Option<PathBuf>, bytes: &[u8]) -> Result<(), String> {
    use std::io::Write;
    match out {
        Some(p) => {
            if let Some(dir) = p.parent().filter(|d| !d.as_os_str().is_empty()) {
                std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
            }
            std::fs::write(p, bytes).map_err(|e| format!("cannot write {}: {e}", p.display()))
        }
        None => std::io::stdout()
            .write_all(bytes)
            .map_err(|e| e.to_string()),
    }
}

fn json_line<T: serde::Serialize>(v: &T) -> String {
    serde_json::to_string_pretty(v).unwrap_or_default()
}

fn out(line: &str) {
    println!("{line}");
}

/// The CLI's error channel: message on stderr, exit 1 (the legacy CLI's behaviour).
fn fail(msg: &str) -> i32 {
    eprintln!("Error: {msg}");
    1
}

// ── lint ─────────────────────────────────────────────────────────────────────

/// What the sketch profile leaves out: rules that only mean something to a Camunda 8 engine.
const SKETCH_SKIPPED: [Category; 3] = [Category::Deploy, Category::Connector, Category::Agentic];

fn symbol(s: Severity) -> &'static str {
    match s {
        Severity::Error => "✖",
        Severity::Warning => "⚠",
        Severity::Info => "ℹ",
    }
}

/// The key that switches a finding off in `.bpmnlintrc` (TS `bpmnlintrcKey`).
fn bpmnlintrc_key(id: &str) -> Option<String> {
    if let Some(rest) = id.strip_prefix("bpmnlint/") {
        return Some(rest.to_owned());
    }
    if let Some(rest) = id.strip_prefix("compat/") {
        return Some(format!("camunda-compat/{rest}"));
    }
    if let Some(rule) = bpmnkit_lint::bpmnlint::bpmnlint_rule_for_finding(id) {
        return Some(rule.to_owned());
    }
    // Findings the camunda-compat plugin reports under another name.
    bpmnkit_spec::compat::RULES
        .iter()
        .find(|r| r.equivalents.contains(&id))
        .map(|r| format!("camunda-compat/{}", r.name))
}

fn parse_categories(list: &str) -> Result<Vec<Category>, String> {
    list.split(',')
        .map(str::trim)
        .map(|c| {
            serde_json::from_value(serde_json::Value::String(c.to_owned())).map_err(|_| {
                let all: Vec<String> = Category::ALL
                    .iter()
                    .map(|c| json_line(c).trim_matches('"').to_owned())
                    .collect();
                format!("unknown category \"{c}\" (known: {})", all.join(", "))
            })
        })
        .collect()
}

pub fn lint(a: LintArgs) -> i32 {
    let (_, defs) = match load(&a.file) {
        Ok(v) => v,
        Err(e) => return fail(&e),
    };
    let deploy = a.profile.as_deref() == Some("deploy");
    let sketch = a.profile.as_deref() == Some("sketch");
    let forms = match a.user_task_forms.as_deref() {
        Some("require") => UserTaskForms::Require,
        Some(_) => UserTaskForms::Off,
        None if deploy => UserTaskForms::Require,
        None => UserTaskForms::Off,
    };
    let requested = match a.categories.as_deref().filter(|c| !c.is_empty()) {
        Some(list) => match parse_categories(list) {
            Ok(c) => Some(c),
            Err(e) => return fail(&e),
        },
        None => None,
    };
    let mut categories = lint_categories(&defs, requested.as_deref(), deploy);
    if sketch {
        categories.retain(|c| !SKETCH_SKIPPED.contains(c));
    }
    let mut options = LintOptions {
        force_engine_rules: deploy,
        ..LintOptions::default()
    };
    options.optimize.categories = Some(categories);
    options.optimize.user_task_forms = forms;
    let report = lint_diagram(&defs, options);
    let mut findings = report.diagnostics;
    if deploy {
        findings.retain(|f| f.severity == Severity::Error);
    }

    if a.format == Format::Json {
        // Like the legacy CLI, JSON output is the findings and the exit code stays 0.
        out(&json_line(&findings));
        return 0;
    }
    let no_platform = report.platform.id == bpmnkit_lint::lint::ExecutionPlatform::None && !deploy;
    let hint = "No execution platform on this model — deployability rules were skipped. Use --profile deploy to run them anyway.";
    if findings.is_empty() {
        out("✓ No issues found.");
        if no_platform {
            out(&format!("→ {hint}"));
        }
        return 0;
    }
    for f in &findings {
        let ids = if f.element_ids.is_empty() {
            String::new()
        } else {
            format!(" [{}]", f.element_ids.join(", "))
        };
        let cat = json_line(&f.category);
        let cat = cat.trim_matches('"');
        let key = f.bpmnlint_rule.clone().or_else(|| bpmnlintrc_key(&f.id));
        let rule = key.map(|k| format!(" ({k})")).unwrap_or_default();
        let id = if cat == "bpmnlint" {
            String::new()
        } else {
            format!(" [{}]", f.id)
        };
        out(&format!(
            "→ {} [{cat}]{ids} {}{rule}{id}",
            symbol(f.severity),
            f.message
        ));
    }
    let count = |s: Severity| findings.iter().filter(|f| f.severity == s).count();
    let (e, w, i) = (
        count(Severity::Error),
        count(Severity::Warning),
        count(Severity::Info),
    );
    let pl = |n: usize| if n == 1 { "" } else { "s" };
    out(&format!(
        "→ \n{} finding{}: {e} error{}, {w} warning{}, {i} info",
        findings.len(),
        pl(findings.len()),
        pl(e),
        pl(w)
    ));
    if no_platform {
        out(&format!("→ {hint}"));
    }
    if e > 0 {
        return fail(&format!("Lint failed with {e} error{}", pl(e)));
    }
    0
}

// ── layout ───────────────────────────────────────────────────────────────────

pub fn layout(a: LayoutArgs) -> i32 {
    let (_, defs) = match load(&a.file) {
        Ok(v) => v,
        Err(e) => return fail(&e),
    };
    let engine = match a.engine.as_str() {
        "grid" => LayoutEngine::Grid,
        "layered" => LayoutEngine::Layered,
        _ => LayoutEngine::Semantic,
    };
    let xml = serialize_bpmn(&apply_auto_layout(&defs, engine, None));
    let target = if a.in_place {
        Some(a.file.clone())
    } else {
        a.out.clone()
    };
    match write_out(&target, xml.as_bytes()) {
        Ok(()) => 0,
        Err(e) => fail(&e),
    }
}

// ── diff ─────────────────────────────────────────────────────────────────────

/// Id → name for every element a diagram can draw, so a reviewer reads names, not ids.
fn names(diff: &BpmnDiff) -> BTreeMap<&str, &str> {
    let mut m = BTreeMap::new();
    for c in &diff.changes {
        if let Some(n) = c.name_after.as_deref().or(c.name_before.as_deref()) {
            if !n.is_empty() {
                m.insert(c.id.as_str(), n);
            }
        }
    }
    m
}

pub fn diff(a: DiffArgs) -> i32 {
    let ((_, before), (_, after)) = match (load(&a.before), load(&a.after)) {
        (Ok(b), Ok(c)) => (b, c),
        (Err(e), _) | (_, Err(e)) => return fail(&e),
    };
    let d = diff_bpmn(&before, &after);
    let s = &d.summary;
    let kinds = [
        (ChangeKind::Added, "+", "added", s.added),
        (ChangeKind::Removed, "−", "removed", s.removed),
        (ChangeKind::Changed, "~", "changed", s.changed),
        (ChangeKind::Moved, "⇄", "moved", s.moved),
    ];
    let summary = {
        let parts: Vec<String> = kinds
            .iter()
            .filter(|k| k.3 > 0)
            .map(|k| format!("{} {}", k.3, k.2))
            .collect();
        format!(
            "{} difference{}: {}",
            s.total,
            if s.total == 1 { "" } else { "s" },
            parts.join(", ")
        )
    };
    let differs = s.total > 0;
    if a.format == Format::Json {
        out(&json_line(&d));
        if a.exit_code && differs {
            return fail(&summary);
        }
        return 0;
    }
    if !differs {
        out("✓ No differences.");
        return 0;
    }
    let names = names(&d);
    let mut body = String::new();
    for (kind, sym, _, _) in &kinds {
        for c in d.changes.iter().filter(|c| c.kind == *kind) {
            let _ = match names.get(c.id.as_str()) {
                Some(n) => writeln!(body, "  {sym} {n} ({})", c.id),
                None => writeln!(body, "  {sym} {}", c.id),
            };
        }
    }
    println!("{body}\n{summary}");
    if a.exit_code {
        return fail(&summary);
    }
    0
}

// ── render ───────────────────────────────────────────────────────────────────

pub fn render(a: RenderArgs) -> i32 {
    let (_, defs) = match load(&a.file) {
        Ok(v) => v,
        Err(e) => return fail(&e),
    };
    let theme = if a.theme == "dark" {
        Theme::Dark
    } else {
        Theme::Light
    };
    // Models without diagram interchange (generated ones) still get a picture.
    let mut opts = RenderOptions::new().theme(theme);
    opts.auto_layout = defs.diagrams.is_empty();
    let png = a
        .out
        .as_ref()
        .and_then(|p| p.extension())
        .is_some_and(|e| e.eq_ignore_ascii_case("png"));
    let bytes = if png {
        bpmn_to_png(&defs, &opts, &PngOptions::new().dpi_scale(2.0)).map_err(|e| e.to_string())
    } else {
        bpmn_to_svg(&defs, &opts)
            .map(|s| s.markup.into_bytes())
            .map_err(|e| e.to_string())
    };
    match bytes.and_then(|b| write_out(&a.out, &b)) {
        Ok(()) => 0,
        Err(e) => fail(&e),
    }
}

// ── convert ──────────────────────────────────────────────────────────────────

/// `order.bpmn` → `order.c8.bpmn`, in `out` when given.
fn converted_path(file: &Path, out: &Option<PathBuf>) -> PathBuf {
    let stem = file
        .file_stem()
        .map_or_else(|| "model".into(), |s| s.to_string_lossy().into_owned());
    let dir = out
        .clone()
        .or_else(|| file.parent().map(Path::to_path_buf))
        .unwrap_or_default();
    dir.join(format!("{stem}.c8.bpmn"))
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct FileResult {
    file: String,
    output: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
    #[serde(skip_serializing_if = "std::ops::Not::not")]
    refused: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    counts: Option<serde_json::Value>,
    findings: Vec<serde_json::Value>,
}

pub fn convert(a: ConvertArgs) -> i32 {
    let mut results = Vec::new();
    for file in &a.files {
        results.push(convert_one(&a, file));
    }
    if a.format == Format::Json {
        out(&json_line(&results));
    } else {
        for r in &results {
            out(&text_result(r, a.check));
        }
    }
    let plural = |n: usize| if n == 1 { "" } else { "s" };
    let failed = results
        .iter()
        .filter(|r| r.error.is_some() && !r.refused)
        .count();
    let refused = results.iter().filter(|r| r.refused).count();
    if failed > 0 {
        return fail(&format!(
            "{failed} of {} file{} could not be migrated",
            results.len(),
            plural(results.len())
        ));
    }
    if refused > 0 {
        return fail(&format!(
            "{refused} of {} file{} would not deploy on Camunda 8 — pass --placeholders or --no-validate",
            results.len(),
            plural(results.len())
        ));
    }
    if a.check {
        let open: u64 = results
            .iter()
            .filter_map(|r| r.counts.as_ref())
            .map(|c| c["manual"].as_u64().unwrap_or(0) + c["unsupported"].as_u64().unwrap_or(0))
            .sum();
        if open > 0 {
            return fail(&format!(
                "Migration check failed: {open} manual or unsupported finding{}",
                plural(open as usize)
            ));
        }
    }
    0
}

fn convert_one(a: &ConvertArgs, file: &Path) -> FileResult {
    let name = file.display().to_string();
    let mut result = FileResult {
        file: name,
        output: None,
        error: None,
        refused: false,
        counts: None,
        findings: vec![],
    };
    let defs = match load(file) {
        Ok((_, d)) => d,
        Err(e) => {
            result.error = Some(e);
            return result;
        }
    };
    let options = Camunda7ConvertOptions {
        validate: !a.no_validate,
        placeholders: a.placeholders,
        ..Camunda7ConvertOptions::default()
    };
    match convert_camunda7(&defs, &options) {
        Ok(c) => {
            result.counts = serde_json::to_value(c.report.counts).ok();
            result.findings = c
                .report
                .findings
                .iter()
                .filter_map(|f| serde_json::to_value(f).ok())
                .collect();
            if a.check {
                return result;
            }
            let output = converted_path(file, &a.out);
            if output.exists() && !a.force {
                result.error = Some(format!(
                    "{} already exists — pass --force to overwrite it",
                    output.display()
                ));
                return result;
            }
            match write_out(
                &Some(output.clone()),
                serialize_bpmn(&c.definitions).as_bytes(),
            ) {
                Ok(()) => result.output = Some(output.display().to_string()),
                Err(e) => result.error = Some(e),
            }
        }
        Err(e) => {
            result.error = Some(e.message.clone());
            if e.deployability.is_some() {
                // The report says what is left to do; the error says why Zeebe would refuse it.
                result.refused = true;
                if let Ok(r) = analyze_camunda7(&defs) {
                    result.counts = serde_json::to_value(r.counts).ok();
                    result.findings = r
                        .findings
                        .iter()
                        .filter_map(|f| serde_json::to_value(f).ok())
                        .collect();
                }
            }
        }
    }
    result
}

fn text_result(r: &FileResult, check: bool) -> String {
    let mut s = String::new();
    let _ = writeln!(s, "{}", r.file);
    if let Some(e) = &r.error {
        let _ = writeln!(s, "  ✖ {e}");
    } else if let Some(o) = &r.output {
        let _ = writeln!(s, "  ✓ wrote {o}");
    } else if check {
        let _ = writeln!(s, "  → checked (nothing written)");
    }
    if let Some(c) = &r.counts {
        let n = |k: &str| c[k].as_u64().unwrap_or(0);
        let _ = writeln!(
            s,
            "  {} convertible, {} manual, {} unsupported",
            n("convertible"),
            n("manual"),
            n("unsupported")
        );
    }
    for f in &r.findings {
        let g = |k: &str| f[k].as_str().unwrap_or_default();
        let _ = writeln!(
            s,
            "  - [{}] {} {}: {}",
            g("severity"),
            g("elementId"),
            g("construct"),
            g("message")
        );
    }
    s.trim_end().to_owned()
}

// ── connector ────────────────────────────────────────────────────────────────

pub fn connector_gen(a: ConnectorGenArgs) -> i32 {
    use bpmnkit_connectors::{
        generate, write_templates, AuthHint, Format as Fmt, GeneratorOptions,
    };
    let auth = match a.auth.as_deref().map(|v| (v, AuthHint::parse(v))) {
        Some((v, None)) => {
            return fail(&format!(
                "Unknown --auth value \"{v}\". Valid: noAuth, apiKey, basic, bearer, oauth-client-credentials-flow"
            ))
        }
        Some((_, h)) => h,
        None => None,
    };
    let text = match std::fs::read_to_string(&a.spec) {
        Ok(t) => t,
        Err(e) => return fail(&format!("cannot read {}: {e}", a.spec.display())),
    };
    let mut opts = GeneratorOptions::new(a.id_prefix.clone());
    opts.base_url = a.base_url.clone();
    opts.expand_body = a.expand_body;
    opts.filter = a.filter.clone();
    opts.default_auth_type = auth;
    let templates = match generate(&text, &opts) {
        Ok(t) => t,
        Err(e) => return fail(&e.to_string()),
    };
    if let Some(path) = &a.api_index {
        let id = a
            .spec
            .file_stem()
            .map_or_else(|| "api".into(), |s| s.to_string_lossy().into_owned());
        let index = match bpmnkit_connectors::api_service(
            &text,
            &id,
            &id,
            auth.unwrap_or(AuthHint::NoAuth),
        ) {
            Ok(i) => i,
            Err(e) => return fail(&e.to_string()),
        };
        if let Err(e) = std::fs::write(path, format!("{}\n", json_line(&index))) {
            return fail(&format!("cannot write {}: {e}", path.display()));
        }
        out(&format!("✓ API index → {}", path.display()));
    }
    if a.dry_run {
        out(&json_line(&templates));
        out(&format!("→ Would generate {} template(s)", templates.len()));
        return 0;
    }
    let format = if a.format == "array" {
        Fmt::Array
    } else {
        Fmt::OnePerOp
    };
    match write_templates(&templates, &a.out, format) {
        Ok(files) => {
            out(&format!(
                "✓ Generated {} template(s) → {}",
                files.len(),
                a.out.display()
            ));
            for f in files {
                out(&format!("→   {}", f.display()));
            }
            0
        }
        Err(e) => fail(&e.to_string()),
    }
}

pub fn connector_bind(a: ConnectorBindArgs) -> i32 {
    use bpmnkit_connectors::{bind_xml, get_template, ApplyToModelOptions, ElementTemplate};
    let xml = match std::fs::read_to_string(&a.file) {
        Ok(x) => x,
        Err(e) => return fail(&format!("cannot read {}: {e}", a.file.display())),
    };
    let template = match get_template(&a.template) {
        Some(t) => t.clone(),
        None => match std::fs::read_to_string(&a.template)
            .map_err(|e| e.to_string())
            .and_then(|t| ElementTemplate::from_json(&t).map_err(|e| e.to_string()))
        {
            Ok(t) => t,
            Err(e) => {
                return fail(&format!(
                    "\"{}\" is neither a bundled template id nor a template file ({e})",
                    a.template
                ))
            }
        },
    };
    let mut values = indexmap::IndexMap::new();
    for kv in &a.set {
        let Some((k, v)) = kv.split_once('=') else {
            return fail(&format!("--set expects key=value, got \"{kv}\""));
        };
        values.insert(k.to_owned(), v.to_owned());
    }
    let options = ApplyToModelOptions {
        validate: !a.no_validate,
        omit_defaults: a.omit_defaults,
        ..ApplyToModelOptions::default()
    };
    let (bound, problems) = match bind_xml(&xml, &a.element_id, &template, &values, &options) {
        Ok(r) => r,
        Err(e) => return fail(&e.to_string()),
    };
    for p in &problems {
        eprintln!("warning: {}", p.message);
    }
    // A refused apply (unknown element, template not applicable) returns the model unchanged:
    // writing it back would look like success.
    if problems.iter().any(|p| p.kind.is_none() && p.key.is_none()) && bound_unchanged(&xml, &bound)
    {
        return fail("the template was not applied");
    }
    let target = if a.in_place {
        Some(a.file.clone())
    } else {
        a.out.clone()
    };
    match write_out(&target, bound.as_bytes()) {
        Ok(()) => 0,
        Err(e) => fail(&e),
    }
}

fn bound_unchanged(before: &str, after: &str) -> bool {
    match (parse_bpmn(before), parse_bpmn(after)) {
        (Ok(a), Ok(b)) => serialize_bpmn(&a) == serialize_bpmn(&b),
        _ => false,
    }
}
