import React, { useState, useEffect } from 'react';
import { Group, University, User } from '../types';
import { Layers, Users, Plus, Check, Shield, Lock, Globe, MessageSquare } from 'lucide-react';

interface GroupsViewProps {
  activeUniversity: University | null;
  currentUser: User | null;
  onNavigate: (view: string, targetId?: string) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({ activeUniversity, currentUser, onNavigate }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState<'ACADEMIC' | 'SOCIETY' | 'DEBATE' | 'SPORTS'>('ACADEMIC');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [activeUniversity]);

  const handleToggleJoin = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, is_member: result.is_member, member_count: result.member_count }
              : g
          )
        );
      }
    } catch (err) {
      console.error('Join error', err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
          category: newGroupCat,
          privacy: newGroupPrivacy,
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewGroupName('');
        setNewGroupDesc('');
        fetchGroups();
      }
    } catch (err) {
      console.error('Group creation failed', err);
    }
  };

  return (
    <div className="space-y-4" id="collegiate-groups-view">
      
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-3.5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-900" />
            University Societies & Student Groups
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic organizations, debate unions, varsity teams, and collegiate societies
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#1d3c6a] hover:bg-[#152c4e] text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Society</span>
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="bg-white border border-blue-300 rounded p-4 shadow-md text-xs space-y-3">
          <div className="font-bold text-slate-900 text-sm">Register New Student Society</div>
          <form onSubmit={handleCreateGroup} className="space-y-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Society / Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Oxford Philological Union"
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Charter & Purpose</label>
              <textarea
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="Explain the mission, weekly meeting agenda, and membership requirements..."
                rows={2}
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newGroupCat}
                  onChange={(e) => setNewGroupCat(e.target.value as any)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  <option value="ACADEMIC">Academic / Research</option>
                  <option value="DEBATE">Debate & Politics</option>
                  <option value="SOCIETY">Cultural Society</option>
                  <option value="SPORTS">Athletics / Crew</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Membership Privacy</label>
                <select
                  value={newGroupPrivacy}
                  onChange={(e) => setNewGroupPrivacy(e.target.value as any)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  <option value="OPEN">Open (Any student can join)</option>
                  <option value="CLOSED">Closed (Requires officer approval)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-[#1d3c6a] text-white rounded font-bold"
              >
                Submit Charter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs flex flex-col justify-between text-xs"
          >
            <div>
              {group.cover_image && (
                <div className="h-28 w-full overflow-hidden bg-slate-100">
                  <img src={group.cover_image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    {group.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {group.privacy === 'OPEN' ? 'Open Society' : 'Officer Selective'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm font-serif">{group.name}</h3>
                <p className="text-slate-600 text-[11px] leading-relaxed mt-1 line-clamp-2 font-sans">
                  {group.description}
                </p>
                {group.meeting_location && (
                  <div className="text-[10px] text-slate-500 mt-2 italic">
                    Location: {group.meeting_location}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {group.member_count} members
              </span>

              <button
                onClick={() => handleToggleJoin(group.id)}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  group.is_member
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-[#1d3c6a] hover:bg-[#152c4e] text-white shadow-xs'
                }`}
              >
                {group.is_member ? (
                  <>
                    <Check className="w-3 h-3" /> Member
                  </>
                ) : (
                  'Join Group'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
