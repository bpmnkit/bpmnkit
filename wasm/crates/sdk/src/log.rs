//! Log lines the host attaches to the job (with its key and job type).

use crate::bindings::bpmnkit::worker::log::{emit, Level};

pub fn debug(msg: impl AsRef<str>) {
    emit(Level::Debug, msg.as_ref());
}
pub fn info(msg: impl AsRef<str>) {
    emit(Level::Info, msg.as_ref());
}
pub fn warn(msg: impl AsRef<str>) {
    emit(Level::Warn, msg.as_ref());
}
pub fn error(msg: impl AsRef<str>) {
    emit(Level::Error, msg.as_ref());
}
