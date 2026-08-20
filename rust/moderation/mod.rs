use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ModerationReport {
    pub id: Uuid,
    pub reporter_id: Uuid,
    pub target_type: String, // USER, POST, COMMENT, PHOTO, GROUP, MESSAGE
    pub target_id: Uuid,
    pub reason: String,      // HARASSMENT, SPAM, ACADEMIC_DISHONESTY, INAPPROPRIATE, IMPERSONATION
    pub details: Option<String>,
    pub status: String,      // PENDING, RESOLVED, DISMISSED
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AuditLog {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub action: String,
    pub resource: String,
    pub ip_address: Option<String>,
    pub timestamp: DateTime<Utc>,
}
