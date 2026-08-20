import React, { useState, useEffect } from 'react';
import {
  User,
  University,
  Post,
  FriendRequest,
  UserSummary,
  FeedAlgorithm,
  VisibilityType,
  Notification,
} from './types';
import { TopBar } from './components/TopBar';
import { SidebarNav } from './components/SidebarNav';
import { RightRail } from './components/RightRail';
import { FeedView } from './components/FeedView';
import { ProfileView } from './components/ProfileView';
import { DirectoryView } from './components/DirectoryView';
import { FriendsView } from './components/FriendsView';
import { CoursesView } from './components/CoursesView';
import { GroupsView } from './components/GroupsView';
import { EventsView } from './components/EventsView';
import { MessagesView } from './components/MessagesView';
import { PhotosView } from './components/PhotosView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { EngineConsole } from './components/EngineConsole';
import { QuickChatModal } from './components/QuickChatModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [activeUniversity, setActiveUniversity] = useState<University | null>(null);
  const [currentView, setCurrentView] = useState<string>('feed');
  const [viewTargetId, setViewTargetId] = useState<string | undefined>(undefined);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedAlgorithm, setFeedAlgorithm] = useState<FeedAlgorithm>('chronological');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [graphSuggestions, setGraphSuggestions] = useState<Array<{ user: UserSummary; mutual_count: number; reason: string }>>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserSummary[]>([]);
  
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [activeQuickChatUser, setActiveQuickChatUser] = useState<UserSummary | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // 1. Initial Load of Core Identity & System State
  const loadInitialData = async () => {
    try {
      // Get current authenticated user
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const data = await userRes.json();
        setCurrentUser(data.user || data);
      }

      // Get universities list
      const uniRes = await fetch('/api/universities');
      if (uniRes.ok) {
        const unis = await uniRes.json();
        setUniversities(unis);
        if (unis.length > 0) setActiveUniversity(unis[0]);
      }

      // Get directory summary list
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const uList = await usersRes.json();
        setAllUsers(uList);
        setOnlineUsers(uList.slice(0, 5));
      }

      // Get feed posts
      await loadFeedPosts('chronological');

      // Get friend requests
      const reqRes = await fetch('/api/friend-requests');
      if (reqRes.ok) {
        const reqs = await reqRes.json();
        setFriendRequests(reqs);
      }

      // Get social graph suggestions
      const suggRes = await fetch('/api/friends/suggestions');
      if (suggRes.ok) {
        const suggs = await suggRes.json();
        setGraphSuggestions(suggs);
      }

      // Get notifications
      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const notifs = await notifRes.json();
        setNotifications(notifs);
      }
    } catch (err) {
      console.error('Initial load failed', err);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const loadFeedPosts = async (algo: FeedAlgorithm) => {
    try {
      const res = await fetch(`/api/feed?algorithm=${algo}`);
      if (res.ok) {
        const postList = await res.json();
        setPosts(postList);
      }
    } catch (err) {
      console.error('Feed load failed', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // 2. Navigation Handler
  const handleNavigate = (view: string, targetId?: string) => {
    if (view === 'console') {
      setIsConsoleOpen(true);
      return;
    }
    setCurrentView(view);
    setViewTargetId(targetId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Switch User Perspective (Multi-User Demo)
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user || data);
        // Refresh feed and requests for this user
        loadFeedPosts(feedAlgorithm);
        const reqRes = await fetch('/api/friend-requests');
        if (reqRes.ok) setFriendRequests(await reqRes.json());
      }
    } catch (err) {
      console.error('User switch failed', err);
    }
  };

  // 4. Post Actions
  const handleCreatePost = async (content: string, mediaUrls: string[], visibility: VisibilityType) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, media_urls: mediaUrls, visibility }),
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts((prev) => [newPost, ...prev]);
      }
    } catch (err) {
      console.error('Post creation error', err);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [...p.comments, newComment],
                  comments_count: p.comments_count + 1,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Comment creation error', err);
    }
  };

  const handleToggleReaction = async (postId: string, type: 'LIKE' | 'ACADEMIC_INSIGHT' | 'LOVE' | 'CELEBRATE') => {
    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  reactions: updated.reactions,
                  reactions_count: updated.reactions.length,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Reaction toggle error', err);
    }
  };

  // 5. Friend Request Actions
  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: targetUserId }),
      });
      if (res.ok) {
        alert('Academic friend request sent via Rust Graph Engine.');
        setGraphSuggestions((prev) => prev.filter((s) => s.user.id !== targetUserId));
      }
    } catch (err) {
      console.error('Friend request error', err);
    }
  };

  const handleAcceptFriendRequest = async (requestId: string, senderId: string) => {
    try {
      const res = await fetch(`/api/friend-requests/${requestId}/accept`, { method: 'POST' });
      if (res.ok) {
        setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
        setNotifications((prev) => [
          {
            id: String(Date.now()),
            type: 'FRIEND_ACCEPT',
            title: 'Friendship Confirmed',
            body: 'You are now connected in the institutional social graph.',
            is_read: false,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Accept request error', err);
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      await fetch(`/api/friend-requests/${requestId}/reject`, { method: 'POST' });
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error('Reject request error', err);
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      await fetch(`/api/friends/${userId}`, { method: 'DELETE' });
      alert('Friend removed from social graph.');
    } catch (err) {
      console.error('Remove friend error', err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark read error', err);
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;
  const unreadMessagesCount = 1; // initial unread count

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-mono text-xs text-slate-600">
        <div className="text-center space-y-2">
          <div className="font-serif font-bold text-xl text-blue-950">COLLEGIATE</div>
          <div className="text-slate-400">Bootstrapping Rust Database Engine & C WASM Memory Arena...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-800 font-sans selection:bg-blue-200" id="collegiate-app">
      
      {/* Universal Top Bar */}
      <TopBar
        currentUser={currentUser}
        activeUniversity={activeUniversity}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotifsCount={unreadNotifsCount}
        onNavigate={handleNavigate}
        onToggleConsole={() => setIsConsoleOpen(true)}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
      />

      {/* 3-Column Classic Academic Grid Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4">
        
        {/* Left Navigation Column (3 cols on lg, 1 col on md) */}
        <div className="md:col-span-1 lg:col-span-3">
          <SidebarNav
            currentView={currentView}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            activeUniversity={activeUniversity}
            allUniversities={universities}
            onSelectUniversity={(uniId) => {
              const u = universities.find((x) => x.id === uniId);
              if (u) setActiveUniversity(u);
            }}
            unreadMessagesCount={unreadMessagesCount}
            unreadNotifsCount={unreadNotifsCount}
          />
        </div>

        {/* Center Main Content Area (6 cols on lg, 2 cols on md) */}
        <main className="md:col-span-2 lg:col-span-6 space-y-4" id="collegiate-main-content">
          
          {currentView === 'feed' && (
            <FeedView
              posts={posts}
              currentUser={currentUser}
              currentAlgorithm={feedAlgorithm}
              onSelectAlgorithm={(algo) => {
                setFeedAlgorithm(algo);
                loadFeedPosts(algo);
              }}
              onCreatePost={handleCreatePost}
              onAddComment={handleAddComment}
              onToggleReaction={handleToggleReaction}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              profileUserId={viewTargetId || currentUser?.id || 'u1'}
              currentUser={currentUser}
              onSendFriendRequest={handleSendFriendRequest}
              onRemoveFriend={handleRemoveFriend}
              onOpenChatWith={(u) => setActiveQuickChatUser(u)}
              onNavigate={handleNavigate}
              allPosts={posts}
            />
          )}

          {currentView === 'directory' && (
            <DirectoryView
              universities={universities}
              onNavigate={handleNavigate}
              onSendFriendRequest={handleSendFriendRequest}
              onOpenChatWith={(u) => setActiveQuickChatUser(u)}
            />
          )}

          {currentView === 'friends' && (
            <FriendsView
              currentUser={currentUser}
              friendRequests={friendRequests}
              suggestions={graphSuggestions}
              onAcceptRequest={handleAcceptFriendRequest}
              onRejectRequest={handleRejectFriendRequest}
              onSendRequest={handleSendFriendRequest}
              onRemoveFriend={handleRemoveFriend}
              onOpenChatWith={(u) => setActiveQuickChatUser(u)}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'courses' && (
            <CoursesView
              activeUniversity={activeUniversity}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'groups' && (
            <GroupsView
              activeUniversity={activeUniversity}
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'events' && (
            <EventsView
              activeUniversity={activeUniversity}
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'messages' && (
            <MessagesView
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'photos' && <PhotosView />}

          {currentView === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotifsRead}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'settings' && <SettingsView currentUser={currentUser} />}

        </main>

        {/* Right Info & Activity Rail (3 cols on lg, 1 col on md) */}
        <div className="md:col-span-1 lg:col-span-3">
          <RightRail
            currentUser={currentUser}
            friendRequests={friendRequests}
            suggestions={graphSuggestions}
            onlineUsers={onlineUsers}
            onAcceptRequest={handleAcceptFriendRequest}
            onRejectRequest={handleRejectFriendRequest}
            onSendRequest={handleSendFriendRequest}
            onNavigate={handleNavigate}
            onOpenChatWith={(u) => setActiveQuickChatUser(u)}
          />
        </div>

      </div>

      {/* Floating Instant Messenger Modal */}
      {activeQuickChatUser && (
        <QuickChatModal
          peerUser={activeQuickChatUser}
          currentUser={currentUser}
          onClose={() => setActiveQuickChatUser(null)}
        />
      )}

      {/* Rust & C Systems Architecture Console Modal */}
      <EngineConsole
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        allUsers={allUsers}
      />

    </div>
  );
}
