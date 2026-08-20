import React from 'react';
import {
  Home,
  User as UserIcon,
  Users,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Bell,
  Settings,
  Terminal,
  Shield,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { User, University } from '../types';

interface SidebarNavProps {
  currentView: string;
  onNavigate: (view: string, targetId?: string) => void;
  currentUser: User | null;
  activeUniversity: University | null;
  allUniversities: University[];
  onSelectUniversity: (uniId: string) => void;
  unreadMessagesCount: number;
  unreadNotifsCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentView,
  onNavigate,
  currentUser,
  activeUniversity,
  allUniversities,
  onSelectUniversity,
  unreadMessagesCount,
  unreadNotifsCount,
}) => {
  const navItems = [
    { id: 'feed', label: 'News Feed', icon: Home },
    { id: 'profile', label: 'My Profile', icon: UserIcon, targetId: currentUser?.id },
    { id: 'directory', label: 'Campus Directory', icon: Users },
    { id: 'friends', label: 'Friends & Graph', icon: Users },
    { id: 'courses', label: 'Courses & Depts', icon: BookOpen },
    { id: 'groups', label: 'Societies & Groups', icon: Layers },
    { id: 'events', label: 'Campus Events', icon: Calendar },
    { id: 'photos', label: 'Photos & Media', icon: ImageIcon },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'settings', label: 'Privacy & Settings', icon: Settings },
    { id: 'console', label: 'Rust/C Engine Lab', icon: Terminal },
  ];

  return (
    <nav className="w-full space-y-4" id="collegiate-left-nav">
      
      {/* University Emblem Box */}
      {activeUniversity && (
        <div className="bg-white border border-slate-300 rounded p-3 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
            {activeUniversity.crest_url ? (
              <img src={activeUniversity.crest_url} alt={activeUniversity.name} className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-6 h-6 text-blue-900" />
            )}
          </div>
          <h2 className="font-serif font-bold text-slate-900 text-xs tracking-tight line-clamp-1">
            {activeUniversity.name}
          </h2>
          <p className="text-[10px] text-slate-500 italic mt-0.5 font-serif">"{activeUniversity.motto}"</p>
          
          {/* Institutional Switcher */}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left mb-1">
              Campus Affiliation:
            </label>
            <select
              value={activeUniversity.id}
              onChange={(e) => onSelectUniversity(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-slate-700 focus:outline-none focus:border-blue-500 font-sans"
            >
              {allUniversities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <div className="bg-white border border-slate-300 rounded divide-y divide-slate-100 shadow-xs overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id, item.targetId)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-900 font-bold border-l-3 border-blue-800'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-blue-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-800' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Engineering Specs Badge */}
      <div className="bg-slate-100 border border-slate-300 rounded p-2.5 text-[11px] text-slate-600 font-mono">
        <div className="flex items-center gap-1.5 text-blue-950 font-bold text-[11px] mb-1">
          <Shield className="w-3.5 h-3.5 text-blue-800" />
          <span>System Specs</span>
        </div>
        <div className="space-y-0.5 text-[10px]">
          <div><span className="text-slate-400">Backend:</span> Rust 1.85 (SQLx)</div>
          <div><span className="text-slate-400">Storage:</span> PostgreSQL 16</div>
          <div><span className="text-slate-400">Client:</span> C + WASM Arena</div>
          <div><span className="text-slate-400">Security:</span> Argon2id</div>
        </div>
      </div>

    </nav>
  );
};
