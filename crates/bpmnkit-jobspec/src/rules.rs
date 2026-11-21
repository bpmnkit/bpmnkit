//! The decision tree (plan §8). Each rule is a pure function over IR fields and [`Ctx`]; the
//! first match wins. Ids are stable: a new rule appends an id (R13, the catalog name heuristic,
//! runs between R3 and R4), never renumbers.

use bpmnkit_feel::{parse, ParseOptions};
use serde::{Deserialize, Serialize};

use crate::catalog::Catalog;
use crate::config::{Mode, WorkerConfig};
use crate::ir::{BoundOperation, JobSpec, WorkerProject};

/// The `zeebe:property` that overrides the decision (rule R1).
pub const MODE_PROPERTY: &str = "bpmnkit:mode";

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum RuleId {
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
}

/// The order the rules run in.
pub const ORDER: [RuleId; 13] = [
    RuleId::R1,
    RuleId::R2,
    RuleId::R3,
    RuleId::R13,
    RuleId::R4,
    RuleId::R5,
    RuleId::R6,
    RuleId::R7,
    RuleId::R8,
    RuleId::R9,
    RuleId::R10,
    RuleId::R11,
    RuleId::R12,
];

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "decision", rename_all = "lowercase")]
pub enum Decision {
    /// Already a catalog connector: leave it to Camunda's connector runtime.
    Keep,
    /// Bind a catalog connector template (`template` absent when only forced by R1).
    Connector {
        #[serde(default, skip_serializing_if = "Option::is_none")]
        template: Option<String>,
    },
    /// Bind the REST connector (`io.camunda:http-json:1`).
    Rest,
    /// Generate a job worker.
    Worker,
}

