import React, { useState, useEffect } from 'react';
import {
  DetailedProfile,
  User,
  Post,
  FriendshipStatus,
  UserSummary,
} from '../types';
import {
  UserPlus,
  Check,
  MessageSquare,
  BookOpen,
  GraduationCap,
  MapPin,
  Mail,
  Calendar,
  Shield,
  Edit,
  Hand,
  Users,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface ProfileViewProps {
  profileUserId: string;
  currentUser: User | null;
  onSendFriendRequest: (userId: string) => void;
  onRemoveFriend: (userId: string) => void;
  onOpenChatWith: (user: UserSummary) => void;
  onNavigate: (view: string, targetId?: string) => void;
  allPosts: Post[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileUserId,
  currentUser,
  onSendFriendRequest,
  onRemoveFriend,
  onOpenChatWith,
  onNavigate,
  allPosts,
}) => {
  const [profile, setProfile] = useState<DetailedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [pokedMessage, setPokedMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${profileUserId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditBio(data.user.biography || '');
        setEditLocation(data.user.location || '');
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [profileUserId]);

  const handleSaveBio = async () => {
    try {
      const res = await fetch(`/api/users/${profileUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ biography: editBio, location: editLocation }),
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handlePoke = () => {
    setPokedMessage(`You sent an Academic Poke to ${profile?.user.display_name}!`);
    setTimeout(() => setPokedMessage(null), 4000);
  };

  if (isLoading || !profile) {
    return (
      <div className="bg-white border border-slate-300 rounded p-8 text-center text-xs text-slate-500 font-mono">
        Loading collegiate student record from Rust Database Engine...
      </div>
    );
  }

  const userPosts = allPosts.filter((p) => p.author.id === profile.user.id);
  const isSelf = profile.user.id === currentUser?.id;

  return (
    <div className="space-y-4" id="collegiate-profile-view">
      
      {/* 1. Header Card with Academic Affiliation & Actions */}
      <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
        
        {/* University Crest Color Banner */}
        <div
          className="h-24 w-full relative"
          style={{ backgroundColor: profile.university?.primary_color || '#1d3c6a' }}
        >
          <div className="absolute top-2 right-3 flex items-center gap-1.5 text-white/90 text-[11px] font-mono bg-black/30 px-2 py-0.5 rounded backdrop-blur-xs">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{profile.university?.name}</span>
          </div>
        </div>

        <div className="px-4 pb-4 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 -mt-12 mb-3">
            
            {/* Student Photo */}
            <div className="flex items-end gap-3">
              <div className="relative">
                <img
                  src={profile.user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={profile.user.display_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                />
                {profile.user.is_online && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Online now" />
                )}
              </div>

              <div className="mb-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg sm:text-xl font-bold font-serif text-slate-900 leading-tight">
                    {profile.user.display_name}
                  </h1>
                  {profile.user.is_verified && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-blue-200">
                      VERIFIED
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-blue-900">
                  {profile.university?.name} · Class of '{String(profile.user.graduation_year).slice(-2)}
                </div>
                <div className="text-[11px] text-slate-500">
                  {profile.department?.name || 'Liberal Arts & Sciences'}
                </div>
              </div>
            </div>

            {/* Friendship & Interaction Action Buttons */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              {isSelf ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded border border-slate-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3 h-3" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              ) : (
                <>
                  {profile.friendship_status === 'friends' && (
                    <div className="flex items-center gap-1.5">
                      <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold py-1.5 px-2.5 rounded flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Friends
                      </span>
                      <button
                        onClick={() => onRemoveFriend(profile.user.id)}
                        className="text-[10px] text-slate-400 hover:text-red-600 underline"
                      >
                        Unfriend
                      </button>
                    </div>
                  )}

                  {profile.friendship_status === 'pending_outgoing' && (
                    <span className="bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold py-1.5 px-3 rounded">
                      Request Sent
                    </span>
                  )}

                  {profile.friendship_status === 'none' && (
                    <button
                      onClick={() => onSendFriendRequest(profile.user.id)}
                      className="bg-[#1d3c6a] hover:bg-[#152c4e] text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Friend</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenChatWith({
                      id: profile.user.id,
                      username: profile.user.username,
                      display_name: profile.user.display_name,
                      profile_photo: profile.user.profile_photo,
                      university_name: profile.university.name,
                      graduation_year: profile.user.graduation_year,
                    })}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold py-1.5 px-3 rounded border border-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={handlePoke}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-2 rounded border border-slate-300 transition-colors"
                    title="Send Academic Poke"
                  >
                    <Hand className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

          </div>

          {pokedMessage && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 font-medium text-center animate-fade-in">
              {pokedMessage}
            </div>
          )}

          {/* Institutional Academic Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2 bg-slate-50 rounded border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Degree / Major</span>
              <span className="font-semibold text-slate-800">{profile.department?.name || 'Economics'}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Residential House</span>
              <span className="font-semibold text-slate-800">{profile.user.location || 'Campus Quad'}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Year</span>
              <span className="font-semibold text-slate-800">{profile.user.graduation_year}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Friends Network</span>
              <span className="font-semibold text-blue-900">
                {profile.friends_count} {profile.mutual_friends_count > 0 ? `(${profile.mutual_friends_count} mutual)` : ''}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Profile Edit Mode */}
      {isEditing && (
        <div className="bg-white border border-blue-300 rounded p-4 shadow-sm text-xs space-y-3">
          <div className="font-bold text-slate-900 text-sm">Edit Academic Profile</div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Biography & Research Interests</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Dorm / College Location</label>
            <input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBio}
              className="px-4 py-1.5 bg-[#1d3c6a] hover:bg-[#152c4e] text-white rounded font-bold"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* 2. Grid Layout: Left Column (About + Friends + Photos) & Right Column (Wall) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Left Column (1/3 width) */}
        <div className="space-y-4 md:col-span-1">
          
          {/* About Box */}
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs text-xs">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-2">About & Background</h3>
            <p className="text-slate-700 leading-relaxed font-sans">
              {profile.user.biography || 'No academic biography provided yet.'}
            </p>
          </div>

          {/* Academic Course Load */}
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                Enrolled Courses
              </h3>
            </div>
            <div className="space-y-2">
              {profile.enrolled_courses && profile.enrolled_courses.length > 0 ? (
                profile.enrolled_courses.map((c) => (
                  <div key={c.id} className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-blue-900">{c.code}</div>
                    <div className="text-[11px] text-slate-700 truncate">{c.title}</div>
                    <div className="text-[10px] text-slate-400">{c.instructor}</div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-500">Currently enrolled in departmental research.</div>
              )}
            </div>
          </div>

          {/* Friends Matrix */}
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-700" />
                Friends ({profile.friends_count})
              </h3>
              <button
                onClick={() => onNavigate('friends')}
                className="text-[10px] text-blue-700 hover:underline"
              >
                View Graph
              </button>
            </div>

            {profile.mutual_friends && profile.mutual_friends.length > 0 && (
              <div className="text-[10px] text-slate-500 mb-2">
                {profile.mutual_friends.length} mutual friend{profile.mutual_friends.length > 1 ? 's' : ''} in common
              </div>
            )}

            <div className="grid grid-cols-3 gap-1.5">
              {profile.mutual_friends?.slice(0, 6).map((mf) => (
                <button
                  key={mf.id}
                  onClick={() => onNavigate('profile', mf.id)}
                  className="text-center group cursor-pointer"
                >
                  <img
                    src={mf.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                    alt=""
                    className="w-full h-14 object-cover rounded border border-slate-200 group-hover:border-blue-600 transition-colors"
                  />
                  <span className="text-[10px] text-slate-700 font-medium truncate block mt-0.5 group-hover:text-blue-900">
                    {mf.display_name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Gallery Box */}
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                Campus Photos
              </h3>
              <button
                onClick={() => onNavigate('photos')}
                className="text-[10px] text-blue-700 hover:underline"
              >
                All Albums
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {profile.recent_photos.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt=""
                  className="w-full h-14 object-cover rounded border border-slate-200"
                />
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (2/3 width) - Student Wall & Recent Activity */}
        <div className="space-y-4 md:col-span-2">
          <div className="bg-white border border-slate-300 rounded p-3 shadow-xs">
            <h3 className="font-bold text-xs text-slate-900 mb-2">
              {isSelf ? 'My Wall & Activity' : `${profile.user.display_name}'s Wall`}
            </h3>

            {userPosts.length > 0 ? (
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <article key={post.id} className="p-3 bg-slate-50/60 border border-slate-200 rounded text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-blue-900">{profile.user.display_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-slate-800 leading-relaxed font-sans">{post.content}</div>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <img src={post.media_urls[0]} alt="" className="mt-2 rounded max-h-60 w-full object-cover border border-slate-300" />
                    )}
                    <div className="mt-2 pt-1 border-t border-slate-200/70 text-[10px] text-slate-500 flex gap-3">
                      <span>👍 {post.reactions_count} reactions</span>
                      <span>💬 {post.comments_count} comments</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-mono bg-slate-50 rounded border border-dashed border-slate-200">
                No recent wall activity recorded for this academic profile.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
