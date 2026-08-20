//! COLLEGIATE - Core Rust Engine & High-Performance Data Platform
//! Authoritative Backend, Database Interface, and Social Graph Architecture

use std::sync::Arc;
use tokio::net::TcpListener;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

pub mod api;
pub mod database;
pub mod events;
pub mod feed;
pub mod groups;
pub mod identity;
pub mod media;
pub mod messaging;
pub mod moderation;
pub mod notifications;
pub mod posts;
pub mod privacy;
pub mod search;
pub mod social;
pub mod universities;

pub use database::connection::DatabasePool;
pub use identity::sessions::SessionManager;
pub use social::graph::SocialGraphEngine;

/// Global application state shared across asynchronous Axum request handlers
#[derive(Clone)]
pub struct AppState {
    pub db: Arc<DatabasePool>,
    pub sessions: Arc<SessionManager>,
    pub graph: Arc<SocialGraphEngine>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to initialize tracing subscriber");

    info!("Initializing COLLEGIATE Data Engine v1.0.0");

    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://collegiate:secret@localhost:5432/collegiate_db".to_string());

    let db_pool = Arc::new(DatabasePool::new(&database_url).await?);
    info!("Running pending SQLx migrations...");
    database::migrations::run_migrations(&db_pool).await?;

    let sessions = Arc::new(SessionManager::new());
    let graph = Arc::new(SocialGraphEngine::new());

    info!("Pre-warming in-memory social graph cache...");
    graph.rebuild_from_db(&db_pool).await?;

    let state = AppState {
        db: db_pool,
        sessions,
        graph,
    };

    let app = api::routes::create_router(state);
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&addr).await?;

    info!("COLLEGIATE Rust Data Engine listening on {}", addr);
    axum::serve(listener, app).await?;

    Ok(())
}
