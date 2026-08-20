use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub display_name: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub university_id: Uuid,
    pub department_id: Option<Uuid>,
    pub course_id: Option<Uuid>,
    pub graduation_year: i32,
    pub location: Option<String>,
    pub biography: Option<String>,
    pub profile_photo: Option<String>,
    pub is_verified: bool,
    pub is_online: bool,
    pub role: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserDto {
    pub username: String,
    pub display_name: String,
    pub email: String,
    pub password: String,
    pub university_id: Uuid,
    pub department_id: Option<Uuid>,
    pub course_id: Option<Uuid>,
    pub graduation_year: i32,
    pub biography: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUserDto {
    pub display_name: Option<String>,
    pub biography: Option<String>,
    pub location: Option<String>,
    pub profile_photo: Option<String>,
    pub graduation_year: Option<i32>,
    pub department_id: Option<Uuid>,
    pub course_id: Option<Uuid>,
}
