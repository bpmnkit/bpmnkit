use crate::pagination::PageRequest;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProcessInstanceRequest {
    /// Camunda 8 v2 calls it `processDefinitionId`; `bpmnProcessId` is the older name.
    #[serde(alias = "processDefinitionId")]
    pub bpmn_process_id: Option<String>,
    pub process_definition_key: Option<String>,
    pub version: Option<i32>,
    pub variables: Option<serde_json::Value>,
    pub tenant_id: Option<String>,
    pub start_instructions: Option<Vec<serde_json::Value>>,
    pub operation_reference: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProcessInstanceResponse {
    pub process_instance_key: String,
    pub process_definition_key: String,
    pub bpmn_process_id: String,
    pub version: i32,
    pub tenant_id: String,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchProcessInstancesRequest {
    pub filter: Option<ProcessInstanceFilter>,
    pub sort: Option<Vec<serde_json::Value>>,
    pub page: Option<PageRequest>,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessInstanceFilter {
    pub state: Option<String>,
    #[serde(alias = "processDefinitionId")]
    pub bpmn_process_id: Option<String>,
    pub process_instance_key: Option<String>,
    pub tenant_id: Option<String>,
}

impl ProcessInstanceFilter {
    /// `processInstanceKey`, parsed; the repository search has no key column filter.
    pub fn instance_key(&self) -> Result<Option<i64>, String> {
        self.process_instance_key
            .as_deref()
            .map(|k| {
                k.parse()
                    .map_err(|_| format!("Invalid processInstanceKey: {k}"))
            })
            .transpose()
    }

    /// The non-key filters, for an instance fetched by key.
    pub fn matches(&self, pi: &reebe_db::state::process_instances::ProcessInstance) -> bool {
        let eq = |want: &Option<String>, have: &str| want.as_deref().is_none_or(|w| w == have);
        eq(&self.state, &pi.state)
            && eq(&self.bpmn_process_id, &pi.bpmn_process_id)
            && eq(&self.tenant_id, &pi.tenant_id)
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessInstanceDto {
    pub process_instance_key: String,
    pub process_definition_key: String,
    pub process_definition_id: String,
    /// Older name of `processDefinitionId`, kept for existing clients.
    pub bpmn_process_id: String,
    pub version: i32,
    pub state: String,
    pub start_date: String,
    pub end_date: Option<String>,
    pub tenant_id: String,
}

impl From<reebe_db::state::process_instances::ProcessInstance> for ProcessInstanceDto {
    fn from(pi: reebe_db::state::process_instances::ProcessInstance) -> Self {
        Self {
            process_instance_key: pi.key.to_string(),
            process_definition_key: pi.process_definition_key.to_string(),
            process_definition_id: pi.bpmn_process_id.clone(),
            bpmn_process_id: pi.bpmn_process_id,
            version: pi.version,
            state: pi.state,
            start_date: pi.start_date.to_rfc3339(),
            end_date: pi.end_date.map(|d| d.to_rfc3339()),
            tenant_id: pi.tenant_id,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn create_accepts_the_camunda_8_v2_process_definition_id() {
        for field in ["processDefinitionId", "bpmnProcessId"] {
            let req: CreateProcessInstanceRequest =
                serde_json::from_value(serde_json::json!({ field: "order" })).unwrap();
            assert_eq!(req.bpmn_process_id.as_deref(), Some("order"), "{field}");
        }
    }

    fn instance(key: i64, state: &str) -> reebe_db::state::process_instances::ProcessInstance {
        reebe_db::state::process_instances::ProcessInstance {
            key,
            partition_id: 1,
            process_definition_key: 7,
            bpmn_process_id: "order".into(),
            version: 1,
            state: state.into(),
            start_date: chrono::Utc::now(),
            end_date: None,
            parent_process_instance_key: None,
            parent_element_instance_key: None,
            root_process_instance_key: key,
            tenant_id: "<default>".into(),
        }
    }

    #[test]
    fn search_filter_accepts_the_camunda_8_v2_names() {
        let f: ProcessInstanceFilter = serde_json::from_value(serde_json::json!({
            "processDefinitionId": "order", "processInstanceKey": "42"
        }))
        .unwrap();
        assert_eq!(f.bpmn_process_id.as_deref(), Some("order"));
        assert_eq!(f.instance_key(), Ok(Some(42)));
    }

    #[test]
    fn search_filter_matches_other_fields_of_a_keyed_instance() {
        let f = ProcessInstanceFilter {
            state: Some("ACTIVE".into()),
            ..Default::default()
        };
        assert!(f.matches(&instance(1, "ACTIVE")));
        assert!(!f.matches(&instance(1, "COMPLETED")));
        let f = ProcessInstanceFilter {
            bpmn_process_id: Some("other".into()),
            ..Default::default()
        };
        assert!(!f.matches(&instance(1, "ACTIVE")));
    }

    #[test]
    fn dto_carries_the_camunda_8_v2_process_definition_id() {
        let v = serde_json::to_value(ProcessInstanceDto::from(instance(1, "ACTIVE"))).unwrap();
        assert_eq!(v["processDefinitionId"], "order");
        assert_eq!(v["bpmnProcessId"], "order");
    }
}
