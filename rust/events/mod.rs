pub mod attendees;
pub mod events;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Event {
    pub id: Uuid,
    pub university_id: Uuid,
    pub organizer_id: Uuid,
    pub group_id: Option<Uuid>,
    pub title: String,
    pub description: String,
    pub location: String,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub category: String, // LECTURE, COLLOQUIUM, SOCIAL, EXAM_REVIEW, ATHLETICS
    pub attendee_count: i32,
    pub created_at: DateTime<Utc>,
}
