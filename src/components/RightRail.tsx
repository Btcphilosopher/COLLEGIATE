import React from 'react';
import { User, UserSummary, FriendRequest } from '../types';
import { UserPlus, Check, X, Users, MessageSquare, Radio, Sparkles } from 'lucide-react';

interface RightRailProps {
  currentUser: User | null;
  friendRequests: FriendRequest[];
  suggestions: Array<{ user: UserSummary; mutual_count: number; reason: string }>;
  onlineUsers: UserSummary[];
  onAcceptRequest: (reqId: string, senderId: string) => void;
  onRejectRequest: (reqId: string) => void;
  onSendRequest: (userId: string) => void;
  onNavigate: (view: string, targetId?: string) => void;
  onOpenChatWith: (user: UserSummary) => void;
}

export const RightRail: React.FC<RightRailProps> = ({
  currentUser,
  friendRequests,
  suggestions,
  onlineUsers,
  onAcceptRequest,
  onRejectRequest,
  onSendRequest,
  onNavigate,
  onOpenChatWith,
}) => {
  return (
    <aside className="w-full space-y-4" id="collegiate-right-rail">
      
      {/* 1. Pending Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="bg-white border border-blue-200 rounded p-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
            <h3 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-blue-700" />
              Friend Requests ({friendRequests.length})
            </h3>
            <button
              onClick={() => onNavigate('friends')}
              className="text-[10px] text-blue-700 hover:underline font-semibold"
            >
              See All
            </button>
          </div>

          <div className="space-y-2.5">
            {friendRequests.map((req) => (
              <div key={req.id} className="text-xs bg-blue-50/50 p-2 rounded border border-blue-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src={req.sender.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                  <div className="truncate">
                    <button
                      onClick={() => onNavigate('profile', req.sender.id)}
                      className="font-bold text-blue-900 hover:underline text-left block truncate"
                    >
                      {req.sender.display_name}
                    </button>
                    <div className="text-[10px] text-slate-500 truncate">
                      {req.sender.university_name.split(' ')[0]} · '{String(req.sender.graduation_year).slice(-2)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-1">
                  <button
                    onClick={() => onAcceptRequest(req.id, req.sender.id)}
                    className="flex-1 bg-[#1d3c6a] hover:bg-[#152c4e] text-white text-[10px] font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button
                    onClick={() => onRejectRequest(req.id)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-1 px-2 rounded transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Institutional Classmate & Social Graph Suggestions */}
      <div className="bg-white border border-slate-300 rounded p-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            People You May Know
          </h3>
          <button
            onClick={() => onNavigate('directory')}
            className="text-[10px] text-blue-700 hover:underline font-medium"
          >
            Find Classmates
          </button>
        </div>

        <div className="space-y-2">
          {suggestions.slice(0, 4).map((sugg) => (
            <div key={sugg.user.id} className="flex items-center justify-between gap-2 text-xs hover:bg-slate-50 p-1 rounded transition-colors">
              <div
                className="flex items-center gap-2 truncate cursor-pointer"
                onClick={() => onNavigate('profile', sugg.user.id)}
              >
                <img
                  src={sugg.user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="truncate">
                  <div className="font-semibold text-blue-900 hover:underline truncate">
                    {sugg.user.display_name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {sugg.reason}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSendRequest(sugg.user.id)}
                className="shrink-0 p-1 text-blue-800 hover:bg-blue-100 rounded border border-blue-300 transition-colors"
                title="Send Friend Request"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Campus Bulletin & Academic Calendar */}
      <div className="bg-white border border-slate-300 rounded p-3 shadow-xs">
        <div className="border-b border-slate-100 pb-1.5 mb-2">
          <h3 className="font-bold text-xs text-slate-900">Campus Bulletin & Notices</h3>
        </div>
        <div className="space-y-2 text-xs text-slate-700">
          <div className="p-2 bg-amber-50/70 border border-amber-200 rounded text-[11px]">
            <div className="font-bold text-amber-900">Add/Drop Course Deadline</div>
            <div className="text-amber-800 mt-0.5">Faculty registrar closes course modification window on Friday at 5:00 PM EST.</div>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px]">
            <div className="font-bold text-slate-800">Midterm Examination Schedule</div>
            <div className="text-slate-600 mt-0.5">CS 124 and ECON 201 room allocations published under the Courses tab.</div>
          </div>
        </div>
      </div>

      {/* 4. Active Campus Roster (Instant Chat) */}
      <div className="bg-white border border-slate-300 rounded p-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            Campus Online Roster
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{onlineUsers.length} online</span>
        </div>

        <div className="space-y-1.5">
          {onlineUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => onOpenChatWith(u)}
              className="w-full flex items-center justify-between p-1 hover:bg-blue-50 rounded text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="relative shrink-0">
                  <img src={u.profile_photo || ''} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full"></span>
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-900 truncate">
                    {u.display_name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{u.university_name.split(' ')[0]}</div>
                </div>
              </div>

              <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

    </aside>
  );
};
