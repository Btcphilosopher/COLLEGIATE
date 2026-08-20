use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub q: String,
    pub university_id: Option<Uuid>,
    pub department_id: Option<Uuid>,
    pub graduation_year: Option<i32>,
    pub category: Option<String>, // "all", "students", "alumni", "faculty", "courses", "groups"
    pub limit: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub users: Vec<super::identity::profiles::UserSummary>,
    pub courses: Vec<super::universities::Course>,
    pub groups: Vec<super::groups::Group>,
    pub posts: Vec<super::posts::Post>,
}
