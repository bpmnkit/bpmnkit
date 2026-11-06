use crate::error::EngineResult;
use reebe_db::StateBackend;
use reebe_protocol::key::encode_key;
use std::sync::Arc;

pub struct KeyGenerator {
    pub backend: Arc<dyn StateBackend>,
    pub partition_id: i16,
}

impl KeyGenerator {
    pub fn new(backend: Arc<dyn StateBackend>, partition_id: i16) -> Self {
        Self {
            backend,
            partition_id,
        }
    }

    pub async fn next_key(&self) -> EngineResult<i64> {
        let local_key = self.backend.next_key(self.partition_id).await?;
        Ok(encode_key(self.partition_id as u32, local_key as u64))
    }
}
