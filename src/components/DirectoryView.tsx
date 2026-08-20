import React, { useState, useEffect } from 'react';
import { UserSummary, University, Department } from '../types';
import { Search, Filter, GraduationCap, UserPlus, MessageSquare, BookOpen, MapPin } from 'lucide-react';

interface DirectoryViewProps {
  universities: University[];
  onNavigate: (view: string, targetId?: string) => void;
  onSendFriendRequest: (userId: string) => void;
  onOpenChatWith: (user: UserSummary) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  universities,
  onNavigate,
  onSendFriendRequest,
  onOpenChatWith,
}) => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [selectedGradYear, setSelectedGradYear] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedUniversity) params.append('university_id', selectedUniversity);
      if (selectedGradYear) params.append('graduation_year', selectedGradYear);
      if (searchQuery) params.append('q', searchQuery);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Directory fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedUniversity, selectedGradYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="space-y-4" id="collegiate-directory-view">
      
      {/* Search and Filters Card */}
      <div className="bg-white border border-slate-300 rounded p-3.5 shadow-xs">
        <div className="border-b border-slate-100 pb-2 mb-3">
          <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-900" />
            Universal Collegiate Academic Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query verified student, faculty, and alumni records across institutions
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, major, research topic..."
              className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full py-1.5 px-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-xs bg-white"
            >
              <option value="">All Universities</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedGradYear}
              onChange={(e) => setSelectedGradYear(e.target.value)}
              className="w-full py-1.5 px-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-xs bg-white"
            >
              <option value="">All Class Years</option>
              <option value="2025">Class of 2025</option>
              <option value="2026">Class of 2026</option>
              <option value="2027">Class of 2027</option>
              <option value="2028">Class of 2028</option>
            </select>
          </div>

        </form>
      </div>

      {/* Directory Grid */}
      <div className="bg-white border border-slate-300 rounded p-3 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 border-b border-slate-100 pb-2">
          <span>Displaying <strong className="text-slate-800">{users.length}</strong> academic records</span>
          <span className="font-mono text-[10px]">Rust Graph Index: ACTIVE</span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">
            Searching directory indices...
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No students found matching your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-3 bg-slate-50/70 border border-slate-200 rounded flex items-start justify-between gap-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-2.5 truncate">
                  <img
                    src={user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                    alt={user.display_name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-300 shrink-0 cursor-pointer"
                    onClick={() => onNavigate('profile', user.id)}
                  />
                  <div className="truncate text-xs">
                    <button
                      onClick={() => onNavigate('profile', user.id)}
                      className="font-bold text-blue-900 hover:underline text-left block truncate cursor-pointer"
                    >
                      {user.display_name}
                    </button>
                    <div className="text-[11px] text-slate-700 font-medium truncate">
                      {user.university_name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Class of '{String(user.graduation_year).slice(-2)} · {user.major || 'Undergraduate'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => onNavigate('profile', user.id)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onOpenChatWith(user)}
                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold text-blue-900 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
