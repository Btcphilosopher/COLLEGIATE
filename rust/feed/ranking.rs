use chrono::Utc;
use uuid::Uuid;
use super::super::posts::Post;
use super::super::social::graph::SocialGraphEngine;
use super::FeedAlgorithm;

pub fn rank_posts(
    mut posts: Vec<Post>,
    viewer_id: &Uuid,
    viewer_university_id: &Uuid,
    graph: &SocialGraphEngine,
    algorithm: FeedAlgorithm,
) -> Vec<Post> {
    match algorithm {
        FeedAlgorithm::Chronological => {
            posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        }
        FeedAlgorithm::University => {
            posts.sort_by(|a, b| {
                let a_match = if a.university_id == *viewer_university_id { 1 } else { 0 };
                let b_match = if b.university_id == *viewer_university_id { 1 } else { 0 };
                b_match.cmp(&a_match).then_with(|| b.created_at.cmp(&a.created_at))
            });
        }
        FeedAlgorithm::Friendship => {
            posts.sort_by(|a, b| {
                let a_friend = if graph.are_friends(*viewer_id, a.author_id) { 1 } else { 0 };
                let b_friend = if graph.are_friends(*viewer_id, b.author_id) { 1 } else { 0 };
                b_friend.cmp(&a_friend).then_with(|| b.created_at.cmp(&a.created_at))
            });
        }
        FeedAlgorithm::Affinity | FeedAlgorithm::Group => {
            let now = Utc::now();
            posts.sort_by(|a, b| {
                let score_a = calculate_post_score(&a, viewer_id, viewer_university_id, graph, &now);
                let score_b = calculate_post_score(&b, viewer_id, viewer_university_id, graph, &now);
                score_b.partial_cmp(&score_a).unwrap_or(std::cmp::Ordering::Equal)
            });
        }
    }
    posts
}

fn calculate_post_score(
    post: &Post,
    viewer_id: &Uuid,
    viewer_university_id: &Uuid,
    graph: &SocialGraphEngine,
    now: &chrono::DateTime<Utc>,
) -> f32 {
    let mut score = 100.0;

    // Social graph weight
    if graph.are_friends(*viewer_id, post.author_id) {
        score += 80.0;
    } else if post.university_id == *viewer_university_id {
        score += 35.0;
    }

    // Engagement weights
    score += (post.reactions_count as f32) * 5.0;
    score += (post.comments_count as f32) * 10.0;

    // Time decay: -1.5 points per hour
    let hours_old = (now.signed_duration_since(post.created_at).num_minutes() as f32) / 60.0;
    let decay = (hours_old * 1.8).min(80.0);
    score -= decay;

    score.max(1.0)
}
