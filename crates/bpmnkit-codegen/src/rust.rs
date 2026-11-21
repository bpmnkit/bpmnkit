//! Rust target: a Cargo project on `bpmnkit-worker` (plan §5). `src/gen/` is overwritten, `src/handlers/<job>.rs`,
//! `src/main.rs`, `tests/<job>.rs` and `Cargo.toml` are written once. Generated sources are parsed and
//! pretty-printed with prettyplease, so they are valid Rust and rustfmt-stable by construction.

use std::collections::BTreeSet;
use std::fmt::Write as _;

use bpmnkit_jobspec::{ir_hash, JobKind, JobSpec, Schema, WorkerProject};

use crate::java::slug;
use crate::{finish, header, select_jobs, upper_snake, EmitError, Emitter, GenFile};

/// Exact pins (plan I6) of the generated manifest. `bpmnkit-worker` follows this crate's version
/// (lockstep, plan D6).
pub struct Versions;

impl Versions {
    pub const WORKER: &'static str = env!("CARGO_PKG_VERSION");
    pub const SERDE: &'static str = "1.0.228";
    pub const SERDE_JSON: &'static str = "1.0.145";
    pub const TOKIO: &'static str = "1.48.0";
}

#[derive(Debug, Clone, Default)]
pub struct RustEmitter {
    /// Use a path dependency for `bpmnkit-worker` instead of crates.io (repo tests). Not part of
    /// the default output: an absolute path would leak the machine (I3).
    pub worker_path: Option<String>,
    /// Generate for every job type, not only those classified as worker.
    pub all: bool,
}

const KEYWORDS: &[&str] = &[
    "as", "break", "const", "continue", "crate", "else", "enum", "extern", "false", "fn", "for",
    "if", "impl", "in", "let", "loop", "match", "mod", "move", "mut", "pub", "ref", "return",
    "self", "static", "struct", "super", "trait", "true", "type", "unsafe", "use", "where",
    "while", "async", "await", "dyn", "abstract", "become", "box", "do", "final", "macro",
    "override", "priv", "typeof", "unsized", "virtual", "yield", "try", "gen",
];

/// `snake_case` identifier that is not a keyword.
fn ident(s: &str) -> String {
    let mut n = upper_snake(s).to_ascii_lowercase();
    if KEYWORDS.contains(&n.as_str()) {
        n.push('_');
    }
    n
}

fn unique(names: Vec<(String, String)>) -> Vec<(String, String)> {
    unique_except(names, &[])
}

/// Like [`unique`], with `taken` names already in use (fixed module names).
fn unique_except(names: Vec<(String, String)>, taken: &[&str]) -> Vec<(String, String)> {
    let mut seen: BTreeSet<String> = taken.iter().map(|t| (*t).to_owned()).collect();
    names
        .into_iter()
        .map(|(mut n, src)| {
            let base = n.clone();
            let mut i = 2;
            while !seen.insert(n.clone()) {
                n = format!("{base}{i}");
                i += 1;
            }
            (n, src)
        })
        .collect()
}

fn lit(s: &str) -> String {
    format!("{s:?}")
}

struct Field {
    name: String,
    var: String,
    ty: String,
    /// Declared required by the schema: no `default`, a missing variable is an input error.
    required: bool,
}

/// Rust type of a property and whether it may be absent.
fn rust_type(s: &Schema) -> String {
    match s {
        Schema::Bool => "bool".into(),
        Schema::Integer => "i64".into(),
        Schema::Number => "f64".into(),
        Schema::String | Schema::Enum { .. } => "String".into(),
        Schema::Array { items } => format!("Vec<{}>", rust_type(items)),
        Schema::Nullable { inner } => format!("Option<{}>", rust_type(inner)),
        // Nested objects stay free-form: the subset does not name nested types.
        Schema::Object { .. } | Schema::Any => "serde_json::Value".into(),
    }
}

/// Fields for the variables: schema properties (typed) and declared variable names (free-form).
/// Anything not required is an `Option` (an absent variable deserializes to `None`).
fn fields(schema: Option<&Schema>, declared: &BTreeSet<&str>) -> Vec<Field> {
    let mut vars: Vec<(String, String)> = Vec::new();
    let mut required: BTreeSet<&str> = BTreeSet::new();
    let mut typed: std::collections::BTreeMap<&str, &Schema> = Default::default();
    if let Some(Schema::Object {
        properties,
        required: r,
    }) = schema
    {
        required.extend(r.iter().map(String::as_str));
        typed.extend(properties.iter().map(|(k, v)| (k.as_str(), v)));
    }
    let names: BTreeSet<&str> = typed
        .keys()
        .copied()
        .chain(declared.iter().copied())
        .collect();
    for n in &names {
        vars.push((ident(n), (*n).to_owned()));
    }
    unique(vars)
        .into_iter()
        .map(|(name, var)| {
            let is_required = required.contains(var.as_str());
            let ty = match typed.get(var.as_str()) {
                Some(s) if is_required => rust_type(s),
                Some(s) => match rust_type(s) {
                    t if t.starts_with("Option<") => t,
                    t => format!("Option<{t}>"),
                },
                None => "Option<serde_json::Value>".into(),
            };
            Field {
                name,
                var,
                ty,
                required: is_required,
            }
        })
        .collect()
}

