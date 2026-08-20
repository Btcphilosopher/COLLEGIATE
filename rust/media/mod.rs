pub mod albums;
pub mod compression;
pub mod photos;
pub mod thumbnails;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Photo {
    pub id: Uuid,
    pub user_id: Uuid,
    pub album_id: Option<Uuid>,
    pub url: String,
    pub thumbnail_url: String,
    pub caption: Option<String>,
    pub width: i32,
    pub height: i32,
    pub byte_size: i64,
    pub mime_type: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Album {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub cover_photo_url: Option<String>,
    pub photo_count: i32,
    pub created_at: DateTime<Utc>,
}
