use axum::{
    routing::{get, post, patch, delete},
    Router,
};
use super::super::AppState;

pub fn create_router(state: AppState) -> Router {
    Router::new()
        // Authentication & Session
        .route("/api/auth/register", post(super::handlers::register))
        .route("/api/auth/login", post(super::handlers::login))
        .route("/api/auth/logout", post(super::handlers::logout))
        .route("/api/auth/me", get(super::handlers::get_current_user))
        
        // Users & Profiles
        .route("/api/users", get(super::handlers::list_users))
        .route("/api/users/:id", get(super::handlers::get_user_profile))
        .route("/api/users/:id", patch(super::handlers::update_user_profile))
        
        // Social Graph
        .route("/api/users/:id/friends", get(super::handlers::get_user_friends))
        .route("/api/users/:id/mutuals", get(super::handlers::get_mutual_friends))
        .route("/api/friends/suggestions", get(super::handlers::get_friend_suggestions))
        .route("/api/friends/request", post(super::handlers::send_friend_request))
        .route("/api/friends/accept", post(super::handlers::accept_friend_request))
        .route("/api/friends/reject", post(super::handlers::reject_friend_request))
        .route("/api/friends/remove", post(super::handlers::remove_friend))
        
        // Feed & Timeline
        .route("/api/feed", get(super::handlers::get_feed))
        
        // Posts & Engagements
        .route("/api/posts", post(super::handlers::create_post))
        .route("/api/posts/:id", get(super::handlers::get_post))
        .route("/api/posts/:id", delete(super::handlers::delete_post))
        .route("/api/posts/:id/comments", post(super::handlers::add_comment))
        .route("/api/posts/:id/reactions", post(super::handlers::toggle_reaction))
        
        // Universities & Academic Directory
        .route("/api/universities", get(super::handlers::list_universities))
        .route("/api/universities/:id/departments", get(super::handlers::get_departments))
        .route("/api/courses", get(super::handlers::list_courses))
        
        // Groups & Societies
        .route("/api/groups", get(super::handlers::list_groups))
        .route("/api/groups", post(super::handlers::create_group))
        .route("/api/groups/:id/join", post(super::handlers::join_group))
        
        // Campus Events
        .route("/api/events", get(super::handlers::list_events))
        .route("/api/events", post(super::handlers::create_event))
        .route("/api/events/:id/attend", post(super::handlers::toggle_attend_event))
        
        // Messaging & Realtime
        .route("/api/conversations", get(super::handlers::list_conversations))
        .route("/api/conversations/:id/messages", get(super::handlers::get_messages))
        .route("/api/messages", post(super::handlers::send_message))
        .route("/api/ws", get(super::websocket::ws_handler))
        
        // Photos & Media
        .route("/api/photos", get(super::handlers::list_photos))
        .route("/api/albums", get(super::handlers::list_albums))
        
        // Search & Discovery
        .route("/api/search", get(super::handlers::search))
        
        // Notifications
        .route("/api/notifications", get(super::handlers::list_notifications))
        .route("/api/notifications/:id/read", patch(super::handlers::mark_notification_read))
        
        // System & Engineering Telemetry
        .route("/api/system/status", get(super::handlers::system_status))
        
        .with_state(state)
}
