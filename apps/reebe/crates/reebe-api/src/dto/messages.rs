use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PublishMessageRequest {
    /// Camunda 8 v2 calls it `name`; `messageName` is the older name.
    #[serde(alias = "name")]
    pub message_name: String,
    pub correlation_key: Option<String>,
    pub time_to_live: Option<i64>,
    pub message_id: Option<String>,
    pub variables: Option<serde_json::Value>,
    pub tenant_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublishMessageResponse {
    pub message_key: String,
    pub tenant_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CorrelateMessageRequest {
    /// Camunda 8 v2 calls it `name`; `messageName` is the older name.
    #[serde(alias = "name")]
    pub message_name: String,
    pub correlation_key: Option<String>,
    pub variables: Option<serde_json::Value>,
    pub tenant_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CorrelateMessageResponse {
    pub message_key: String,
    pub process_instance_key: String,
    pub tenant_id: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn message_name_accepts_the_camunda_8_v2_name() {
        let body = serde_json::json!({ "name": "ci-passed", "correlationKey": "42" });
        let publish: PublishMessageRequest = serde_json::from_value(body.clone()).unwrap();
        assert_eq!(publish.message_name, "ci-passed");
        let correlate: CorrelateMessageRequest = serde_json::from_value(body).unwrap();
        assert_eq!(correlate.message_name, "ci-passed");

        let old: PublishMessageRequest =
            serde_json::from_value(serde_json::json!({ "messageName": "ci-passed" })).unwrap();
        assert_eq!(old.message_name, "ci-passed");
    }
}
