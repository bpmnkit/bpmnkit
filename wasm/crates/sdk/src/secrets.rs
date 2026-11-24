//! Secrets the manifest declares under `[secrets] names`; any other name is `None`.

pub fn get(name: &str) -> Option<String> {
    crate::bindings::bpmnkit::worker::secrets::get(name)
}
