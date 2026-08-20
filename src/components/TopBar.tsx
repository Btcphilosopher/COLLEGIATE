import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageSquare, Shield, Terminal, BookOpen, GraduationCap, ChevronDown, Check, UserPlus } from 'lucide-react';
import { User, University, UserSummary } from '../types';

interface TopBarProps {
  currentUser: User | null;
  activeUniversity: University | null;
  unreadMessagesCount: number;
  unreadNotifsCount: number;
  onNavigate: (view: string, targetId?: string) => void;
  onToggleConsole: () => void;
  onSwitchUser: (userId: string) => void;
  allUsers: UserSummary[];
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  activeUniversity,
  unreadMessagesCount,
  unreadNotifsCount,
  onNavigate,
  onToggleConsole,
  onSwitchUser,
  allUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: UserSummary[];
    courses: any[];
    groups: any[];
    posts: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#1d3c6a] border-b border-[#142948] text-white sticky top-0 z-40 shadow-sm" id="collegiate-topbar">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-12 flex items-center justify-between gap-3">
        
        {/* Left: Brand Identity & University Crest */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('feed')}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
            title="COLLEGIATE Home"
          >
            <span className="font-serif font-black tracking-wider text-lg sm:text-xl text-white group-hover:text-blue-100 transition-colors">
              COLLEGIATE
            </span>
          </button>

          {activeUniversity && (
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-blue-900/60 text-xs text-blue-200">
              <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
              <span className="font-medium tracking-tight truncate max-w-[160px]">{activeUniversity.name}</span>
            </div>
          )}
        </div>

        {/* Center: Academic Search Box with Live Results Dropdown */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-blue-300 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, faculty, courses, groups..."
              className="w-full bg-[#142948] text-xs text-white placeholder-blue-300/70 rounded px-2.5 py-1.5 pl-8 border border-blue-900/80 focus:outline-none focus:border-blue-400 focus:bg-[#0e1d33] transition-all"
            />
            {isSearching && (
              <span className="text-[10px] text-blue-300 absolute right-2.5 animate-pulse">Searching...</span>
            )}
          </div>

          {/* Search Dropdown */}
          {searchResults && (searchResults.users.length > 0 || searchResults.courses.length > 0 || searchResults.groups.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white text-slate-800 rounded border border-slate-300 shadow-xl z-50 max-h-80 overflow-y-auto text-xs divide-y divide-slate-100">
              {searchResults.users.length > 0 && (
                <div className="p-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Students & Faculty</div>
                  {searchResults.users.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onNavigate('profile', u.id);
                        setSearchResults(null);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-2 p-1.5 hover:bg-blue-50 rounded text-left transition-colors"
                    >
                      <img src={u.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                      <div className="truncate">
                        <div className="font-semibold text-blue-900">{u.display_name}</div>
                        <div className="text-[10px] text-slate-500">{u.university_name} · '{String(u.graduation_year).slice(-2)} {u.major}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.courses.length > 0 && (
                <div className="p-2 bg-slate-50/50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Courses</div>
                  {searchResults.courses.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onNavigate('courses');
                        setSearchResults(null);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-1.5 hover:bg-blue-50 rounded text-left transition-colors"
                    >
                      <div>
                        <span className="font-bold text-blue-900 mr-2">{c.code}:</span>
                        <span className="text-slate-700">{c.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{c.instructor}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.groups.length > 0 && (
                <div className="p-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Societies & Groups</div>
                  {searchResults.groups.slice(0, 2).map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        onNavigate('groups');
                        setSearchResults(null);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-1.5 hover:bg-blue-50 rounded text-left transition-colors"
                    >
                      <span className="font-semibold text-blue-900">{g.name}</span>
                      <span className="text-[10px] text-slate-500">{g.member_count} members</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Action Controls & Identity Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Real-time Messages Counter */}
          <button
            onClick={() => onNavigate('messages')}
            className="p-1.5 hover:bg-[#142948] rounded text-blue-100 hover:text-white transition-colors relative cursor-pointer"
            title="Private Messages"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications Counter */}
          <button
            onClick={() => onNavigate('notifications')}
            className="p-1.5 hover:bg-[#142948] rounded text-blue-100 hover:text-white transition-colors relative cursor-pointer"
            title="Campus Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Rust & C Systems Architecture Console Toggle */}
          <button
            onClick={onToggleConsole}
            className="flex items-center gap-1 px-2 py-1 bg-blue-950/80 hover:bg-blue-900/90 border border-blue-700/60 rounded text-[11px] text-blue-200 font-mono transition-colors cursor-pointer"
            title="Rust Data Engine & C Runtime Inspector"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rust/C Engine</span>
          </button>

          {/* User Quick Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 pl-1.5 py-0.5 hover:bg-[#142948] rounded transition-colors cursor-pointer"
            >
              {currentUser?.profile_photo ? (
                <img
                  src={currentUser.profile_photo}
                  alt={currentUser.display_name}
                  className="w-6 h-6 rounded-full object-cover border border-blue-400/80"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold text-white">
                  {currentUser?.display_name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs font-medium hidden md:inline truncate max-w-[90px]">
                {currentUser?.display_name?.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-blue-300" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white text-slate-800 rounded border border-slate-300 shadow-2xl z-50 text-xs divide-y divide-slate-100">
                <div className="p-3 bg-slate-50">
                  <div className="font-bold text-slate-900 text-sm">{currentUser?.display_name}</div>
                  <div className="text-slate-500 text-[11px] truncate">{currentUser?.email}</div>
                  <div className="text-[10px] text-blue-700 font-semibold mt-1">
                    {activeUniversity?.name} · Class of '{String(currentUser?.graduation_year).slice(-2)}
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Perspective (Multi-User Demo)
                  </div>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-50 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={u.profile_photo || ''} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <div className="truncate">
                          <span className="font-medium text-slate-800">{u.display_name}</span>
                          <span className="text-[10px] text-slate-500 ml-1">({u.university_name.split(' ')[0]})</span>
                        </div>
                      </div>
                      {u.id === currentUser?.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      onNavigate('profile', currentUser?.id);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-center py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition-colors"
                  >
                    View My Full Profile
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
