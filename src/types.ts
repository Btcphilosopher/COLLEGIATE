export type UserRole = 'STUDENT' | 'FACULTY' | 'ALUMNI' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  university_id: string;
  department_id?: string;
  course_id?: string;
  graduation_year: number;
  location?: string;
  biography?: string;
  profile_photo?: string;
  cover_photo?: string;
  is_verified: boolean;
  is_online: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface University {
  id: string;
  name: string;
  slug: string;
  domain: string;
  crest_url: string;
  motto: string;
  location: string;
  established_year: number;
  total_students: number;
  primary_color: string;
}

export interface Department {
  id: string;
  university_id: string;
  name: string;
  code: string;
  faculty_head?: string;
  description?: string;
}

export interface Course {
  id: string;
  department_id: string;
  code: string;
  title: string;
  term: string;
  credits: number;
  instructor: string;
  enrollment_count: number;
  meeting_time?: string;
  room?: string;
}

export type FriendshipStatus =
  | 'self'
  | 'friends'
  | 'pending_incoming'
  | 'pending_outgoing'
  | 'none'
  | 'blocked';

export interface DetailedProfile {
  user: User;
  university: University;
  department?: Department;
  course?: Course;
  enrolled_courses: Course[];
  friends_count: number;
  mutual_friends_count: number;
  mutual_friends: UserSummary[];
  recent_photos: string[];
  friendship_status: FriendshipStatus;
  privacy: ProfilePrivacy;
}

export interface UserSummary {
  id: string;
  username: string;
  display_name: string;
  profile_photo?: string;
  university_name: string;
  graduation_year: number;
  major?: string;
  is_online?: boolean;
}

export interface FriendRequest {
  id: string;
  sender: UserSummary;
  receiver_id: string;
  created_at: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export type VisibilityType = 'PUBLIC' | 'FRIENDS' | 'UNIVERSITY' | 'GROUP' | 'PRIVATE';

export interface Reaction {
  user_id: string;
  user_name: string;
  type: 'LIKE' | 'ACADEMIC_INSIGHT' | 'LOVE' | 'CELEBRATE';
}

export interface Comment {
  id: string;
  post_id: string;
  author: UserSummary;
  content: string;
  created_at: string;
}

export interface Post {
  id: string;
  author: UserSummary;
  university_id: string;
  university_name: string;
  group_id?: string;
  group_name?: string;
  content: string;
  media_urls: string[];
  visibility: VisibilityType;
  reactions: Reaction[];
  reactions_count: number;
  comments: Comment[];
  comments_count: number;
  is_pinned?: boolean;
  created_at: string;
  c_compression_ratio?: number;
}

export type FeedAlgorithm = 'chronological' | 'university' | 'friendship' | 'affinity' | 'group';

export interface Group {
  id: string;
  university_id: string;
  name: string;
  description: string;
  category: 'ACADEMIC' | 'SOCIETY' | 'DEBATE' | 'SPORTS' | 'ARTS' | 'GREEK_LIFE' | 'STUDY_GROUP';
  privacy: 'OPEN' | 'CLOSED' | 'SECRET';
  cover_image?: string;
  member_count: number;
  is_member?: boolean;
  created_by_name: string;
  meeting_location?: string;
  created_at: string;
}

export interface CampusEvent {
  id: string;
  university_id: string;
  organizer: UserSummary;
  group_id?: string;
  group_name?: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  category: 'LECTURE' | 'COLLOQUIUM' | 'SOCIAL' | 'EXAM_REVIEW' | 'ATHLETICS' | 'CONCERT';
  attendee_count: number;
  is_attending?: boolean;
  created_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  album_id?: string;
  url: string;
  thumbnail_url: string;
  caption?: string;
  width: number;
  height: number;
  byte_size: number;
  mime_type: string;
  created_at: string;
}

export interface Album {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_photo_url?: string;
  photo_count: number;
  photos?: Photo[];
  created_at: string;
}

export interface Conversation {
  id: string;
  title?: string;
  participants: UserSummary[];
  last_message?: {
    sender_name: string;
    content: string;
    created_at: string;
  };
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_photo?: string;
  content: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
  c_processed_time_ms?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  actor: UserSummary;
  type:
    | 'FRIEND_REQUEST'
    | 'FRIEND_ACCEPTED'
    | 'POST_REACTION'
    | 'POST_COMMENT'
    | 'GROUP_INVITE'
    | 'EVENT_REMINDER'
    | 'MENTION';
  title: string;
  content: string;
  resource_type: string;
  resource_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface ProfilePrivacy {
  profile_visibility: VisibilityType;
  friends_list_visibility: 'PUBLIC' | 'FRIENDS' | 'ONLY_ME';
  email_visibility: 'PUBLIC' | 'FRIENDS' | 'UNIVERSITY' | 'ONLY_ME';
  courses_visibility: 'PUBLIC' | 'FRIENDS' | 'UNIVERSITY' | 'ONLY_ME';
  allow_friend_requests: 'EVERYONE' | 'FRIENDS_OF_FRIENDS' | 'UNIVERSITY_ONLY';
  show_online_status: boolean;
}

export interface ModerationReport {
  id: string;
  reporter_id: string;
  target_type: 'USER' | 'POST' | 'COMMENT' | 'PHOTO' | 'GROUP' | 'MESSAGE';
  target_id: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  ip_address?: string;
  timestamp: string;
}

export interface CRuntimeMetrics {
  arena_allocated_bytes: number;
  arena_capacity_bytes: number;
  lru_cache_entries: number;
  compression_ops_count: number;
  total_raw_bytes: number;
  total_compressed_bytes: number;
  avg_compression_ratio: number;
  last_resample_duration_us: number;
}

export interface SystemEngineStatus {
  rust_engine_version: string;
  postgres_pool_size: number;
  active_connections: number;
  in_memory_graph_nodes: number;
  in_memory_graph_edges: number;
  argon2_hashes_verified: number;
  c_runtime_active: boolean;
  c_metrics: CRuntimeMetrics;
  uptime_seconds: number;
}
