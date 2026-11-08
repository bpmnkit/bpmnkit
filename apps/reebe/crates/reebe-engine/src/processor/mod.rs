pub(crate) mod ad_hoc;
pub mod bpmn_element;
pub(crate) mod catch_event;
pub(crate) mod compensation;
pub(crate) mod cron;
pub mod decision;
pub mod deployment;
pub mod identity;
pub mod incident;
pub mod job;
pub(crate) mod join;
pub mod message;
pub mod modification;
pub(crate) mod multi_instance;
pub mod process_instance;
pub(crate) mod scope;
pub mod signal;
pub(crate) mod start_event;
pub(crate) mod throw_event;
pub mod timer;
pub mod user_task;
pub mod variable;

pub use ad_hoc::AdHocSubProcessInstructionProcessor;
pub use bpmn_element::BpmnElementProcessor;
pub use decision::DecisionEvaluationProcessor;
pub use deployment::DeploymentProcessor;
pub use identity::IdentityProcessor;
pub use incident::IncidentProcessor;
pub use job::JobProcessor;
pub use message::MessageProcessor;
pub use modification::ProcessInstanceModificationProcessor;
pub use process_instance::{ProcessInstanceCancelProcessor, ProcessInstanceCreationProcessor};
pub use signal::SignalProcessor;
pub use timer::TimerProcessor;
pub use user_task::UserTaskProcessor;
pub use variable::VariableDocumentProcessor;

use crate::engine::EngineState;
use crate::error::EngineResult;
use async_trait::async_trait;
use reebe_db::records::DbRecord;

/// Output writers collected during a single record processing step.
pub struct Writers {
    pub events: Vec<EventToWrite>,
    pub commands: Vec<CommandToWrite>,
    pub response: Option<serde_json::Value>,
    pub rejection: Option<String>,
}

impl Writers {
    pub fn new() -> Self {
        Self {
            events: Vec::new(),
            commands: Vec::new(),
            response: None,
            rejection: None,
        }
    }
}

impl Default for Writers {
    fn default() -> Self {
        Self::new()
    }
}

/// An event record to write to the log and state.
pub struct EventToWrite {
    pub value_type: String,
    pub intent: String,
    pub key: i64,
    pub payload: serde_json::Value,
}

/// A follow-up command to write to the log.
pub struct CommandToWrite {
    pub value_type: String,
    pub intent: String,
    pub key: i64,
    pub payload: serde_json::Value,
}

/// Trait that all record processors must implement.
#[async_trait]
pub trait RecordProcessor: Send + Sync {
    /// Returns true if this processor handles the given value_type and intent.
    fn accepts(&self, value_type: &str, intent: &str) -> bool;

    /// Process a command record and write results to writers.
    async fn process(
        &self,
        record: &DbRecord,
        state: &EngineState,
        writers: &mut Writers,
    ) -> EngineResult<()>;
}
