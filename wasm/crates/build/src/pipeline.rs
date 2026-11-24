use std::time::Instant;

use bpmnkit_wasm_contract::{BuildReport, Diagnostic, StageTiming};

use crate::cargo::{build, check, verify_built};
use crate::exec::Executor;
use crate::package::{package, Artifact};
use crate::render::{render, BuildInput};
use crate::smoke::smoke_test;
use crate::toolchain::Toolchain;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Stage {
    Render,
    Check,
    Build,
    Verify,
    Test,
    Package,
}

impl Stage {
    fn name(self) -> &'static str {
        match self {
            Self::Render => "render",
            Self::Check => "check",
            Self::Build => "build",
            Self::Verify => "verify",
            Self::Test => "test",
            Self::Package => "package",
        }
    }
}

pub struct Pipeline {
    pub report: BuildReport,
    pub artifact: Option<Artifact>,
}

struct Run {
    report: BuildReport,
    last: Stage,
    failed: bool,
}

impl Run {
    /// Runs `f` unless an earlier stage failed or `s` is past the last requested stage; `None`
    /// from `f` marks the run failed. Time is recorded either way.
    fn stage<T>(&mut self, s: Stage, f: impl FnOnce(&mut BuildReport) -> Option<T>) -> Option<T> {
        if self.failed || s > self.last {
            return None;
        }
        let t = Instant::now();
        let out = f(&mut self.report);
        self.report.timings.push(StageTiming {
            stage: s.name().into(),
            ms: t.elapsed().as_millis() as u64,
        });
        self.failed = out.is_none();
        out
    }
}

/// Runs the stages up to and including `last`, stopping at the first failure.
pub fn run_pipeline_until(
    input: &BuildInput,
    tc: &Toolchain,
    ex: &dyn Executor,
    last: Stage,
) -> Pipeline {
    let mut r = Run {
        report: BuildReport {
            ok: false,
            diagnostics: Vec::new(),
            tests: Vec::new(),
            timings: Vec::new(),
            artifact: None,
        },
        last,
        failed: false,
    };
    let project = r.stage(Stage::Render, |rep| {
        render(input, tc).map_err(|d| rep.diagnostics = d).ok()
    });
    if let Some(p) = &project {
        r.stage(Stage::Check, |rep| {
            let c = check(p, tc, ex);
            rep.diagnostics.extend(c.diagnostics);
            c.ok.then_some(())
        });
    }
    let built = project.as_ref().and_then(|p| {
        r.stage(Stage::Build, |rep| {
            build(p, tc, ex)
                .map_err(|f| rep.diagnostics.extend(f.diagnostics))
                .ok()
        })
    });
    if let Some(b) = &built {
        r.stage(Stage::Verify, |rep| {
            let v: Vec<Diagnostic> = verify_built(b);
            let ok = v.is_empty();
            rep.diagnostics.extend(v);
            ok.then_some(())
        });
    }
    if let (Some(b), Some(p)) = (&built, &project) {
        r.stage(Stage::Test, |rep| {
            rep.tests = smoke_test(b, &p.samples);
            rep.tests.iter().all(|t| t.passed).then_some(())
        });
    }
    let mut artifact = None;
    if let Some(b) = built {
        r.stage(Stage::Package, |rep| {
            let tests = rep.tests.clone();
            let a = package(b, tests);
            rep.artifact = Some(a.metadata.clone());
            artifact = Some(a);
            Some(())
        });
    }
    r.report.ok = !r.failed;
    Pipeline {
        report: r.report,
        artifact,
    }
}

/// All stages, as the concept's `run_pipeline`; the artifact bytes come from [`run_pipeline_until`].
pub fn run_pipeline(input: &BuildInput, tc: &Toolchain, ex: &dyn Executor) -> BuildReport {
    run_pipeline_until(input, tc, ex, Stage::Package).report
}