fn root_identifier(source: &str) -> Option<&str> {
    let s = source.trim().trim_start_matches('=').trim();
    let end = s
        .find(|c: char| !(c.is_ascii_alphanumeric() || c == '_'))
        .unwrap_or(s.len());
    let id = &s[..end];
    (!id.is_empty() && !id.starts_with(|c: char| c.is_ascii_digit())).then_some(id)
}

struct J<'a> {
    spec: &'a JobSpec,
    module: String,
    ty: String,
    inputs: Vec<Field>,
    outputs: Vec<Field>,
}

fn jobs<'a>(selected: &[&'a JobSpec]) -> Vec<J<'a>> {
    // `src/gen/errors.rs` and `mod.rs` are fixed files.
    let modules = unique_except(
        selected
            .iter()
            .map(|j| (ident(&j.job_type), j.job_type.clone()))
            .collect(),
        &["errors", "mod"],
    );
    selected
        .iter()
        .zip(modules)
        .map(|(spec, (module, _))| {
            let ins: BTreeSet<&str> = spec.inputs.iter().map(|m| m.target.as_str()).collect();
            let outs: BTreeSet<&str> = spec
                .outputs
                .iter()
                .filter_map(|m| root_identifier(&m.source))
                .collect();
            J {
                spec,
                ty: crate::pascal(&spec.job_type),
                inputs: fields(spec.input_schema.as_ref(), &ins),
                outputs: fields(spec.output_schema.as_ref(), &outs),
                module,
            }
        })
        .collect()
}

fn serde_attrs(f: &Field, output: bool) -> String {
    let mut a = Vec::new();
    if f.name != f.var {
        a.push(format!("rename = {}", lit(&f.var)));
    }
    if output {
        a.push("skip_serializing_if = \"Option::is_none\"".into());
    } else if !f.required {
        a.push("default".into());
    }
    if a.is_empty() {
        return String::new();
    }
    format!("#[serde({})]", a.join(", "))
}

/// Parse and pretty-print; the header goes on afterwards because comments do not survive parsing.
fn pretty(path: &str, hdr: &str, src: &str) -> Result<GenFile, EmitError> {
    let file =
        syn::parse_file(src).map_err(|e| EmitError::Invalid(format!("{path}: {e}\n{src}")))?;
    Ok(GenFile::generated(
        path,
        format!("{hdr}{}", prettyplease::unparse(&file)),
    ))
}

fn job_module(j: &J, hdr: &str) -> Result<GenFile, EmitError> {
    let ty = &j.ty;
    let mut s = String::new();
    s.push_str("use bpmnkit_worker::{ActivatedJob, Complete, Handler, JobError, WorkerConfig};\n");
    s.push_str("use serde::{Deserialize, Serialize};\n\n");
    let _ = writeln!(s, "pub const JOB_TYPE: &str = {};", lit(&j.spec.job_type));
    let fetch: Vec<String> = j.inputs.iter().map(|f| lit(&f.var)).collect();
    let _ = writeln!(
        s,
        "/// Variables fetched for the job: the declared inputs. Empty means all (none declared).\npub const FETCH_VARIABLES: &[&str] = &[{}];",
        fetch.join(", ")
    );
    let _ = writeln!(
        s,
        "#[derive(Debug, Clone, Default, Deserialize)]\npub struct {ty}Input {{"
    );
    for f in &j.inputs {
        let _ = writeln!(s, "{}\npub {}: {},", serde_attrs(f, false), f.name, f.ty);
    }
    s.push_str("}\n");
    let _ = writeln!(
        s,
        "#[derive(Debug, Clone, Default, Serialize)]\npub struct {ty}Output {{"
    );
    for f in &j.outputs {
        let _ = writeln!(s, "{}\npub {}: {},", serde_attrs(f, true), f.name, f.ty);
    }
    s.push_str("}\n");
    let _ = write!(
        s,
        r#"
/// Implement this in `src/handlers/{m}.rs`. Delivery is at-least-once: be idempotent.
pub trait {ty}Handler: Send + Sync + 'static {{
    fn handle(
        &self,
        input: {ty}Input,
        job: &ActivatedJob,
    ) -> impl std::future::Future<Output = Result<{ty}Output, JobError>> + Send;
}}

