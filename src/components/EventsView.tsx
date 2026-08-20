import React, { useState, useEffect } from 'react';
import { CampusEvent, University, User } from '../types';
import { Calendar, MapPin, Clock, Users, Plus, Check } from 'lucide-react';

interface EventsViewProps {
  activeUniversity: University | null;
  currentUser: User | null;
  onNavigate: (view: string, targetId?: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ activeUniversity, currentUser }) => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCat, setNewCat] = useState<'ACADEMIC' | 'SOCIAL' | 'CAREER' | 'SPORTS'>('ACADEMIC');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Events load failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeUniversity]);

  const handleToggleRsvp = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ATTENDING' }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, is_attending: data.is_attending, attendees_count: data.attendees_count }
              : e
          )
        );
      }
    } catch (err) {
      console.error('RSVP failed', err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          location: newLocation,
          start_time: newDate || new Date().toISOString(),
          category: newCat,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewLocation('');
        fetchEvents();
      }
    } catch (err) {
      console.error('Event create error', err);
    }
  };

  const filteredEvents = filterCat === 'ALL'
    ? events
    : events.filter((e) => e.category === filterCat);

  return (
    <div className="space-y-4" id="collegiate-events-view">
      
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-3.5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-900" />
            Campus Events & Colloquiums
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Collegiate guest lectures, formal yard balls, midterm study circles, and hackathons
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1d3c6a] hover:bg-[#152c4e] text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Host Event</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-1.5 text-xs">
        {['ALL', 'ACADEMIC', 'SOCIAL', 'CAREER', 'SPORTS'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
              filterCat === cat ? 'bg-[#1d3c6a] text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Events' : cat}
          </button>
        ))}
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="bg-white border border-blue-300 rounded p-4 shadow-md text-xs space-y-3">
          <div className="font-bold text-slate-900 text-sm">Post University Event Notice</div>
          <form onSubmit={handleCreateEvent} className="space-y-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Event Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Annual Economics Faculty Colloquium"
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Description & Agenda</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                placeholder="Details on guest speakers, room reservations, catering..."
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Sterling Hall 204"
                  className="w-full p-1.5 border border-slate-300 rounded text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as any)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  <option value="ACADEMIC">Academic</option>
                  <option value="SOCIAL">Social</option>
                  <option value="CAREER">Career & Recruiting</option>
                  <option value="SPORTS">Sports & Varsity</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-[#1d3c6a] text-white rounded font-bold"
              >
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Stream */}
      <div className="space-y-3">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white border border-slate-300 rounded p-3.5 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-3 text-xs"
          >
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                  {evt.category}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Hosted by {evt.creator_name || 'Department Committee'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm font-serif">{evt.title}</h3>
              <p className="text-slate-700 leading-relaxed font-sans">{evt.description}</p>

              <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(evt.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.location}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{evt.attendees_count} attending</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 self-stretch sm:self-center">
              <button
                onClick={() => handleToggleRsvp(evt.id)}
                className={`w-full sm:w-auto px-4 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                  evt.is_attending
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-[#1d3c6a] hover:bg-[#152c4e] text-white shadow-xs'
                }`}
              >
                {evt.is_attending ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> RSVP'd (Attending)
                  </>
                ) : (
                  'RSVP: Attend'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
