#[cfg(test)]
mod tests {
    use collegiate::identity::authentication::{hash_password, verify_password};
    use collegiate::social::graph::SocialGraphEngine;
    use uuid::Uuid;

    #[test]
    fn test_argon2id_hashing() {
        let password = "SuperSecretAcademicPassword2028!";
        let hash = hash_password(password).expect("Hashing should succeed");
        assert!(verify_password(password, &hash).expect("Verification should succeed"));
        assert!(!verify_password("wrong_password", &hash).unwrap());
    }

    #[test]
    fn test_social_graph_operations() {
        let graph = SocialGraphEngine::new();
        let user_a = Uuid::new_v4();
        let user_b = Uuid::new_v4();
        let user_c = Uuid::new_v4();

        graph.add_friendship(user_a, user_b);
        graph.add_friendship(user_b, user_c);

        assert!(graph.are_friends(user_a, user_b));
        assert!(graph.are_friends(user_b, user_c));
        assert!(!graph.are_friends(user_a, user_c));

        // 2nd degree suggestion: user_a and user_c have mutual friend user_b
        let suggestions = graph.friend_suggestions(&user_a, 10);
        assert_eq!(suggestions.len(), 1);
        assert_eq!(suggestions[0].0, user_c);
        assert_eq!(suggestions[0].1, 1); // 1 mutual friend
    }
}
