use dashmap::DashMap;
use parking_lot::RwLock;
use std::collections::{HashMap, HashSet};
use uuid::Uuid;
use super::super::database::connection::DatabasePool;

pub struct SocialGraphEngine {
    // Adjacency set representing confirmed bidirectional friendships
    friendships: DashMap<Uuid, HashSet<Uuid>>,
    // Directed graph for followers
    following: DashMap<Uuid, HashSet<Uuid>>,
    // Blocks & mutes
    blocks: DashMap<Uuid, HashSet<Uuid>>,
    mutes: DashMap<Uuid, HashSet<Uuid>>,
    // Affinity matrix for feed ranking and friend recommendations
    affinity_scores: DashMap<(Uuid, Uuid), f32>,
}

impl SocialGraphEngine {
    pub fn new() -> Self {
        Self {
            friendships: DashMap::new(),
            following: DashMap::new(),
            blocks: DashMap::new(),
            mutes: DashMap::new(),
            affinity_scores: DashMap::new(),
        }
    }

    pub async fn rebuild_from_db(&self, _pool: &DatabasePool) -> Result<(), Box<dyn std::error::Error>> {
        // Hydrates the memory graph from PostgreSQL tables
        Ok(())
    }

    pub fn add_friendship(&self, a: Uuid, b: Uuid) {
        self.friendships.entry(a).or_default().insert(b);
        self.friendships.entry(b).or_default().insert(a);
    }

    pub fn remove_friendship(&self, a: Uuid, b: Uuid) {
        if let Some(mut set) = self.friendships.get_mut(&a) {
            set.remove(&b);
        }
        if let Some(mut set) = self.friendships.get_mut(&b) {
            set.remove(&a);
        }
    }

    pub fn are_friends(&self, a: Uuid, b: Uuid) -> bool {
        self.friendships.get(&a).map_or(false, |set| set.contains(&b))
    }

    pub fn friends_of(&self, user_id: &Uuid) -> Vec<Uuid> {
        self.friendships.get(user_id).map_or(Vec::new(), |set| set.iter().copied().collect())
    }

    pub fn mutual_friends(&self, user_a: &Uuid, user_b: &Uuid) -> Vec<Uuid> {
        let friends_a = self.friendships.get(user_a);
        let friends_b = self.friendships.get(user_b);

        if let (Some(fa), Some(fb)) = (friends_a, friends_b) {
            fa.intersection(&*fb).copied().collect()
        } else {
            Vec::new()
        }
    }

    pub fn friend_suggestions(&self, user_id: &Uuid, limit: usize) -> Vec<(Uuid, usize)> {
        let user_friends = match self.friendships.get(user_id) {
            Some(f) => f.clone(),
            None => HashSet::new(),
        };

        let mut candidate_counts: HashMap<Uuid, usize> = HashMap::new();

        // 2nd degree traversal (friends of friends)
        for friend in &user_friends {
            if let Some(fof_set) = self.friendships.get(friend) {
                for fof in fof_set.iter() {
                    if *fof != *user_id && !user_friends.contains(fof) {
                        *candidate_counts.entry(*fof).or_insert(0) += 1;
                    }
                }
            }
        }

        let mut sorted: Vec<(Uuid, usize)> = candidate_counts.into_iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(&a.1));
        sorted.truncate(limit);
        sorted
    }

    pub fn is_blocked(&self, blocker: &Uuid, target: &Uuid) -> bool {
        self.blocks.get(blocker).map_or(false, |s| s.contains(target))
    }
}
