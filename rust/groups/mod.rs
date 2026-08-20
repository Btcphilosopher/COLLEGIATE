pub mod groups;
pub mod members;
pub mod posts;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Group {
    pub id: Uuid,
    pub university_id: Uuid,
    pub name: String,
    pub description: String,
    pub category: String, // ACADEMIC, SOCIETY, SPORTS, ARTS, GREEK_LIFE, STUDY_GROUP
    pub privacy: String,  // OPEN, CLOSED, SECRET
    pub cover_image: Option<String>,
    pub member_count: i32,
    pub created_by: Uuid,
    pub created_at: DateTime<Utc>,
}
