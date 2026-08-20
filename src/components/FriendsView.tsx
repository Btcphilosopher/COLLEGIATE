import React, { useState, useEffect } from 'react';
import { UserSummary, FriendRequest, User } from '../types';
import { Users, UserPlus, Check, X, Sparkles, MessageSquare } from 'lucide-react';

interface FriendsViewProps {
  currentUser: User | null;
  friendRequests: FriendRequest[];
  suggestions: Array<{ user: UserSummary; mutual_count: number; reason: string }>;
  onAcceptRequest: (reqId: string, senderId: string) => void;
  onRejectRequest: (reqId: string) => void;
  onSendRequest: (userId: string) => void;
  onRemoveFriend: (userId: string) => void;
  onOpenChatWith: (user: UserSummary) => void;
  onNavigate: (view: string, targetId?: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  friendRequests,
  suggestions,
  onAcceptRequest,
  onRejectRequest,
  onSendRequest,
  onRemoveFriend,
  onOpenChatWith,
  onNavigate,
}) => {
  const [friends, setFriends] = useState<UserSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'suggestions'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchFriends = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}/friends`);
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) {
      console.error('Failed to load friends', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [currentUser]);

  return (
    <div className="space-y-4" id="collegiate-friends-view">
      
      {/* Header & Tabs */}
      <div className="bg-white border border-slate-300 rounded p-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-900" />
              Social Graph & Friend Network
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bidirectional academic friendships managed by Rust Graph Engine
            </p>
          </div>

          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                activeTab === 'all' ? 'bg-[#1d3c6a] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1 rounded font-semibold transition-colors relative cursor-pointer ${
                activeTab === 'requests' ? 'bg-[#1d3c6a] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Requests ({friendRequests.length})
              {friendRequests.length > 0 && (
                <span className="ml-1 px-1 bg-red-600 text-white rounded-full text-[9px]">
                  {friendRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                activeTab === 'suggestions' ? 'bg-[#1d3c6a] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Suggestions ({suggestions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab: All Friends */}
      {activeTab === 'all' && (
        <div className="bg-white border border-slate-300 rounded p-3 shadow-xs">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              Loading social graph edges...
            </div>
          ) : friends.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              You have not connected with any classmates yet. Check the Suggestions tab to discover people in your cohort!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={friend.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0 cursor-pointer"
                      onClick={() => onNavigate('profile', friend.id)}
                    />
                    <div className="truncate">
                      <button
                        onClick={() => onNavigate('profile', friend.id)}
                        className="font-bold text-blue-900 hover:underline text-left block truncate cursor-pointer"
                      >
                        {friend.display_name}
                      </button>
                      <div className="text-[11px] text-slate-600 truncate">{friend.university_name}</div>
                      <div className="text-[10px] text-slate-400">Class of '{String(friend.graduation_year).slice(-2)} · {friend.major}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => onOpenChatWith(friend)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" /> Message
                    </button>
                    <button
                      onClick={() => onRemoveFriend(friend.id)}
                      className="px-2 py-0.5 text-slate-400 hover:text-red-600 text-[10px] text-center"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Requests */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-slate-300 rounded p-3 shadow-xs">
          {friendRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No pending friend requests at this time.
            </div>
          ) : (
            <div className="space-y-2">
              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-blue-50/50 border border-blue-200 rounded flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.sender.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                    />
                    <div>
                      <button
                        onClick={() => onNavigate('profile', req.sender.id)}
                        className="font-bold text-blue-900 hover:underline text-left block"
                      >
                        {req.sender.display_name}
                      </button>
                      <div className="text-[11px] text-slate-600">
                        {req.sender.university_name} · Class of '{String(req.sender.graduation_year).slice(-2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Received {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onAcceptRequest(req.id, req.sender.id)}
                      className="px-3 py-1.5 bg-[#1d3c6a] hover:bg-[#152c4e] text-white font-bold rounded text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Graph Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="bg-white border border-slate-300 rounded p-3 shadow-xs">
          <div className="text-xs text-slate-500 mb-3">
            Suggestions generated by Rust 2nd-degree graph traversal and institutional cohort matching.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((sugg) => (
              <div
                key={sugg.user.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={sugg.user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0 cursor-pointer"
                    onClick={() => onNavigate('profile', sugg.user.id)}
                  />
                  <div className="truncate">
                    <button
                      onClick={() => onNavigate('profile', sugg.user.id)}
                      className="font-bold text-blue-900 hover:underline text-left block truncate cursor-pointer"
                    >
                      {sugg.user.display_name}
                    </button>
                    <div className="text-[11px] text-slate-700 font-medium truncate">{sugg.user.university_name}</div>
                    <div className="text-[10px] text-amber-700 font-medium">{sugg.reason}</div>
                  </div>
                </div>

                <button
                  onClick={() => onSendRequest(sugg.user.id)}
                  className="px-3 py-1.5 bg-[#1d3c6a] hover:bg-[#152c4e] text-white font-bold rounded text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
