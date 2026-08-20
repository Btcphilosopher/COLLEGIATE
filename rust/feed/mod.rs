pub mod ranking;
pub mod timeline;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FeedAlgorithm {
    Chronological,
    Affinity,
    University,
    Friendship,
    Group,
}