impl Decision {
    pub fn label(&self) -> &'static str {
        match self {
            Decision::Keep => "keep",
            Decision::Connector { .. } => "connector",
            Decision::Rest => "rest",
            Decision::Worker => "worker",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Classified {
    #[serde(flatten)]
    pub decision: Decision,
    pub rule: RuleId,
    pub reason: String,
}

/// What the rules may read besides the job: no network, no clock.
#[derive(Debug, Clone, Copy)]
pub struct Ctx<'a> {
    pub catalog: &'a Catalog,
    pub config: &'a WorkerConfig,
}

type Hit = Option<(Decision, String)>;

fn r1(job: &JobSpec, ctx: &Ctx) -> Hit {
    let (mode, from) = match ctx.config.job(&job.job_type).and_then(|c| c.mode) {
        Some(m) => (m, "bpmnkit.worker.toml".to_owned()),
        None => {
            let raw = job.property(MODE_PROPERTY)?;
            (Mode::parse(raw)?, format!("{MODE_PROPERTY}={raw}"))
        }
    };
    let decision = match mode {
        Mode::Connector => Decision::Connector { template: None },
        Mode::Rest => Decision::Rest,
        Mode::Worker => Decision::Worker,
    };
    Some((decision, format!("forced by {from}")))
}

fn r2(job: &JobSpec, ctx: &Ctx) -> Hit {
    if let Some(t) = job.modeler_templates.first() {
        return Some((Decision::Keep, format!("element template {t} applied")));
    }
    let e = ctx.catalog.connector_type(&job.job_type)?;
    Some((Decision::Keep, format!("catalog connector type ({})", e.id)))
}

fn bound(job: &JobSpec) -> bool {
    !job.bound_operations.is_empty() || !job.urls.is_empty()
}

fn r3(job: &JobSpec, ctx: &Ctx) -> Hit {
    if bound(job) {
        return None;
    }
    let e = ctx.catalog.exact(&job.job_type)?;
    Some((
        Decision::Connector {
            template: Some(e.id.clone()),
        },
        format!("job type matches catalog connector {}", e.id),
    ))
}

fn r13(job: &JobSpec, ctx: &Ctx) -> Hit {
    if bound(job) {
        return None;
    }
    let name = job.names().next()?;
    let m = ctx.catalog.by_name(name)?;
    Some((
        Decision::Connector {
            template: Some(m.entry.id.clone()),
        },
        format!(
            "name \"{name}\" matches catalog connector {} ({})",
            m.entry.id,
            m.tokens.join(", ")
        ),
    ))
}

fn r4(job: &JobSpec, _: &Ctx) -> Hit {
    if bound(job) {
        return None;
    }
    let missing: Vec<&str> = job
        .operations
        .iter()
        .filter(|r| !job.bound_operations.iter().any(|b| &b.reference == *r))
        .map(String::as_str)
        .collect();
    let reason = if missing.is_empty() {
        "no OpenAPI operation, URL or catalog connector".to_owned()
    } else {
        format!(
            "operation {} not in the OpenAPI index, no URL or catalog connector",
            missing.join(", ")
        )
    };
    Some((Decision::Worker, reason))
}

/// The first bound operation `pred` holds for, as a reason.
fn op_hit(job: &JobSpec, pred: impl Fn(&BoundOperation) -> Option<String>) -> Hit {
    job.bound_operations
        .iter()
        .find_map(|op| pred(op).map(|why| (Decision::Worker, format!("{}: {why}", op.reference))))
}

const REST_AUTH: &[&str] = &[
    "none",
    "noAuth",
    "apiKey",
    "basic",
    "bearer",
    "oauth-client-credentials-flow",
    "oauth2-client-credentials",
];

fn r5(job: &JobSpec, _: &Ctx) -> Hit {
    op_hit(job, |op| {
        (!REST_AUTH.contains(&op.auth.as_str())).then(|| format!("auth {} needs a worker", op.auth))
    })
}

/// JSON, text or form; not binary, multipart, SSE or ndjson.
fn rest_media(media: &str) -> bool {
    let m = media
        .split(';')
        .next()
        .unwrap_or_default()
        .trim()
        .to_ascii_lowercase();
    m == "application/json"
        || m.ends_with("+json")
        || m == "application/x-www-form-urlencoded"
        || (m.starts_with("text/") && m != "text/event-stream")
}

fn r6(job: &JobSpec, _: &Ctx) -> Hit {
    op_hit(job, |op| {
        op.request_media_types
            .iter()
            .chain(&op.response_media_types)
            .find(|m| !rest_media(m))
            .map(|m| format!("media type {m} needs a worker"))
    })
}

const CURSOR_KEYS: &[&str] = &["next", "nextCursor", "cursor", "links.next"];

fn r7(job: &JobSpec, _: &Ctx) -> Hit {
    op_hit(job, |op| {
        let has = |k: &str| op.response_keys.iter().any(|r| r == k);
        let marker = CURSOR_KEYS
            .iter()
            .find(|k| has(k))
            .map(|k| (*k).to_owned())
            .or_else(|| (has("page") && has("total")).then(|| "page + total".to_owned()))
            .or_else(|| op.link_header.then(|| "Link header".to_owned()))?;
        (op.response_list || op.paginate).then(|| format!("paginated list ({marker})"))
    })
}

fn r8(job: &JobSpec, _: &Ctx) -> Hit {
    (job.operations.len() > 1).then(|| {
        (
            Decision::Worker,
            format!("binds {} operations", job.operations.len()),
        )
    })
}

/// A mapping source the FEEL parser rejects (a static value is not FEEL).
fn feel_fails(source: &str) -> bool {
    let s = source.trim();
    match s.strip_prefix('=') {
        Some(expr) => parse(expr, &ParseOptions::default()).is_err(),
        None => false,
    }
}

fn r9(job: &JobSpec, _: &Ctx) -> Hit {
    let outputs = job
        .outputs
        .iter()
        .map(|m| (m.target.as_str(), m.source.as_str()));
    let result = job
        .headers
        .iter()
        .filter(|h| h.key == "resultExpression")
        .flat_map(|h| h.values.iter().map(|v| ("resultExpression", v.as_str())));
    outputs
        .chain(result)
        .find(|(_, src)| feel_fails(src))
        .map(|(target, _)| {
            (
                Decision::Worker,
                format!("mapping {target} is not valid FEEL"),
            )
        })
}

fn r10(job: &JobSpec, ctx: &Ctx) -> Hit {
    let c = ctx.config.job(&job.job_type)?;
    if let Some(rps) = c.rps.filter(|r| *r >= ctx.config.rest_max_rps) {
        return Some((
            Decision::Worker,
            format!(
                "declared {rps} jobs/s ≥ rest_max_rps {}",
                ctx.config.rest_max_rps
            ),
        ));
    }
    let slo = c.slo_ms.filter(|s| *s < 50)?;
    Some((Decision::Worker, format!("declared slo_ms {slo} < 50")))
}

fn r11(job: &JobSpec, _: &Ctx) -> Hit {
    op_hit(job, |op| {
        op.required_headers
            .iter()
            .any(|h| h.eq_ignore_ascii_case("idempotency-key"))
            .then(|| "requires an Idempotency-Key header".to_owned())
    })
}

fn r12(job: &JobSpec, _: &Ctx) -> Hit {
    let target = job
        .bound_operations
        .first()
        .map(|op| op.reference.clone())
        .or_else(|| job.urls.first().cloned())
        .unwrap_or_default();
    Some((Decision::Rest, format!("REST connector call ({target})")))
}

/// Runs one rule.
pub fn rule(id: RuleId, job: &JobSpec, ctx: &Ctx) -> Option<Classified> {
    let f: fn(&JobSpec, &Ctx) -> Hit = match id {
        RuleId::R1 => r1,
        RuleId::R2 => r2,
        RuleId::R3 => r3,
        RuleId::R4 => r4,
        RuleId::R5 => r5,
        RuleId::R6 => r6,
        RuleId::R7 => r7,
        RuleId::R8 => r8,
        RuleId::R9 => r9,
        RuleId::R10 => r10,
        RuleId::R11 => r11,
        RuleId::R12 => r12,
        RuleId::R13 => r13,
    };
    f(job, ctx).map(|(decision, reason)| Classified {
        decision,
        rule: id,
        reason,
    })
}

/// The first rule of [`ORDER`] that matches. R12 always matches.
pub fn classify(job: &JobSpec, ctx: &Ctx) -> Classified {
    ORDER
        .iter()
        .find_map(|id| rule(*id, job, ctx))
        .expect("R12 always matches")
}

/// Classifies every job of the project in place.
pub fn classify_project(project: &mut WorkerProject, ctx: &Ctx) {
    for job in project.jobs.values_mut() {
        job.classified = Some(classify(job, ctx));
    }
}
