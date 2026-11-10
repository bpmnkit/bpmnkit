use crate::backend::{StateBackend, TxControl, UnitOfWork};
#[cfg(any(feature = "postgres", feature = "sqlite"))]
use crate::conn::{Conn, TxSlot};
use crate::records::{DbRecord, RecordRepository};
use crate::state::compensation::{CompensationSubscription, CompensationSubscriptionRepository};
use crate::state::decisions::{DecisionDefinition, DecisionRepository, DecisionRequirements};
use crate::state::deployments::{Deployment, DeploymentRepository, ProcessDefinition};
use crate::state::element_instances::{ElementInstance, ElementInstanceRepository};
use crate::state::gateway_tokens::{JoinToken, JoinTokenRepository};
use crate::state::identity::{Tenant, TenantRepository, User, UserRepository};
use crate::state::incidents::{Incident, IncidentRepository};
use crate::state::jobs::{Job, JobRepository};
use crate::state::messages::{
    Message, MessageRepository, MessageStartCorrelation, MessageStartEventSubscription,
    MessageSubscription, MessageSubscriptionRepository,
};
use crate::state::process_instances::{ProcessInstance, ProcessInstanceRepository};
use crate::state::signal_subscriptions::{SignalSubscription, SignalSubscriptionRepository};
use crate::state::timers::{Timer, TimerRepository};
use crate::state::user_tasks::{UserTask, UserTaskRepository};
use crate::state::variables::{Variable, VariableRepository};
use crate::DbError;
use crate::{DbPool, Result};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde_json::Value;
use std::sync::Arc;

#[cfg(any(feature = "postgres", feature = "sqlite"))]
pub struct SqlxBackend {
    pub pool: Arc<DbPool>,
    /// Set on the backend a unit of work hands out: every statement but the partition
    /// lock and API command appends then runs in this transaction.
    tx: Option<Arc<TxSlot>>,
}

#[cfg(any(feature = "postgres", feature = "sqlite"))]
struct SqlxTxControl(Arc<TxSlot>);

#[cfg(any(feature = "postgres", feature = "sqlite"))]
#[async_trait]
impl TxControl for SqlxTxControl {
    async fn commit(&self) -> Result<()> {
        let tx = self
            .0
            .lock()
            .await
            .take()
            .ok_or(DbError::TransactionClosed)?;
        tx.commit().await?;
        Ok(())
    }

    async fn rollback(&self) -> Result<()> {
        let tx = self
            .0
            .lock()
            .await
            .take()
            .ok_or(DbError::TransactionClosed)?;
        tx.rollback().await?;
        Ok(())
    }
}

#[cfg(any(feature = "postgres", feature = "sqlite"))]
impl SqlxBackend {
    pub fn new(pool: DbPool) -> Self {
        Self {
            pool: Arc::new(pool),
            tx: None,
        }
    }

    fn conn(&self) -> Conn<'_> {
        match &self.tx {
            Some(slot) => Conn::Tx(slot),
            None => Conn::Pool(&self.pool),
        }
    }

    pub fn pool(&self) -> &DbPool {
        &self.pool
    }
}

#[cfg(any(feature = "postgres", feature = "sqlite"))]
#[async_trait]
impl StateBackend for SqlxBackend {
    async fn begin(&self) -> Result<UnitOfWork> {
        if self.tx.is_some() {
            return Err(DbError::Conflict(
                "a unit of work cannot start another one".to_string(),
            ));
        }
        // SQLite: take the write lock up front. A deferred transaction that reads first
        // fails with SQLITE_BUSY instead of waiting when another writer committed since.
        #[cfg(feature = "sqlite")]
        let tx = self.pool.begin_with("BEGIN IMMEDIATE").await?;
        #[cfg(feature = "postgres")]
        let tx = self.pool.begin().await?;
        let slot = Arc::new(TxSlot::new(Some(tx)));
        let state = SqlxBackend {
            pool: self.pool.clone(),
            tx: Some(slot.clone()),
        };
        Ok(UnitOfWork::new(
            Arc::new(state),
            Box::new(SqlxTxControl(slot)),
        ))
    }

