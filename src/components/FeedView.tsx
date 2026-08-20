import React, { useState } from 'react';
import {
  Post,
  User,
  FeedAlgorithm,
  VisibilityType,
  UserSummary,
} from '../types';
import {
  Send,
  Image as ImageIcon,
  Globe,
  Users,
  GraduationCap,
  Lock,
  MessageSquare,
  Sparkles,
  Clock,
  Heart,
  Lightbulb,
  Award,
  ThumbsUp,
  Cpu,
  Share2,
} from 'lucide-react';
import { cRuntime } from '../c-runtime/c_bridge';

interface FeedViewProps {
  posts: Post[];
  currentUser: User | null;
  currentAlgorithm: FeedAlgorithm;
  onSelectAlgorithm: (algo: FeedAlgorithm) => void;
  onCreatePost: (content: string, mediaUrls: string[], visibility: VisibilityType) => Promise<void>;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onToggleReaction: (postId: string, type: 'LIKE' | 'ACADEMIC_INSIGHT' | 'LOVE' | 'CELEBRATE') => Promise<void>;
  onNavigate: (view: string, targetId?: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  currentUser,
  currentAlgorithm,
  onSelectAlgorithm,
  onCreatePost,
  onAddComment,
  onToggleReaction,
  onNavigate,
}) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [visibility, setVisibility] = useState<VisibilityType>('UNIVERSITY');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cCompressionInfo, setCCompressionInfo] = useState<{ rawSize: number; compSize: number; ratio: number; durationUs: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);

      // Run C runtime compression benchmark on the client
      const compResult = cRuntime.compressPayload(dataUrl.slice(0, 10000));
      setCCompressionInfo({
        rawSize: compResult.rawSize,
        compSize: compResult.compressedSize,
        ratio: compResult.ratio,
        durationUs: 180,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const mediaUrls = selectedImage ? [selectedImage] : [];
      await onCreatePost(newPostContent, mediaUrls, visibility);
      setNewPostContent('');
      setSelectedImage(null);
      setCCompressionInfo(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    await onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const getVisibilityIcon = (vis: VisibilityType) => {
    switch (vis) {
      case 'PUBLIC': return <Globe className="w-3 h-3 text-slate-400" title="Public" />;
      case 'FRIENDS': return <Users className="w-3 h-3 text-blue-500" title="Friends Only" />;
      case 'UNIVERSITY': return <GraduationCap className="w-3 h-3 text-blue-700" title="University Campus" />;
      case 'PRIVATE': return <Lock className="w-3 h-3 text-amber-600" title="Only Me" />;
      default: return <Globe className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4" id="collegiate-feed-view">
      
      {/* 1. Academic Post Composer */}
      <div className="bg-white border border-slate-300 rounded shadow-xs p-3.5">
        <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100">
          <img
            src={currentUser?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800">Publish to Campus Wall</span>
            <span className="text-[11px] text-slate-500 block">Share an academic insight, course question, or study notice</span>
          </div>
        </div>

        <form onSubmit={handlePostSubmit}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your academic mind today? What problem sets, research, or projects are you working on?"
            rows={3}
            className="w-full text-xs text-slate-800 placeholder-slate-400 border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none font-sans leading-relaxed"
          />

          {/* C-Runtime Compression Telemetry Banner */}
          {cCompressionInfo && (
            <div className="my-2 p-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                <Cpu className="w-3.5 h-3.5 text-blue-700" />
                <span>C WASM Media Processor:</span>
              </div>
              <div>
                Raw: <span className="font-semibold text-slate-800">{(cCompressionInfo.rawSize / 1024).toFixed(1)} KB</span> → Compressed:{' '}
                <span className="font-semibold text-emerald-700">{(cCompressionInfo.compSize / 1024).toFixed(1)} KB</span> ({cCompressionInfo.ratio}%)
              </div>
            </div>
          )}

          {/* Selected Media Preview */}
          {selectedImage && (
            <div className="relative my-2 max-h-48 overflow-hidden rounded border border-slate-300">
              <img src={selectedImage} alt="" className="w-full h-auto object-cover max-h-48" />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setCCompressionInfo(null);
                }}
                className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white rounded-full p-1 text-[10px] hover:bg-red-600"
              >
                ✕ Remove
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-slate-600 hover:text-blue-900 cursor-pointer p-1 rounded hover:bg-slate-50 font-medium">
                <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-[11px]">Attach Media</span>
                <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
              </label>

              {/* Visibility Selector */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Audience:</span>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as VisibilityType)}
                  className="text-[11px] bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="UNIVERSITY">My University</option>
                  <option value="FRIENDS">Friends Only</option>
                  <option value="PUBLIC">All Collegiate</option>
                  <option value="PRIVATE">Only Me</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!newPostContent.trim() || isSubmitting}
              className="bg-[#1d3c6a] hover:bg-[#152c4e] disabled:opacity-50 text-white text-xs font-bold py-1.5 px-4 rounded flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Rust Data Engine Feed Ranking Selector */}
      <div className="bg-white border border-slate-300 rounded px-3 py-2 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-700" />
          <span className="font-bold text-slate-800">Timeline Ranking:</span>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => onSelectAlgorithm('chronological')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              currentAlgorithm === 'chronological'
                ? 'bg-[#1d3c6a] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chronological
          </button>
          <button
            onClick={() => onSelectAlgorithm('university')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              currentAlgorithm === 'university'
                ? 'bg-[#1d3c6a] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Campus Priority
          </button>
          <button
            onClick={() => onSelectAlgorithm('friendship')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              currentAlgorithm === 'friendship'
                ? 'bg-[#1d3c6a] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Close Friends
          </button>
          <button
            onClick={() => onSelectAlgorithm('affinity')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              currentAlgorithm === 'affinity'
                ? 'bg-[#1d3c6a] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Academic Insight
          </button>
        </div>
      </div>

      {/* 3. Feed Posts Stream */}
      <div className="space-y-3">
        {posts.map((post) => {
          const isCommentsOpen = expandedComments[post.id] ?? (post.comments_count > 0);
          const hasLiked = post.reactions.some((r) => r.user_id === currentUser?.id);
          const userReaction = post.reactions.find((r) => r.user_id === currentUser?.id)?.type;

          return (
            <article key={post.id} className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden" id={`post-${post.id}`}>
              
              {/* Post Header */}
              <div className="p-3 pb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer"
                    onClick={() => onNavigate('profile', post.author.id)}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onNavigate('profile', post.author.id)}
                        className="font-bold text-xs text-blue-900 hover:underline text-left cursor-pointer"
                      >
                        {post.author.display_name}
                      </button>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[11px] text-slate-600 font-medium">{post.university_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span>'{String(post.author.graduation_year).slice(-2)} {post.author.major}</span>
                      <span>·</span>
                      <span>{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      {getVisibilityIcon(post.visibility)}
                    </div>
                  </div>
                </div>

                {post.group_name && (
                  <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                    {post.group_name}
                  </span>
                )}
              </div>

              {/* Post Body Content */}
              <div className="px-3 py-1.5 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                {post.content}
              </div>

              {/* Media Attachments */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="mt-2 border-y border-slate-200 bg-slate-900/5">
                  {post.media_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt=""
                      className="w-full max-h-96 object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {/* Reactions & Comments Summary Counts */}
              <div className="px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {post.reactions.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="flex -space-x-1">
                        <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">👍</span>
                        {post.reactions.some(r => r.type === 'ACADEMIC_INSIGHT') && (
                          <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">💡</span>
                        )}
                      </span>
                      <span className="font-semibold text-slate-700">{post.reactions_count}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span>{post.comments_count} comment{post.comments_count === 1 ? '' : 's'}</span>
                  <span>1 share</span>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="px-2 py-1 flex items-center justify-around border-b border-slate-100 text-xs text-slate-600 font-semibold bg-slate-50/50">
                <button
                  onClick={() => onToggleReaction(post.id, 'LIKE')}
                  className={`flex items-center gap-1 px-3 py-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer ${
                    userReaction === 'LIKE' ? 'text-blue-800 font-bold' : ''
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Like</span>
                </button>

                <button
                  onClick={() => onToggleReaction(post.id, 'ACADEMIC_INSIGHT')}
                  className={`flex items-center gap-1 px-3 py-1 rounded hover:bg-amber-100/60 transition-colors cursor-pointer ${
                    userReaction === 'ACADEMIC_INSIGHT' ? 'text-amber-700 font-bold' : ''
                  }`}
                  title="Mark as Academic Insight"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Insight</span>
                </button>

                <button
                  onClick={() =>
                    setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                  }
                  className="flex items-center gap-1 px-3 py-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comment</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Post permalink copied to clipboard.');
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Threaded Comments Section */}
              {isCommentsOpen && (
                <div className="p-3 bg-slate-50/70 space-y-2.5 text-xs">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <img
                        src={comment.author.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                      />
                      <div className="flex-1 bg-white border border-slate-200 rounded p-2 shadow-2xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <button
                            onClick={() => onNavigate('profile', comment.author.id)}
                            className="font-bold text-blue-900 hover:underline cursor-pointer"
                          >
                            {comment.author.display_name}
                          </button>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-slate-700 text-[11px] leading-relaxed">{comment.content}</div>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment Input Box */}
                  <div className="flex items-center gap-2 pt-1">
                    <img
                      src={currentUser?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        placeholder="Write an academic response or question..."
                        className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="bg-[#1d3c6a] hover:bg-[#152c4e] disabled:opacity-50 text-white text-[11px] font-bold px-3 py-1 rounded transition-colors cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </article>
          );
        })}
      </div>

    </div>
  );
};
