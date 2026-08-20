import React from 'react';
import { Notification } from '../types';
import { Bell, UserPlus, Heart, MessageSquare, BookOpen, Check } from 'lucide-react';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNavigate: (view: string, targetId?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
  onNavigate,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPT':
        return <UserPlus className="w-4 h-4 text-blue-700" />;
      case 'POST_REACTION':
        return <Heart className="w-4 h-4 text-red-600" />;
      case 'POST_COMMENT':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-800" />;
    }
  };

  return (
    <div className="space-y-4" id="collegiate-notifications-view">
      
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-3.5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-900" />
            Campus Notifications & Dispatch
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time alerts for friend requests, wall responses, and academic updates
          </p>
        </div>

        <button
          onClick={onMarkAllAsRead}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded flex items-center gap-1 border border-slate-300 transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 text-blue-800" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-300 rounded divide-y divide-slate-100 shadow-xs overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            You have no notifications at this time.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 flex items-start gap-3 text-xs transition-colors ${
                !notif.is_read ? 'bg-blue-50/60' : 'hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1">
                <div className="font-bold text-slate-900">{notif.title}</div>
                <p className="text-slate-600 leading-relaxed mt-0.5 font-sans">{notif.body}</p>
                <div className="text-[10px] text-slate-400 mt-1">
                  {new Date(notif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>

              {!notif.is_read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
