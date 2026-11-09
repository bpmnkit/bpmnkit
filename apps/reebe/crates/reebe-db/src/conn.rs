//! A connection that is either taken from the pool for one statement or shared with
//! the open transaction of a unit of work, so the repositories serve both without
//! duplicating their SQL.

use crate::pool::DbPool;
use crate::{DbError, Result};
use std::ops::{Deref, DerefMut};
use tokio::sync::{Mutex, MutexGuard};

#[cfg(feature = "postgres")]
pub type Db = sqlx::Postgres;
#[cfg(feature = "sqlite")]
pub type Db = sqlx::Sqlite;

pub type DbConnection = <Db as sqlx::Database>::Connection;
pub type DbTransaction = sqlx::Transaction<'static, Db>;

/// The transaction of a unit of work. `None` once it has been committed or rolled back.
pub type TxSlot = Mutex<Option<DbTransaction>>;

/// Where a repository runs its statements.
#[derive(Clone, Copy)]
pub enum Conn<'a> {
    /// Each statement takes a pooled connection and commits on its own.
    Pool(&'a DbPool),
    /// Every statement runs inside the unit of work's transaction.
    Tx(&'a TxSlot),
}

impl<'a> From<&'a DbPool> for Conn<'a> {
    fn from(pool: &'a DbPool) -> Self {
        Conn::Pool(pool)
    }
}

pub enum ConnGuard<'a> {
    Pooled(sqlx::pool::PoolConnection<Db>),
    Tx(MutexGuard<'a, Option<DbTransaction>>),
}

impl<'a> Conn<'a> {
    pub async fn acquire(self) -> Result<ConnGuard<'a>> {
        match self {
            Conn::Pool(pool) => Ok(ConnGuard::Pooled(pool.acquire().await?)),
            Conn::Tx(slot) => {
                let guard = slot.lock().await;
                if guard.is_none() {
                    return Err(DbError::TransactionClosed);
                }
                Ok(ConnGuard::Tx(guard))
            }
        }
    }
}

impl Deref for ConnGuard<'_> {
    type Target = DbConnection;
    fn deref(&self) -> &DbConnection {
        match self {
            ConnGuard::Pooled(conn) => conn,
            // `acquire` only hands out a guard over an open transaction.
            ConnGuard::Tx(tx) => tx.as_ref().expect("open transaction"),
        }
    }
}

impl DerefMut for ConnGuard<'_> {
    fn deref_mut(&mut self) -> &mut DbConnection {
        match self {
            ConnGuard::Pooled(conn) => conn,
            ConnGuard::Tx(tx) => tx.as_mut().expect("open transaction"),
        }
    }
}