/// The worker settings of this job type; chain more builder calls to tune them.
pub fn config() -> WorkerConfig {{
    let config = WorkerConfig::new(JOB_TYPE);
    if FETCH_VARIABLES.is_empty() {{
        config
    }} else {{
        config.fetch_variables(FETCH_VARIABLES.iter().copied())
    }}
}}

/// Wraps a handler as a worker [`Handler`]: variables in, variables out, errors mapped.
pub struct Adapter<H>(pub H);

impl<H: {ty}Handler> Handler for Adapter<H> {{
    async fn handle(&self, job: ActivatedJob) -> Result<Complete, JobError> {{
        let input: {ty}Input = serde_json::from_value(serde_json::Value::Object(job.variables.clone()))
            .map_err(|e| JobError::fail(format!("invalid variables for job type {{JOB_TYPE}}: {{e}}")))?;
        let output = self.0.handle(input, &job).await?;
        Complete::output(&output)
    }}
}}
"#,
        m = j.module
    );
    pretty(&format!("src/gen/{}.rs", j.module), hdr, &s)
}

fn errors_module(js: &[J], hdr: &str) -> Result<GenFile, EmitError> {
    let codes: BTreeSet<&str> = js
        .iter()
        .flat_map(|j| j.spec.errors.iter().map(String::as_str))
        .collect();
    let consts = unique(
        codes
            .iter()
            .map(|c| (upper_snake(c), (*c).to_owned()))
            .collect(),
    );
    let fns = unique(codes.iter().map(|c| (ident(c), (*c).to_owned())).collect());
    let mut s = String::from(
        "use bpmnkit_worker::JobError;\n\n// BPMN error codes of the model: return one of these from a handler to throw it (boundary events catch it).\n",
    );
    for (c, code) in &consts {
        let _ = writeln!(s, "pub const {c}: &str = {};", lit(code));
    }
    for ((f, _), (c, _)) in fns.iter().zip(&consts) {
        let _ = writeln!(
            s,
            "pub fn {f}(message: impl Into<String>) -> JobError {{ JobError::bpmn({c}, message) }}"
        );
    }
    if codes.is_empty() {
        s.push_str("// (the model has no error boundary events)\n");
    }
    pretty("src/gen/errors.rs", hdr, &s)
}

fn gen_mod(js: &[J], hdr: &str) -> Result<GenFile, EmitError> {
    let mut s = String::from("use bpmnkit_worker::Runtime;\n\npub mod errors;\n");
    for j in js {
        let _ = writeln!(s, "pub mod {};", j.module);
    }
    s.push_str("\n/// Registers one worker per job type, each with its handler from `crate::handlers`.\npub fn register(runtime: Runtime) -> Runtime {\n    runtime\n");
    for j in js {
        let _ = writeln!(
            s,
            "        .register({m}::config(), {m}::Adapter(crate::handlers::{m}::Handler))",
            m = j.module
        );
    }
    s.push_str("}\n");
    pretty("src/gen/mod.rs", hdr, &s)
}

fn handlers_mod(js: &[J], hdr: &str) -> Result<GenFile, EmitError> {
    let mut s = String::new();
    for j in js {
        let _ = writeln!(s, "pub mod {};", j.module);
    }
    pretty("src/handlers/mod.rs", hdr, &s)
}

fn handler_stub(j: &J) -> GenFile {
    let ty = &j.ty;
    let kind = if j.spec.kind == JobKind::AdHocSubProcess {
        "// Ad-hoc sub-process job: complete with `Complete::output(..)?.result(JobResult::AdHocSubProcess { .. })`\n// to activate elements.\n"
    } else {
        ""
    };
    GenFile::once(
        format!("src/handlers/{}.rs", j.module),
        format!(
            "use bpmnkit_worker::{{ActivatedJob, JobError}};\n\nuse crate::gen::{m}::{{{ty}Handler, {ty}Input, {ty}Output}};\n\n{kind}pub struct Handler;\n\nimpl {ty}Handler for Handler {{\n    async fn handle(\n        &self,\n        _input: {ty}Input,\n        _job: &ActivatedJob,\n    ) -> Result<{ty}Output, JobError> {{\n        // Return `Err(JobError::bpmn(code, message))` for a BPMN error (see `gen::errors`);\n        // any other error fails the job with retries - 1.\n        Err(JobError::fail(\"job type {jt}: handler not implemented\"))\n    }}\n}}\n",
            m = j.module,
            jt = j.spec.job_type.replace('\\', "\\\\").replace('"', "'"),
        ),
    )
}

