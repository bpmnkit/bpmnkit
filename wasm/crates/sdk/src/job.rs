use crate::bindings::bpmnkit::worker::types as wit;
use serde::de::DeserializeOwned;

/// An activated job. Keys are strings, as in the Camunda 8 REST API.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Job {
    pub key: String,
    pub job_type: String,
    pub process_instance_key: String,
    pub element_id: String,
    pub retries: u32,
    pub custom_headers: Vec<(String, String)>,
    variables: String,
}

impl Job {
    /// The job's variables, deserialized (a struct with `#[derive(Deserialize)]`, or `Value`).
    pub fn variables<T: DeserializeOwned>(&self) -> Result<T, serde_json::Error> {
        serde_json::from_str(&self.variables)
    }

    /// The variables as the JSON text the host sent.
    pub fn variables_json(&self) -> &str {
        &self.variables
    }

    /// A custom header from the task definition (`zeebe:taskHeaders`).
    pub fn header(&self, name: &str) -> Option<&str> {
        self.custom_headers
            .iter()
            .find(|(k, _)| k == name)
            .map(|(_, v)| v.as_str())
    }
}

impl From<wit::Job> for Job {
    fn from(j: wit::Job) -> Self {
        Self {
            key: j.key,
            job_type: j.job_type,
            process_instance_key: j.process_instance_key,
            element_id: j.element_id,
            retries: j.retries,
            custom_headers: j.custom_headers,
            variables: j.variables,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::Deserialize;

    fn job() -> Job {
        Job::from(wit::Job {
            key: "2251799813685249".into(),
            job_type: "charge-card".into(),
            process_instance_key: "7".into(),
            element_id: "Task_1".into(),
            retries: 3,
            variables: r#"{"customer_id":"c1","amount_cents":500}"#.into(),
            custom_headers: vec![("currency".into(), "eur".into())],
        })
    }

    #[test]
    fn typed_variables() {
        #[derive(Deserialize)]
        struct Input {
            customer_id: String,
            amount_cents: u64,
        }
        let i: Input = job().variables().unwrap();
        assert_eq!((i.customer_id.as_str(), i.amount_cents), ("c1", 500));
    }

    #[test]
    fn variables_type_mismatch_is_an_error() {
        #[derive(Debug, Deserialize)]
        #[allow(dead_code)]
        struct Input {
            missing: String,
        }
        let e = job().variables::<Input>().unwrap_err();
        assert!(e.to_string().contains("missing"), "{e}");
    }

    #[test]
    fn header_lookup() {
        let j = job();
        assert_eq!(j.header("currency"), Some("eur"));
        assert_eq!(j.header("nope"), None);
        assert_eq!(j.key, "2251799813685249");
    }
}
