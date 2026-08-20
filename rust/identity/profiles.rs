use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use super::users::User;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetailedProfile {
    pub user: User,
    pub university_name: String,
    pub department_name: Option<String>,
    pub course_name: Option<String>,
    pub friends_count: usize,
    pub mutual_friends_count: usize,
    pub mutual_friends: Vec<UserSummary>,
    pub recent_photos: Vec<String>,
    pub friendship_status: FriendshipStatus,
    pub privacy: ProfilePrivacy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSummary {
    pub id: Uuid,
    pub username: String,
    pub display_name: String,
    pub profile_photo: Option<String>,
    pub university_name: String,
    pub graduation_year: i32,
    pub major: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FriendshipStatus {
    SelfUser,
    Friends,
    PendingIncoming,
    PendingOutgoing,
    None,
    Blocked,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfilePrivacy {
    pub profile_visibility: String,
    pub friends_list_visibility: String,
    pub email_visibility: String,
    pub courses_visibility: String,
}
