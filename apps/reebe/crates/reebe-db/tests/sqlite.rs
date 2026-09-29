//! The SQLite (embedded) backend against its own migrations.
//!
//! The integration suites run on PostgreSQL only, so SQL that PostgreSQL
//! accepts and SQLite rejects went unnoticed. Run with
//! `cargo test -p reebe-db --no-default-features --features sqlite`.
#![cfg(feature = "sqlite")]

use chrono::{Duration, Utc};
use reebe_db::state::batch_operations::{BatchOperation, BatchOperationRepository};
use reebe_db::state::incidents::{Incident, IncidentRepository};
use reebe_db::state::user_tasks::{UserTask, UserTaskRepository};
use reebe_db::state::messages::{
    Message, MessageRepository, MessageSubscription, MessageSubscriptionRepository,
};
use reebe_db::{create_pool, pool::run_migrations, DbConfig, DbPool};

/// A fresh in-memory database. One connection, since each in-memory
/// connection would otherwise be a database of its own.
async fn pool() -> DbPool {
    let pool = create_pool(&DbConfig {
        url: "sqlite::memory:".to_string(),
        max_connections: 1,
        min_connections: 1,
        connection_timeout_secs: 5,
    })
    .await
    .expect("open in-memory SQLite");
    run_migrations(&pool).await.expect("migrations");
    pool
}

fn message(key: i64, expires_in: Duration) -> Message {
    Message {
        key,
        name: "ci-passed".to_string(),
        correlation_key: "42".to_string(),
        time_to_live_ms: expires_in.num_milliseconds(),
        expires_at: Utc::now() + expires_in,
        variables: serde_json::json!({}),
        state: "PUBLISHED".to_string(),
        tenant_id: "<default>".to_string(),
        created_at: Utc::now(),
    }
}

#[tokio::test]
async fn message_subscription_opens() {
    let pool = pool().await;
    let repo = MessageSubscriptionRepository::new(&pool);
    repo.insert(&MessageSubscription {
        key: 1,
        message_name: "ci-passed".to_string(),
        correlation_key: "42".to_string(),
        process_instance_key: 10,
        element_instance_key: 11,
        state: "OPEN".to_string(),
        tenant_id: "<default>".to_string(),
    })
    .await
    .expect("insert subscription");
    let found = repo.get_by_correlation("ci-passed", "42", "<default>").await.unwrap();
    assert_eq!(found.len(), 1);
    assert_eq!(found[0].element_instance_key, 11);
}

#[tokio::test]
async fn buffered_messages_are_found_until_they_expire() {
    let pool = pool().await;
    let repo = MessageRepository::new(&pool);
    repo.insert(&message(1, Duration::minutes(5))).await.unwrap();
    repo.insert(&message(2, Duration::milliseconds(-1))).await.unwrap();

    let live = repo.get_by_correlation("ci-passed", "42", "<default>").await.unwrap();
    assert_eq!(live.iter().map(|m| m.key).collect::<Vec<_>>(), vec![1]);
    assert_eq!(repo.expire_old().await.unwrap(), 1);
}

#[tokio::test]
async fn resolving_an_incident_stamps_the_time() {
    let pool = pool().await;
    let repo = IncidentRepository::new(&pool);
    repo.insert(&Incident {
        key: 1,
        partition_id: 1,
        process_instance_key: 10,
        process_definition_key: 20,
        element_instance_key: 11,
        element_id: "task".to_string(),
        error_type: "JOB_NO_RETRIES".to_string(),
        error_message: None,
        state: "ACTIVE".to_string(),
        job_key: None,
        created_at: Utc::now(),
        resolved_at: None,
        tenant_id: "<default>".to_string(),
    })
    .await
    .unwrap();
    repo.resolve(1).await.expect("resolve");
    let incident = repo.get_by_key(1).await.unwrap();
    assert_eq!(incident.state, "RESOLVED");
    assert!(incident.resolved_at.is_some());
}

#[tokio::test]
async fn completing_a_batch_operation_stamps_the_time() {
    let pool = pool().await;
    let repo = BatchOperationRepository::new(&pool);
    repo.insert(&BatchOperation {
        key: 1,
        operation_type: "CANCEL_PROCESS_INSTANCE".to_string(),
        state: "ACTIVE".to_string(),
        items_count: 0,
        completed_items: 0,
        failed_items: 0,
        error_message: None,
        created_at: Utc::now(),
        completed_at: None,
    })
    .await
    .unwrap();
    repo.mark_completed(1).await.expect("mark completed");
    let op = repo.get_by_key(1).await.unwrap();
    assert_eq!(op.state, "COMPLETED");
    assert!(op.completed_at.is_some());
}

fn user_task(key: i64, candidate_groups: Option<Vec<String>>) -> UserTask {
    UserTask {
        key,
        partition_id: 1,
        process_instance_key: 10,
        process_definition_key: 20,
        element_instance_key: 11,
        bpmn_process_id: "order".to_string(),
        element_id: "approve".to_string(),
        state: "CREATED".to_string(),
        assignee: None,
        candidate_groups,
        candidate_users: None,
        due_date: None,
        follow_up_date: None,
        form_key: None,
        custom_headers: serde_json::json!({}),
        variables: serde_json::json!({}),
        created_at: Utc::now(),
        completed_at: None,
        tenant_id: "<default>".to_string(),
    }
}

#[tokio::test]
async fn user_tasks_with_and_without_candidates_round_trip() {
    let pool = pool().await;
    let repo = UserTaskRepository::new(&pool);
    repo.insert(&user_task(1, None)).await.expect("insert without candidates");
    repo.insert(&user_task(2, Some(vec!["leads".to_string()]))).await.unwrap();

    assert_eq!(repo.get_by_key(1).await.unwrap().candidate_groups, None);
    assert_eq!(
        repo.get_by_key(2).await.unwrap().candidate_groups,
        Some(vec!["leads".to_string()])
    );
    repo.complete(1, None).await.expect("complete");
    assert_eq!(repo.get_by_key(1).await.unwrap().state, "COMPLETED");
}