    async fn next_key(&self, partition_id: i16) -> Result<i64> {
        crate::records::next_key(self.conn(), partition_id).await
    }

    async fn next_position(&self, partition_id: i16) -> Result<i64> {
        RecordRepository::with_conn(self.conn())
            .next_position(partition_id)
            .await
    }

    async fn next_position_batch(&self, partition_id: i16, count: usize) -> Result<i64> {
        RecordRepository::with_conn(self.conn())
            .next_position_batch(partition_id, count)
            .await
    }

    async fn next_position_and_key(&self, partition_id: i16) -> Result<(i64, i64)> {
        RecordRepository::with_conn(self.conn())
            .next_position_and_key(partition_id)
            .await
    }

    async fn try_acquire_partition_lock(&self, partition_id: i16) -> bool {
        #[cfg(feature = "postgres")]
        {
            match sqlx::query_scalar::<_, bool>("SELECT pg_try_advisory_lock($1::bigint)")
                .bind(partition_id as i64)
                .fetch_one(self.pool.as_ref())
                .await
            {
                Ok(acquired) => acquired,
                Err(e) => {
                    tracing::warn!(
                        "Advisory lock attempt failed for partition {}: {}",
                        partition_id,
                        e
                    );
                    false
                }
            }
        }
        #[cfg(feature = "sqlite")]
        {
            let _ = partition_id;
            true
        }
    }

    async fn insert_record(&self, record: &DbRecord) -> Result<i64> {
        RecordRepository::with_conn(self.conn())
            .insert(record)
            .await
    }

