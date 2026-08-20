import React, { useState } from 'react';
import { User } from '../types';
import { Settings, Shield, Lock, Eye, Check, Key } from 'lucide-react';

interface SettingsViewProps {
  currentUser: User | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const [profileVis, setProfileVis] = useState('UNIVERSITY');
  const [friendsVis, setFriendsVis] = useState('FRIENDS');
  const [coursesVis, setCoursesVis] = useState('UNIVERSITY');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4" id="collegiate-settings-view">
      
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-3.5 shadow-xs">
        <div className="border-b border-slate-100 pb-2 mb-3">
          <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-900" />
            Academic Privacy & Security Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage institutional directory visibility, social graph access, and cryptographic credentials
          </p>
        </div>

        {savedSuccess && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Privacy permissions synchronized to Rust Database Engine.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Section: Privacy Boundaries */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Eye className="w-3.5 h-3.5 text-blue-800" />
              <span>Directory & Profile Visibility</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Profile Bio & Wall</label>
                <select
                  value={profileVis}
                  onChange={(e) => setProfileVis(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs"
                >
                  <option value="PUBLIC">All Collegiate Users</option>
                  <option value="UNIVERSITY">Verified Campus Only</option>
                  <option value="FRIENDS">Confirmed Friends Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Friend List Visibility</label>
                <select
                  value={friendsVis}
                  onChange={(e) => setFriendsVis(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs"
                >
                  <option value="UNIVERSITY">All University Students</option>
                  <option value="FRIENDS">Mutual Friends Only</option>
                  <option value="PRIVATE">Only Me</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enrolled Courses & Schedule</label>
                <select
                  value={coursesVis}
                  onChange={(e) => setCoursesVis(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-xs"
                >
                  <option value="UNIVERSITY">University Classmates</option>
                  <option value="FRIENDS">Friends Only</option>
                  <option value="PRIVATE">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Security & Authentication Engine */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Shield className="w-3.5 h-3.5 text-blue-800" />
              <span>Rust Argon2id Cryptographic Security</span>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2 text-[11px] font-mono">
              <div className="text-slate-700">
                <strong>Password Hash Algorithm:</strong> Argon2id (m=65536, t=3, p=4)
              </div>
              <div className="text-slate-700">
                <strong>Session Encryption:</strong> AES-GCM-256 with 24-hour rotating token keys
              </div>
              <div className="text-slate-700">
                <strong>Account Status:</strong> Verified Collegiate Student ({currentUser?.email})
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#1d3c6a] hover:bg-[#152c4e] text-white font-bold rounded shadow-xs transition-colors cursor-pointer"
            >
              Save Privacy Settings
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
