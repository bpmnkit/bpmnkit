//! Each processed command is one database transaction: its state writes, the records it
//! appends and the processed position commit together, or not at all.
//!
//! Write transactions are counted with a row trigger on every engine table that logs
//! the writing transaction's id, so the count is exact and ignores read-only statements
//! (which `pg_stat_database.xact_commit` would include) and other test databases.

mod common;

use base64::Engine as _;
use reebe_db::DbPool;
use reebe_engine::{EngineHandle, RealClock};
use sqlx::Executor;
use std::sync::Arc;
use std::time::Duration;

const PROCESS_BPMN: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="uow-process" isExecutable="true">
    <bpmn:startEvent id="start">
      <bpmn:outgoing>f1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:serviceTask id="task">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="uow-job"/>
      </bpmn:extensionElements>
      <bpmn:incoming>f1</bpmn:incoming>
      <bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="end">
      <bpmn:incoming>f2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="task"/>
    <bpmn:sequenceFlow id="f2" sourceRef="task" targetRef="end"/>
  </bpmn:process>
</bpmn:definitions>"#;

/// Log the id of every transaction that writes a row of an engine table.
const LOG_WRITE_TRANSACTIONS: &str = r#"
CREATE TABLE xact_log (xid xid8 PRIMARY KEY);
CREATE FUNCTION log_xact() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO xact_log VALUES (pg_current_xact_id()) ON CONFLICT DO NOTHING;
    RETURN NULL;
END $$;
DO $$
DECLARE t record;
BEGIN
    FOR t IN
        SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relispartition
          AND c.relname NOT IN ('xact_log', '_sqlx_migrations')
    LOOP
        EXECUTE format(
            'CREATE TRIGGER log_xact AFTER INSERT OR UPDATE OR DELETE ON %I
             FOR EACH ROW EXECUTE FUNCTION log_xact()', t.relname);
    END LOOP;
END $$;
"#;

#[tokio::test]
async fn each_processed_command_is_one_transaction() {
    let Some(pool) = common::setup_db(5).await else {
        eprintln!("REEBE_DATABASE__URL not set — skipping");
        return;
    };
    pool.execute(LOG_WRITE_TRANSACTIONS)
        .await
        .expect("install the transaction log");
    let handle = &common::start_engine(pool.clone());

    deploy(handle).await;
    create_instance(handle).await;
    let job_key = wait_for_job(&pool).await.expect("the service task's job");
    complete_job(handle, job_key).await;
    wait_until_all_processed(&pool).await;

    let write_transactions: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM xact_log")
        .fetch_one(&pool)
        .await
        .unwrap();
    let (commands, appended): (i64, i64) = sqlx::query_as(
        "SELECT COUNT(*), COUNT(*) FILTER (WHERE source_position IS NULL)
         FROM partition_records WHERE record_type = 'COMMAND'",
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    eprintln!(
        "{write_transactions} write transactions: {appended} API appends, \
         {commands} commands processed"
    );
    assert!(commands > appended, "the instance ran follow-up commands");
    // One transaction per API append, and one per processed command, follow-ups included.
    assert_eq!(write_transactions, appended + commands);
}

#[tokio::test]
async fn a_failing_command_leaves_no_partial_state() {
    let Some(pool) = common::setup_db(5).await else {
        eprintln!("REEBE_DATABASE__URL not set — skipping");
        return;
    };
    // Fail the last write of the unit that activates the service task: its element
    // instance and appended records are written by then. The check sees the element
    // instance only inside that unit, so the position written when the command is
    // skipped afterwards succeeds.
    pool.execute(
        r#"CREATE FUNCTION fail_task_position() RETURNS trigger LANGUAGE plpgsql AS $$
           BEGIN
               IF EXISTS (SELECT 1 FROM element_instances WHERE element_id = 'task') THEN
                   RAISE EXCEPTION 'injected failure';
               END IF;
               RETURN NEW;
           END $$;
           CREATE TRIGGER fail_task_position BEFORE INSERT OR UPDATE ON processed_positions
           FOR EACH ROW EXECUTE FUNCTION fail_task_position();"#,
    )
    .await
    .expect("install the failing trigger");
    let engine = common::start_engine_with_clock(pool.clone(), Arc::new(RealClock));
    let handle = &engine.handle;

    deploy(handle).await;
    let first = create_instance(handle).await;
    wait_until_all_processed(&pool).await;

    let task_instances: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM element_instances
         WHERE process_instance_key = $1 AND element_id = 'task'",
    )
    .bind(first)
    .fetch_one(&pool)
    .await
    .unwrap();
    assert_eq!(
        task_instances, 0,
        "the failed activation's element instance must be rolled back"
    );
    let task_records: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM partition_records r
         WHERE r.source_position = (
             SELECT position FROM partition_records
             WHERE intent = 'ACTIVATE_ELEMENT' AND payload->>'elementId' = 'task')",
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    assert_eq!(
        task_records, 0,
        "the failed command's events and follow-up commands must be rolled back"
    );

    // The engine moved past the failed command and processes the next ones.
    pool.execute("DROP TRIGGER fail_task_position ON processed_positions")
        .await
        .unwrap();
    create_instance(handle).await;
    let job = wait_for_job(&pool).await;
    assert!(job.is_some(), "the engine keeps processing after a failure");
    engine.stop();
}

async fn deploy(handle: &EngineHandle) {
    handle
        .send_command(
            "DEPLOYMENT".to_string(),
            "CREATE".to_string(),
            serde_json::json!({
                "resources": [{
                    "name": "uow.bpmn",
                    "content": base64::engine::general_purpose::STANDARD.encode(PROCESS_BPMN),
                }]
            }),
            "<default>".to_string(),
        )
        .await
        .expect("deployment");
}

async fn create_instance(handle: &EngineHandle) -> i64 {
    let resp = handle
        .send_command(
            "PROCESS_INSTANCE_CREATION".to_string(),
            "CREATE".to_string(),
            serde_json::json!({ "bpmnProcessId": "uow-process", "version": -1, "variables": {} }),
            "<default>".to_string(),
        )
        .await
        .expect("instance creation");
    resp["processInstanceKey"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .expect("processInstanceKey")
}

async fn complete_job(handle: &EngineHandle, key: i64) {
    handle
        .send_command(
            "JOB".to_string(),
            "COMPLETE".to_string(),
            serde_json::json!({ "jobKey": key.to_string(), "variables": {} }),
            "<default>".to_string(),
        )
        .await
        .expect("job completion");
}

async fn wait_for_job(pool: &DbPool) -> Option<i64> {
    for _ in 0..100 {
        let key: Option<i64> =
            sqlx::query_scalar("SELECT key FROM jobs WHERE job_type = 'uow-job' LIMIT 1")
                .fetch_optional(pool)
                .await
                .unwrap();
        if key.is_some() {
            return key;
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
    None
}

/// Wait until the engine has processed every command in the log.
async fn wait_until_all_processed(pool: &DbPool) {
    let mut last = (-1, -1);
    let mut stable = 0;
    for _ in 0..200 {
        let now: (i64, i64) = sqlx::query_as(
            "SELECT COALESCE((SELECT MAX(position) FROM partition_records
                              WHERE record_type = 'COMMAND'), 0),
                    COALESCE((SELECT position FROM processed_positions), 0)",
        )
        .fetch_one(pool)
        .await
        .unwrap();
        // Settled: everything processed, and no new command for a few polls.
        stable = if now.0 == now.1 && now == last {
            stable + 1
        } else {
            0
        };
        if stable >= 3 {
            return;
        }
        last = now;
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    panic!("the engine did not process every command: {last:?}");
}