    async fn append_command(
        &self,
        record: DbRecord,
        on_position: Box<dyn FnOnce(i64) + Send>,
    ) -> Result<i64> {
        use sqlx::Row;
        // The row lock on partition_key_state, held until commit, keeps every other
        // position reservation of the partition waiting until the command is written.
        let mut tx = self.pool.begin().await?;
        let row = sqlx::query(
            r#"INSERT INTO partition_key_state (partition_id, next_key, next_position)
               VALUES ($1, 2, 2)
               ON CONFLICT (partition_id) DO UPDATE
                   SET next_key      = partition_key_state.next_key + $2,
                       next_position = partition_key_state.next_position + 1
               RETURNING next_position - 1 AS pos, next_key - 1 AS key"#,
        )
        .bind(record.partition_id)
        .bind(if record.record_key == 0 { 1_i64 } else { 0 })
        .fetch_one(&mut *tx)
        .await?;
        let position: i64 = row.get("pos");
        let key = if record.record_key == 0 {
            row.get("key")
        } else {
            record.record_key
        };
        on_position(position);
        sqlx::query(
            r#"INSERT INTO partition_records
                (partition_id, position, record_type, value_type, intent, record_key, timestamp_ms, payload, source_position, tenant_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#,
        )
        .bind(record.partition_id)
        .bind(position)
        .bind(&record.record_type)
        .bind(&record.value_type)
        .bind(&record.intent)
        .bind(key)
        .bind(record.timestamp_ms)
        .bind(&record.payload)
        .bind(record.source_position)
        .bind(&record.tenant_id)
        .execute(&mut *tx)
        .await?;
        tx.commit().await?;
        Ok(position)
    }

    async fn insert_records_batch(&self, records: &[DbRecord]) -> Result<()> {
        RecordRepository::with_conn(self.conn())
            .insert_batch(records)
            .await
    }

    async fn fetch_commands_from(
        &self,
        partition_id: i16,
        from_position: i64,
        limit: i32,
    ) -> Result<Vec<DbRecord>> {
        RecordRepository::with_conn(self.conn())
            .fetch_commands_from(partition_id, from_position, limit)
            .await
    }

    async fn has_pending_activation(
        &self,
        partition_id: i16,
        after_position: i64,
        field: &str,
        value: &str,
    ) -> Result<bool> {
        #[cfg(feature = "postgres")]
        const FIELD: &str = "payload ->> $3";
        #[cfg(not(feature = "postgres"))]
        const FIELD: &str = "json_extract(payload, '$.' || $3)";
        let sql = format!(
            "SELECT COUNT(*) FROM partition_records
             WHERE partition_id = $1 AND position > $2 AND record_type = 'COMMAND'
               AND value_type = 'PROCESS_INSTANCE' AND intent = 'ACTIVATE_ELEMENT'
               AND {FIELD} = $4"
        );
        // `FIELD` is a backend-specific constant; values are bound.
        let count: i64 = sqlx::query_scalar(sqlx::AssertSqlSafe(sql))
            .bind(partition_id)
            .bind(after_position)
            .bind(field)
            .bind(value)
            .fetch_one(&mut *self.conn().acquire().await?)
            .await?;
        Ok(count > 0)
    }

    async fn get_pending_activations(
        &self,
        partition_id: i16,
        after_position: i64,
        flow_scope_key: &str,
    ) -> Result<Vec<Value>> {
        #[cfg(feature = "postgres")]
        const FIELD: &str = "payload ->> 'flowScopeKey'";
        #[cfg(not(feature = "postgres"))]
        const FIELD: &str = "json_extract(payload, '$.flowScopeKey')";
        let sql = format!(
            "SELECT payload FROM partition_records
             WHERE partition_id = $1 AND position > $2 AND record_type = 'COMMAND'
               AND value_type = 'PROCESS_INSTANCE' AND intent = 'ACTIVATE_ELEMENT'
               AND {FIELD} = $3
             ORDER BY position"
        );
        use sqlx::Row;
        let rows = sqlx::query(sqlx::AssertSqlSafe(sql))
            .bind(partition_id)
            .bind(after_position)
            .bind(flow_scope_key)
            .fetch_all(&mut *self.conn().acquire().await?)
            .await?;
        Ok(rows.into_iter().map(|r| r.get("payload")).collect())
    }

    async fn get_processed_position(&self, partition_id: i16) -> Result<i64> {
        let position: Option<i64> =
            sqlx::query_scalar("SELECT position FROM processed_positions WHERE partition_id = $1")
                .bind(partition_id)
                .fetch_optional(&mut *self.conn().acquire().await?)
                .await?;
        Ok(position.unwrap_or(0))
    }

    async fn set_processed_position(&self, partition_id: i16, position: i64) -> Result<()> {
        sqlx::query(
            "INSERT INTO processed_positions (partition_id, position) VALUES ($1, $2)
             ON CONFLICT (partition_id) DO UPDATE SET position = excluded.position",
        )
        .bind(partition_id)
        .bind(position)
        .execute(&mut *self.conn().acquire().await?)
        .await?;
        Ok(())
    }

    async fn insert_process_instance(&self, pi: &ProcessInstance) -> Result<()> {
        ProcessInstanceRepository::with_conn(self.conn())
            .insert(pi)
            .await
    }

    async fn update_process_instance_state(
        &self,
        key: i64,
        state: &str,
        end_date: Option<DateTime<Utc>>,
    ) -> Result<()> {
        ProcessInstanceRepository::with_conn(self.conn())
            .update_state(key, state, end_date)
            .await
    }

    async fn get_process_instance_by_key(&self, key: i64) -> Result<ProcessInstance> {
        ProcessInstanceRepository::with_conn(self.conn())
            .get_by_key(key)
            .await
    }

    async fn count_active_process_instances(&self) -> Result<i64> {
        ProcessInstanceRepository::with_conn(self.conn())
            .count_active()
            .await
    }

    async fn insert_element_instance(&self, ei: &ElementInstance) -> Result<()> {
        ElementInstanceRepository::with_conn(self.conn())
            .insert(ei)
            .await
    }

    async fn update_element_instance_state(&self, key: i64, state: &str) -> Result<()> {
        ElementInstanceRepository::with_conn(self.conn())
            .update_state(key, state)
            .await
    }

    async fn get_element_instance_by_key(&self, key: i64) -> Result<ElementInstance> {
        ElementInstanceRepository::with_conn(self.conn())
            .get_by_key(key)
            .await
    }

    async fn get_element_instances_by_process_instance(
        &self,
        process_instance_key: i64,
    ) -> Result<Vec<ElementInstance>> {
        ElementInstanceRepository::with_conn(self.conn())
            .get_by_process_instance(process_instance_key)
            .await
    }

    async fn get_active_element_instance_count(&self, process_instance_key: i64) -> Result<i64> {
        ElementInstanceRepository::with_conn(self.conn())
            .get_active_count(process_instance_key)
            .await
    }

    async fn complete_process_element(&self, process_instance_key: i64) -> Result<()> {
        ElementInstanceRepository::with_conn(self.conn())
            .complete_process_element(process_instance_key)
            .await
    }

    async fn upsert_variable(&self, variable: &Variable) -> Result<()> {
        VariableRepository::with_conn(self.conn())
            .upsert(variable)
            .await
    }

    async fn get_variables_by_scope(&self, scope_key: i64) -> Result<Vec<Variable>> {
        VariableRepository::with_conn(self.conn())
            .get_by_scope(scope_key)
            .await
    }

    async fn insert_job(&self, job: &Job) -> Result<()> {
        JobRepository::with_conn(self.conn()).insert(job).await
    }

    async fn get_job_by_key(&self, key: i64) -> Result<Job> {
        JobRepository::with_conn(self.conn()).get_by_key(key).await
    }

    async fn complete_job(&self, key: i64, variables: Option<Value>) -> Result<()> {
        JobRepository::with_conn(self.conn())
            .complete(key, variables)
            .await
    }

    async fn fail_job(
        &self,
        key: i64,
        retries: i32,
        error_message: Option<&str>,
        error_code: Option<&str>,
        retry_back_off_ms: Option<i64>,
    ) -> Result<()> {
        JobRepository::with_conn(self.conn())
            .fail(key, retries, error_message, error_code, retry_back_off_ms)
            .await
    }

    async fn update_job_retries(&self, key: i64, retries: i32) -> Result<()> {
        JobRepository::with_conn(self.conn())
            .update_retries(key, retries)
            .await
    }

    async fn update_job_deadline(&self, key: i64, deadline: DateTime<Utc>) -> Result<()> {
        JobRepository::with_conn(self.conn())
            .update_deadline(key, deadline)
            .await
    }

    async fn cancel_jobs_by_process_instance(&self, process_instance_key: i64) -> Result<u64> {
        crate::state::jobs::cancel_jobs_by_process_instance(self.conn(), process_instance_key).await
    }

    async fn cancel_jobs_by_element_instance(&self, element_instance_key: i64) -> Result<u64> {
        crate::state::jobs::cancel_jobs_by_element_instance(self.conn(), element_instance_key).await
    }

    async fn cancel_element_instance_waits(&self, element_instance_key: i64) -> Result<()> {
        let mut conn = self.conn().acquire().await?;
        sqlx::query("UPDATE timers SET state = 'CANCELED' WHERE element_instance_key = $1 AND state = 'ACTIVE'")
            .bind(element_instance_key)
            .execute(&mut *conn)
            .await?;
        sqlx::query("UPDATE user_tasks SET state = 'CANCELED' WHERE element_instance_key = $1 AND state = 'CREATED'")
            .bind(element_instance_key)
            .execute(&mut *conn)
            .await?;
        sqlx::query(
            "UPDATE message_subscriptions SET state = 'CLOSED' WHERE element_instance_key = $1 AND state IN ('OPENING', 'OPENED')",
        )
        .bind(element_instance_key)
        .execute(&mut *conn)
        .await?;
        sqlx::query("DELETE FROM signal_subscriptions WHERE element_instance_key = $1")
            .bind(element_instance_key)
            .execute(&mut *conn)
            .await?;
        Ok(())
    }

    async fn cancel_catch_waits(
        &self,
        element_instance_key: i64,
        element_ids: &[String],
        message_names: &[String],
    ) -> Result<()> {
        let mut conn = self.conn().acquire().await?;
        for element_id in element_ids {
            sqlx::query(
                "UPDATE timers SET state = 'CANCELED' WHERE element_instance_key = $1 AND element_id = $2 AND state = 'ACTIVE'",
            )
            .bind(element_instance_key)
            .bind(element_id)
            .execute(&mut *conn)
            .await?;
            sqlx::query("DELETE FROM signal_subscriptions WHERE element_instance_key = $1 AND element_id = $2")
                .bind(element_instance_key)
                .bind(element_id)
                .execute(&mut *conn)
                .await?;
        }
        for message_name in message_names {
            sqlx::query(
                "UPDATE message_subscriptions SET state = 'CLOSED'
                 WHERE element_instance_key = $1 AND message_name = $2 AND state IN ('OPENING', 'OPENED')",
            )
            .bind(element_instance_key)
            .bind(message_name)
            .execute(&mut *conn)
            .await?;
        }
        Ok(())
    }

    async fn get_child_process_instance_keys(
        &self,
        parent_element_instance_key: i64,
    ) -> Result<Vec<i64>> {
        let keys = sqlx::query_scalar::<_, i64>(
            "SELECT key FROM process_instances WHERE parent_element_instance_key = $1 AND state = 'ACTIVE'",
        )
        .bind(parent_element_instance_key)
        .fetch_all(&mut *self.conn().acquire().await?)
        .await?;
        Ok(keys)
    }

    async fn mark_timed_out_jobs(&self) -> Result<u64> {
        JobRepository::with_conn(self.conn()).mark_timed_out().await
    }

    async fn count_active_jobs_by_type(&self) -> Result<Vec<(String, i64)>> {
        JobRepository::with_conn(self.conn())
            .count_active_by_type()
            .await
    }

    async fn insert_incident(&self, incident: &Incident) -> Result<()> {
        IncidentRepository::with_conn(self.conn())
            .insert(incident)
            .await
    }

    async fn get_incident_by_key(&self, key: i64) -> Result<Incident> {
        IncidentRepository::with_conn(self.conn())
            .get_by_key(key)
            .await
    }

    async fn resolve_incident(&self, key: i64) -> Result<()> {
        IncidentRepository::with_conn(self.conn())
            .resolve(key)
            .await
    }

    async fn get_incidents_by_process_instance(
        &self,
        process_instance_key: i64,
    ) -> Result<Vec<Incident>> {
        IncidentRepository::with_conn(self.conn())
            .get_by_process_instance(process_instance_key)
            .await
    }

    async fn count_active_incidents(&self) -> Result<i64> {
        IncidentRepository::with_conn(self.conn())
            .count_active()
            .await
    }

    async fn insert_timer(&self, timer: &Timer) -> Result<()> {
        TimerRepository::with_conn(self.conn()).insert(timer).await
    }

    async fn get_timer_by_key(&self, key: i64) -> Result<Timer> {
        TimerRepository::with_conn(self.conn())
            .get_by_key(key)
            .await
    }

    async fn update_timer_state(&self, key: i64, state: &str) -> Result<()> {
        TimerRepository::with_conn(self.conn())
            .update_state(key, state)
            .await
    }

    async fn get_due_timers(&self, now: DateTime<Utc>, limit: i64) -> Result<Vec<Timer>> {
        TimerRepository::with_conn(self.conn())
            .get_due(now, limit)
            .await
    }

    async fn cancel_start_timers(&self, process_definition_key: i64) -> Result<()> {
        sqlx::query(
            "UPDATE timers SET state = 'CANCELED'
             WHERE process_definition_key = $1 AND element_instance_key IS NULL AND state = 'ACTIVE'",
        )
        .bind(process_definition_key)
        .execute(&mut *self.conn().acquire().await?)
        .await?;
        Ok(())
    }

    async fn insert_message(&self, msg: &Message) -> Result<()> {
        MessageRepository::with_conn(self.conn()).insert(msg).await
    }

    async fn get_messages_by_correlation(
        &self,
        name: &str,
        correlation_key: &str,
        tenant_id: &str,
    ) -> Result<Vec<Message>> {
        MessageRepository::with_conn(self.conn())
            .get_by_correlation(name, correlation_key, tenant_id)
            .await
    }

    async fn expire_old_messages(&self) -> Result<u64> {
        MessageRepository::with_conn(self.conn()).expire_old().await
    }

    async fn insert_message_subscription(&self, sub: &MessageSubscription) -> Result<()> {
        MessageSubscriptionRepository::with_conn(self.conn())
            .insert(sub)
            .await
    }

    async fn get_message_subscriptions_by_correlation(
        &self,
        message_name: &str,
        correlation_key: &str,
        tenant_id: &str,
    ) -> Result<Vec<MessageSubscription>> {
        MessageSubscriptionRepository::with_conn(self.conn())
            .get_by_correlation(message_name, correlation_key, tenant_id)
            .await
    }

    async fn update_message_subscription_state(&self, key: i64, state: &str) -> Result<()> {
        MessageSubscriptionRepository::with_conn(self.conn())
            .update_state(key, state)
            .await
    }

    async fn replace_message_start_subscriptions(
        &self,
        bpmn_process_id: &str,
        tenant_id: &str,
        subs: &[MessageStartEventSubscription],
    ) -> Result<()> {
        // A savepoint inside a unit of work, a transaction of its own otherwise.
        let mut conn = self.conn().acquire().await?;
        let mut tx = sqlx::Connection::begin(&mut *conn).await?;
        sqlx::query("DELETE FROM message_start_event_subscriptions WHERE bpmn_process_id = $1 AND tenant_id = $2")
            .bind(bpmn_process_id)
            .bind(tenant_id)
            .execute(&mut *tx)
            .await?;
        for sub in subs {
            sqlx::query(
                "INSERT INTO message_start_event_subscriptions
                 (key, message_name, bpmn_process_id, start_event_id, process_definition_key, tenant_id)
                 VALUES ($1, $2, $3, $4, $5, $6)",
            )
            .bind(sub.key)
            .bind(&sub.message_name)
            .bind(&sub.bpmn_process_id)
            .bind(&sub.start_event_id)
            .bind(sub.process_definition_key)
            .bind(&sub.tenant_id)
            .execute(&mut *tx)
            .await?;
        }
        tx.commit().await?;
        Ok(())
    }

    async fn get_message_start_subscriptions_by_name(
        &self,
        message_name: &str,
        tenant_id: &str,
    ) -> Result<Vec<MessageStartEventSubscription>> {
        let rows = sqlx::query(
            "SELECT key, message_name, bpmn_process_id, start_event_id, process_definition_key, tenant_id
             FROM message_start_event_subscriptions WHERE message_name = $1 AND tenant_id = $2 ORDER BY key",
        )
        .bind(message_name)
        .bind(tenant_id)
        .fetch_all(&mut *self.conn().acquire().await?)
        .await?;
        Ok(rows.into_iter().map(row_to_start_sub).collect())
    }

    async fn get_message_start_subscriptions_by_process(
        &self,
        bpmn_process_id: &str,
        tenant_id: &str,
    ) -> Result<Vec<MessageStartEventSubscription>> {
        let rows = sqlx::query(
            "SELECT key, message_name, bpmn_process_id, start_event_id, process_definition_key, tenant_id
             FROM message_start_event_subscriptions WHERE bpmn_process_id = $1 AND tenant_id = $2 ORDER BY key",
        )
        .bind(bpmn_process_id)
        .bind(tenant_id)
        .fetch_all(&mut *self.conn().acquire().await?)
        .await?;
        Ok(rows.into_iter().map(row_to_start_sub).collect())
    }

    async fn insert_message_start_correlation(&self, c: &MessageStartCorrelation) -> Result<()> {
        sqlx::query(
            "INSERT INTO message_start_correlations
             (process_instance_key, message_key, bpmn_process_id, correlation_key, tenant_id)
             VALUES ($1, $2, $3, $4, $5)",
        )
        .bind(c.process_instance_key)
        .bind(c.message_key)
        .bind(&c.bpmn_process_id)
        .bind(&c.correlation_key)
        .bind(&c.tenant_id)
        .execute(&mut *self.conn().acquire().await?)
        .await?;
        Ok(())
    }

    async fn get_message_start_correlations(
        &self,
        bpmn_process_id: &str,
        correlation_key: &str,
        tenant_id: &str,
    ) -> Result<Vec<MessageStartCorrelation>> {
        let rows = sqlx::query(
            "SELECT process_instance_key, message_key, bpmn_process_id, correlation_key, tenant_id
             FROM message_start_correlations
             WHERE bpmn_process_id = $1 AND correlation_key = $2 AND tenant_id = $3",
        )
        .bind(bpmn_process_id)
        .bind(correlation_key)
        .bind(tenant_id)
        .fetch_all(&mut *self.conn().acquire().await?)
        .await?;
        Ok(rows.into_iter().map(row_to_start_correlation).collect())
    }

    async fn get_message_start_correlation_by_instance(
        &self,
        process_instance_key: i64,
    ) -> Result<Option<MessageStartCorrelation>> {
        let row = sqlx::query(
            "SELECT process_instance_key, message_key, bpmn_process_id, correlation_key, tenant_id
             FROM message_start_correlations WHERE process_instance_key = $1",
        )
        .bind(process_instance_key)
        .fetch_optional(&mut *self.conn().acquire().await?)
        .await?;
        Ok(row.map(row_to_start_correlation))
    }

    async fn insert_signal_subscription(&self, sub: &SignalSubscription) -> Result<()> {
        SignalSubscriptionRepository::with_conn(self.conn())
            .insert(sub)
            .await
    }

    async fn get_signal_subscriptions_by_name(
        &self,
        signal_name: &str,
        tenant_id: &str,
    ) -> Result<Vec<SignalSubscription>> {
        SignalSubscriptionRepository::with_conn(self.conn())
            .get_by_signal_name(signal_name, tenant_id)
            .await
    }

    async fn delete_signal_subscription(&self, key: i64) -> Result<()> {
        SignalSubscriptionRepository::with_conn(self.conn())
            .delete(key)
            .await
    }

    async fn add_join_token(
        &self,
        process_instance_key: i64,
        flow_scope_key: i64,
        gateway_id: &str,
        sequence_flow_id: &str,
    ) -> Result<()> {
        JoinTokenRepository::with_conn(self.conn())
            .add(
                process_instance_key,
                flow_scope_key,
                gateway_id,
                sequence_flow_id,
            )
            .await
    }

    async fn take_join_token(
        &self,
        flow_scope_key: i64,
        gateway_id: &str,
        sequence_flow_id: &str,
    ) -> Result<()> {
        JoinTokenRepository::with_conn(self.conn())
            .take(flow_scope_key, gateway_id, sequence_flow_id)
            .await
    }

    async fn get_join_tokens(&self, process_instance_key: i64) -> Result<Vec<JoinToken>> {
        JoinTokenRepository::with_conn(self.conn())
            .get_by_process_instance(process_instance_key)
            .await
    }

    async fn delete_join_tokens(&self, flow_scope_key: i64) -> Result<()> {
        JoinTokenRepository::with_conn(self.conn())
            .delete_by_flow_scope(flow_scope_key)
            .await
    }

    async fn upsert_compensation_subscription(&self, sub: &CompensationSubscription) -> Result<()> {
        CompensationSubscriptionRepository::with_conn(self.conn())
            .upsert(sub)
            .await
    }

    async fn get_compensation_subscriptions(
        &self,
        process_instance_key: i64,
    ) -> Result<Vec<CompensationSubscription>> {
        CompensationSubscriptionRepository::with_conn(self.conn())
            .get_by_process_instance(process_instance_key)
            .await
    }

    async fn delete_compensation_subscription(&self, key: i64) -> Result<()> {
        CompensationSubscriptionRepository::with_conn(self.conn())
            .delete(key)
            .await
    }

    async fn insert_deployment(&self, deployment: &Deployment) -> Result<()> {
        DeploymentRepository::with_conn(self.conn())
            .insert_deployment(deployment)
            .await
    }

    async fn insert_process_definition(&self, pd: &ProcessDefinition) -> Result<()> {
        DeploymentRepository::with_conn(self.conn())
            .insert_process_definition(pd)
            .await
    }

    async fn get_process_definition_by_key(&self, key: i64) -> Result<ProcessDefinition> {
        DeploymentRepository::with_conn(self.conn())
            .get_process_definition_by_key(key)
            .await
    }

    async fn get_latest_process_definition(
        &self,
        bpmn_process_id: &str,
        tenant_id: &str,
    ) -> Result<ProcessDefinition> {
        DeploymentRepository::with_conn(self.conn())
            .get_latest_process_definition(bpmn_process_id, tenant_id)
            .await
    }

    async fn get_process_definition_by_id_and_version(
        &self,
        bpmn_process_id: &str,
        version: i32,
        tenant_id: &str,
    ) -> Result<ProcessDefinition> {
        DeploymentRepository::with_conn(self.conn())
            .get_by_id_and_version(bpmn_process_id, version, tenant_id)
            .await
    }

    async fn insert_user_task(&self, task: &UserTask) -> Result<()> {
        UserTaskRepository::with_conn(self.conn())
            .insert(task)
            .await
    }

    async fn get_user_task_by_key(&self, key: i64) -> Result<UserTask> {
        UserTaskRepository::with_conn(self.conn())
            .get_by_key(key)
            .await
    }

    async fn complete_user_task(&self, key: i64, variables: Option<Value>) -> Result<()> {
        UserTaskRepository::with_conn(self.conn())
            .complete(key, variables)
            .await
    }

    async fn assign_user_task(&self, key: i64, assignee: Option<&str>) -> Result<()> {
        UserTaskRepository::with_conn(self.conn())
            .assign(key, assignee)
            .await
    }

    async fn insert_tenant(&self, tenant: &Tenant) -> Result<()> {
        TenantRepository::with_conn(self.conn())
            .insert(tenant)
            .await
    }

    async fn insert_user(&self, user: &User) -> Result<()> {
        UserRepository::with_conn(self.conn()).insert(user).await
    }

    async fn delete_user(&self, username: &str) -> Result<()> {
        UserRepository::with_conn(self.conn())
            .delete(username)
            .await
    }

    async fn insert_decision_requirements(&self, drg: &DecisionRequirements) -> Result<()> {
        DecisionRepository::with_conn(self.conn())
            .insert_requirements(drg)
            .await
    }

    async fn get_latest_decision_requirements(
        &self,
        drg_id: &str,
        tenant_id: &str,
    ) -> Result<Option<DecisionRequirements>> {
        DecisionRepository::with_conn(self.conn())
            .latest_requirements(drg_id, tenant_id)
            .await
    }

    async fn insert_decision_definition(&self, decision: &DecisionDefinition) -> Result<()> {
        DecisionRepository::with_conn(self.conn())
            .insert_decision(decision)
            .await
    }

    async fn get_latest_decision_definition(
        &self,
        decision_id: &str,
        tenant_id: &str,
    ) -> Result<Option<DecisionDefinition>> {
        DecisionRepository::with_conn(self.conn())
            .latest_decision(decision_id, tenant_id)
            .await
    }

    async fn get_decision_definition_by_key(&self, key: i64) -> Result<Option<DecisionDefinition>> {
        DecisionRepository::with_conn(self.conn())
            .decision_by_key(key)
            .await
    }
}

#[cfg(any(feature = "postgres", feature = "sqlite"))]
fn row_to_start_sub(r: crate::DbRow) -> MessageStartEventSubscription {
    use sqlx::Row;
    MessageStartEventSubscription {
        key: r.get("key"),
        message_name: r.get("message_name"),
        bpmn_process_id: r.get("bpmn_process_id"),
        start_event_id: r.get("start_event_id"),
        process_definition_key: r.get("process_definition_key"),
        tenant_id: r.get("tenant_id"),
    }
}

#[cfg(any(feature = "postgres", feature = "sqlite"))]
fn row_to_start_correlation(r: crate::DbRow) -> MessageStartCorrelation {
    use sqlx::Row;
    MessageStartCorrelation {
        process_instance_key: r.get("process_instance_key"),
        message_key: r.get("message_key"),
        bpmn_process_id: r.get("bpmn_process_id"),
        correlation_key: r.get("correlation_key"),
        tenant_id: r.get("tenant_id"),
    }
}
