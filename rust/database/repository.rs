use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryOptions {
    pub limit: i64,
    pub offset: i64,
    pub order_by: Option<String>,
}

impl Default for QueryOptions {
    fn default() -> Self {
        Self {
            limit: 25,
            offset: 0,
            order_by: Some("created_at DESC".to_string()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResult<T> {
    pub data: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub limit: i64,
}
