pub mod comments;
pub mod mentions;
pub mod posts;
pub mod reactions;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Post {
    pub id: Uuid,
    pub author_id: Uuid,
    pub university_id: Uuid,
    pub group_id: Option<Uuid>,
    pub content: String,
    pub media_urls: Vec<String>,
    pub visibility: String, // PUBLIC, FRIENDS, UNIVERSITY, GROUP, PRIVATE
    pub reactions_count: i32,
    pub comments_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Comment {
    pub id: Uuid,
    pub post_id: Uuid,
    pub author_id: Uuid,
    pub content: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reaction {
    pub post_id: Uuid,
    pub user_id: Uuid,
    pub reaction_type: String, // LIKE, LOVE, ACADEMIC_INSIGHT, CELEBRATE
    pub created_at: DateTime<Utc>,
}
