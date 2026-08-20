use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Notification {
    pub id: Uuid,
    pub user_id: Uuid,
    pub actor_id: Uuid,
    pub notification_type: String, // FRIEND_REQUEST, FRIEND_ACCEPTED, POST_REACTION, POST_COMMENT, GROUP_INVITE, EVENT_REMINDER, MENTION
    pub title: String,
    pub content: String,
    pub resource_type: String,
    pub resource_id: Option<Uuid>,
    pub is_read: bool,
    pub created_at: DateTime<Utc>,
}
