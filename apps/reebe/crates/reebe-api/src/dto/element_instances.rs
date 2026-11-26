use crate::pagination::PageRequest;
use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchElementInstancesRequest {
    pub filter: Option<ElementInstanceFilter>,
    pub sort: Option<Vec<serde_json::Value>>,
    pub page: Option<PageRequest>,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementInstanceFilter {
    pub process_instance_key: Option<String>,
    pub state: Option<String>,
    /// Camunda 8 v2 calls it `type`.
    #[serde(alias = "type")]
    pub element_type: Option<String>,
    pub element_id: Option<String>,
    pub tenant_id: Option<String>,
}

impl ElementInstanceFilter {
    /// The filters applied to a process instance's element instances (`state` is not: reebe's
    /// stored states are not the API's `ACTIVE | COMPLETED | TERMINATED`).
    pub fn matches(&self, ei: &reebe_db::state::element_instances::ElementInstance) -> bool {
        let eq = |want: &Option<String>, have: &str| want.as_deref().is_none_or(|w| w == have);
        eq(&self.element_type, &ei.element_type)
            && eq(&self.element_id, &ei.element_id)
            && eq(&self.tenant_id, &ei.tenant_id)
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementInstanceDto {
    pub element_instance_key: String,
    pub process_instance_key: String,
    pub process_definition_key: String,
    pub element_id: String,
    /// Camunda 8 v2 name of `elementType`.
    #[serde(rename = "type")]
    pub kind: String,
    pub element_type: String,
    pub state: String,
    pub tenant_id: String,
}

impl From<reebe_db::state::element_instances::ElementInstance> for ElementInstanceDto {
    fn from(ei: reebe_db::state::element_instances::ElementInstance) -> Self {
        Self {
            element_instance_key: ei.key.to_string(),
            process_instance_key: ei.process_instance_key.to_string(),
            process_definition_key: ei.process_definition_key.to_string(),
            element_id: ei.element_id,
            kind: ei.element_type.clone(),
            element_type: ei.element_type,
            state: ei.state,
            tenant_id: ei.tenant_id,
        }
    }
}

/// `POST /v2/element-instances/ad-hoc-activities/{key}/activation` body
/// (`AdHocSubProcessActivateActivitiesInstruction`).
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivateAdHocActivitiesRequest {
    pub elements: Option<Vec<AdHocActivityReference>>,
    #[serde(default)]
    pub cancel_remaining_instances: bool,
}

/// `AdHocSubProcessActivateActivityReference`.
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdHocActivityReference {
    pub element_id: Option<String>,
    pub variables: Option<serde_json::Map<String, serde_json::Value>>,
}

#[cfg(test)]
mod filter_tests {
    use super::*;

    fn ei(id: &str, ty: &str) -> reebe_db::state::element_instances::ElementInstance {
        reebe_db::state::element_instances::ElementInstance {
            key: 1,
            partition_id: 1,
            process_instance_key: 2,
            process_definition_key: 3,
            bpmn_process_id: "p".into(),
            element_id: id.into(),
            element_type: ty.into(),
            state: "COMPLETED".into(),
            flow_scope_key: None,
            scope_key: None,
            incident_key: None,
            tenant_id: "<default>".into(),
        }
    }

    #[test]
    fn filters_by_the_camunda_8_v2_type_and_element_id() {
        let f: ElementInstanceFilter = serde_json::from_value(
            serde_json::json!({ "processInstanceKey": "2", "type": "END_EVENT" }),
        )
        .unwrap();
        assert!(f.matches(&ei("done", "END_EVENT")));
        assert!(!f.matches(&ei("start", "START_EVENT")));
        let f: ElementInstanceFilter =
            serde_json::from_value(serde_json::json!({ "elementId": "done" })).unwrap();
        assert!(f.matches(&ei("done", "END_EVENT")));
        assert!(!f.matches(&ei("other", "END_EVENT")));
    }

    #[test]
    fn dto_carries_the_camunda_8_v2_type() {
        let v = serde_json::to_value(ElementInstanceDto::from(ei("done", "END_EVENT"))).unwrap();
        assert_eq!(v["type"], "END_EVENT");
        assert_eq!(v["elementType"], "END_EVENT");
    }
}
