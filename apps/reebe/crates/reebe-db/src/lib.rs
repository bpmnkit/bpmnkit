pub mod backend;
#[cfg(any(feature = "postgres", feature = "sqlite"))]
pub mod compat;
#[cfg(any(feature = "postgres", feature = "sqlite"))]
pub mod conn;
pub mod error;
#[cfg(any(feature = "postgres", feature = "sqlite"))]
pub mod pool;
pub mod records;
pub mod state;

#[cfg(any(feature = "postgres", feature = "sqlite"))]
pub mod sqlx_backend;

#[cfg(feature = "memory")]
pub mod memory_backend;

pub use backend::{StateBackend, TxControl, UnitOfWork};
#[cfg(any(feature = "postgres", feature = "sqlite"))]
pub use compat::DbRow;
pub use error::DbError;
#[cfg(feature = "memory")]
pub use memory_backend::InMemoryBackend;
#[cfg(any(feature = "postgres", feature = "sqlite"))]
pub use pool::{create_pool, DbConfig, DbPool};
#[cfg(any(feature = "postgres", feature = "sqlite"))]
pub use sqlx_backend::SqlxBackend;

pub type Result<T> = std::result::Result<T, DbError>;
