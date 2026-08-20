use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PrivacySettings {
    pub user_id: Uuid,
    pub profile_visibility: String,      // PUBLIC, FRIENDS, UNIVERSITY, PRIVATE
    pub friend_list_visibility: String,  // PUBLIC, FRIENDS, ONLY_ME
    pub email_visibility: String,        // PUBLIC, FRIENDS, ONLY_ME
    pub courses_visibility: String,      // PUBLIC, FRIENDS, UNIVERSITY, ONLY_ME
    pub allow_friend_requests: String,   // EVERYONE, FRIENDS_OF_FRIENDS, UNIVERSITY_ONLY
    pub show_online_status: bool,
}

impl Default for PrivacySettings {
    fn default() -> Self {
        Self {
            user_id: Uuid::nil(),
            profile_visibility: "UNIVERSITY".to_string(),
            friend_list_visibility: "FRIENDS".to_string(),
            email_visibility: "UNIVERSITY".to_string(),
            courses_visibility: "UNIVERSITY".to_string(),
            allow_friend_requests: "EVERYONE".to_string(),
            show_online_status: true,
        }
    }
}