fn test_stub(j: &J, krate: &str) -> GenFile {
    GenFile::once(
        format!("tests/{}.rs", j.module),
        format!(
            "use bpmnkit_worker::testing::{{run_handler, MockJob}};\nuse {krate}::gen::{m}::{{Adapter, JOB_TYPE}};\nuse {krate}::handlers::{m}::Handler;\n\n#[tokio::test]\n#[ignore = \"implement the handler, then assert on the command\"]\nasync fn {m}_completes() {{\n    let job = MockJob::new(JOB_TYPE).build();\n    let command = run_handler(&Adapter(Handler), job).await;\n    assert!(matches!(command, bpmnkit_worker::Command::Complete(_)), \"{{command:?}}\");\n}}\n",
            m = j.module
        ),
    )
}

fn manifest(slug: &str, worker_path: Option<&str>) -> String {
    let worker = match worker_path {
        Some(p) => format!("{{ path = {}, features = [\"testing\"] }}", lit(p)),
        None => format!("\"={}\"", Versions::WORKER),
    };
    let dev_worker = match worker_path {
        Some(p) => format!("{{ path = {}, features = [\"testing\"] }}", lit(p)),
        None => format!(
            "{{ version = \"={}\", features = [\"testing\"] }}",
            Versions::WORKER
        ),
    };
    format!(
        "[package]\nname = {name}\nversion = \"0.1.0\"\nedition = \"2021\"\nrust-version = \"1.85\"\npublish = false\n\n[dependencies]\nbpmnkit-worker = {worker}\nserde = {{ version = \"={serde}\", features = [\"derive\"] }}\nserde_json = \"={json}\"\ntokio = {{ version = \"={tokio}\", features = [\"macros\", \"rt-multi-thread\"] }}\n\n[dev-dependencies]\nbpmnkit-worker = {dev_worker}\ntokio = {{ version = \"={tokio}\", features = [\"macros\", \"rt-multi-thread\"] }}\n",
        name = lit(slug),
        serde = Versions::SERDE,
        json = Versions::SERDE_JSON,
        tokio = Versions::TOKIO,
    )
}

fn readme(name: &str, js: &[J]) -> String {
    let mut s = format!(
        "# {name}\n\nCamunda 8 job workers generated by `bpmnkit worker gen --lang rust`.\n\n```sh\ncargo run     # start the workers (REST; CAMUNDA_REST_ADDRESS, default http://localhost:8080)\ncargo test\n```\n\n## Job types\n\n"
    );
    for j in js {
        let _ = writeln!(
            s,
            "- `{}` → `src/handlers/{}.rs`",
            j.spec.job_type, j.module
        );
    }
    s.push_str("\n## Ownership\n\n- `src/gen/` and `src/handlers/mod.rs` are overwritten by `bpmnkit worker gen` (`DO NOT EDIT`). Check drift in CI with `--check`.\n- Everything else (handlers, tests, `main.rs`, `Cargo.toml`) is written once and never overwritten.\n- Delivery is at-least-once: handlers must be idempotent.\n");
    s
}

impl Emitter for RustEmitter {
    fn target(&self) -> &'static str {
        "rust"
    }

    fn emit(&self, project: &WorkerProject) -> Result<Vec<GenFile>, EmitError> {
        let selected = select_jobs(project, self.all);
        if selected.is_empty() {
            return Err(EmitError::NoJobs);
        }
        let js = jobs(&selected);
        let hdr = header("//", &ir_hash(project));
        let slug = slug(&project.name);
        let krate = slug.replace('-', "_");
        let mut files = vec![
            gen_mod(&js, &hdr)?,
            errors_module(&js, &hdr)?,
            handlers_mod(&js, &hdr)?,
        ];
        for j in &js {
            files.push(job_module(j, &hdr)?);
            files.push(handler_stub(j));
            files.push(test_stub(j, &krate));
        }
        files.push(GenFile::once(
            "src/lib.rs",
            "pub mod gen;\npub mod handlers;\n".to_owned(),
        ));
        files.push(GenFile::once(
            "src/main.rs",
            format!(
                "use bpmnkit_worker::Runtime;\nuse {krate}::gen;\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn std::error::Error>> {{\n    // CAMUNDA_REST_ADDRESS, CAMUNDA_CLIENT_ID, CAMUNDA_CLIENT_SECRET, CAMUNDA_OAUTH_URL, ...\n    let reports = gen::register(Runtime::from_env()?).run().await;\n    for report in reports {{\n        eprintln!(\"{{report:?}}\");\n    }}\n    Ok(())\n}}\n"
            ),
        ));
        files.push(GenFile::once(
            "Cargo.toml",
            manifest(&slug, self.worker_path.as_deref()),
        ));
        files.push(GenFile::once("README.md", readme(&project.name, &js)));
        files.push(GenFile::once(".gitignore", "target/\n".to_owned()));
        finish(files)
    }
}
