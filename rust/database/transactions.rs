use sqlx::{Postgres, Transaction};
use super::connection::{DatabaseError, DatabasePool};

pub async fn begin_transaction(pool: &DatabasePool) -> Result<Transaction<'static, Postgres>, DatabaseError> {
    pool.get_pool()
        .begin()
        .await
        .map_err(DatabaseError::Pool)
}
