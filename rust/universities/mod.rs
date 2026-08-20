pub mod courses;
pub mod departments;
pub mod universities;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct University {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub domain: String,
    pub crest_url: Option<String>,
    pub motto: Option<String>,
    pub location: String,
    pub established_year: i32,
    pub total_students: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Department {
    pub id: Uuid,
    pub university_id: Uuid,
    pub name: String,
    pub code: String,
    pub faculty_head: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Course {
    pub id: Uuid,
    pub department_id: Uuid,
    pub code: String,
    pub title: String,
    pub term: String,
    pub credits: i32,
    pub instructor: String,
    pub enrollment_count: i32,
}
