//! Guest SDK for BPMN Kit Wasm job workers (`wasm32-wasip2`, world `bpmnkit:worker/worker-http`).
//!
//! ```no_run
//! use bpmnkit_wasm_sdk::prelude::*;
//!
//! struct Echo;
//! impl Worker for Echo {
//!     fn handle(job: Job) -> Outcome {
//!         match job.variables::<Value>() {
//!             Ok(v) => Outcome::complete(v),
//!             Err(e) => Outcome::fail(format!("bad input: {e}")).no_retry(),
//!         }
//!     }
//! }
//! bpmnkit_wasm_sdk::export!(Echo);
//! ```
//!
//! The bindings always cover `wasi:http`; `wit-component` drops imports a worker never calls, so a
//! worker without HTTP still targets the plain `worker` world.

#[doc(hidden)]
#[allow(clippy::too_many_arguments)] // generated wasi bindings
pub mod bindings {
    wit_bindgen::generate!({
        path: "../contract/wit",
        world: "bpmnkit:worker/worker-http",
        generate_all,
        pub_export_macro: true,
        export_macro_name: "__export_worker",
        default_bindings_module: "bpmnkit_wasm_sdk::bindings",
    });
}

pub mod http;
mod job;
pub mod log;
mod outcome;
pub mod secrets;

pub use job::Job;
pub use outcome::Outcome;
pub use serde;
pub use serde_json::{self, json, Value};

/// A job worker. One call per activated job; the returned [`Outcome`] completes, fails or throws.
pub trait Worker {
    fn handle(job: Job) -> Outcome;
}

pub mod prelude {
    pub use crate::{http, log, secrets, Job, Outcome, Worker};
    pub use serde::{Deserialize, Serialize};
    pub use serde_json::{json, Value};
}

/// Exports a [`Worker`] as the component's `handle` function.
#[macro_export]
macro_rules! export {
    ($worker:ident) => {
        impl $crate::bindings::Guest for $worker {
            fn handle(
                job: $crate::bindings::bpmnkit::worker::types::Job,
            ) -> $crate::bindings::bpmnkit::worker::types::Outcome {
                $crate::__dispatch::<$worker>(job)
            }
        }
        $crate::bindings::__export_worker!($worker with_types_in $crate::bindings);
    };
}

#[doc(hidden)]
pub fn __dispatch<W: Worker>(
    job: bindings::bpmnkit::worker::types::Job,
) -> bindings::bpmnkit::worker::types::Outcome {
    install_panic_hook();
    let job = Job::from(job);
    // wasm32-wasip2 aborts on panic, so this only catches where unwinding exists (native tests);
    // on wasm the hook below has already logged the message before the trap.
    std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| W::handle(job)))
        .unwrap_or_else(|p| Outcome::fail(format!("worker panicked: {}", panic_message(&*p))))
        .into_wit()
}

fn panic_message(p: &(dyn std::any::Any + Send)) -> &str {
    p.downcast_ref::<&str>()
        .copied()
        .or_else(|| p.downcast_ref::<String>().map(String::as_str))
        .unwrap_or("(no message)")
}

#[cfg(target_arch = "wasm32")]
fn install_panic_hook() {
    static ONCE: std::sync::Once = std::sync::Once::new();
    ONCE.call_once(|| {
        std::panic::set_hook(Box::new(|info| {
            log::error(format!("worker panicked: {info}"))
        }));
    });
}

// Natively the log import is unreachable, so keep the default hook.
#[cfg(not(target_arch = "wasm32"))]
fn install_panic_hook() {}

#[cfg(test)]
mod tests {
    use super::*;
    use bindings::bpmnkit::worker::types as wit;

    fn wit_job(vars: &str) -> wit::Job {
        wit::Job {
            key: "1".into(),
            job_type: "t".into(),
            process_instance_key: "2".into(),
            element_id: "e".into(),
            retries: 3,
            variables: vars.into(),
            custom_headers: vec![],
        }
    }

    struct Echo;
    impl Worker for Echo {
        fn handle(job: Job) -> Outcome {
            Outcome::complete(job.variables().unwrap())
        }
    }
    struct Boom;
    impl Worker for Boom {
        fn handle(_: Job) -> Outcome {
            panic!("kaboom")
        }
    }

    #[test]
    fn dispatch_runs_the_worker() {
        match __dispatch::<Echo>(wit_job(r#"{"a":1}"#)) {
            wit::Outcome::Complete(s) => assert_eq!(s, r#"{"a":1}"#),
            o => panic!("{o:?}"),
        }
    }

    #[test]
    fn panic_becomes_fail() {
        match __dispatch::<Boom>(wit_job("{}")) {
            wit::Outcome::Fail(f) => assert_eq!(f.message, "worker panicked: kaboom"),
            o => panic!("{o:?}"),
        }
    }
}
