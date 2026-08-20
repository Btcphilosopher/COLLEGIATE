use chrono::{DateTime, Duration, Utc};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub session_id: String,
    pub user_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
}

pub struct SessionManager {
    sessions: DashMap<String, Session>,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            sessions: DashMap::new(),
        }
    }

    pub fn create_session(&self, user_id: Uuid, user_agent: Option<String>, ip_address: Option<String>) -> Session {
        let session_id = Uuid::new_v4().to_string();
        let now = Utc::now();
        let expires_at = now + Duration::days(30);

        let session = Session {
            session_id: session_id.clone(),
            user_id,
            created_at: now,
            expires_at,
            user_agent,
            ip_address,
        };

        self.sessions.insert(session_id, session.clone());
        session
    }

    pub fn validate_session(&self, session_id: &str) -> Option<Uuid> {
        if let Some(session) = self.sessions.get(session_id) {
            if session.expires_at > Utc::now() {
                return Some(session.user_id);
            }
        }
        None
    }

    pub fn revoke_session(&self, session_id: &str) {
        self.sessions.remove(session_id);
    }
}
