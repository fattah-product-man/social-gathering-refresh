import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { db, Guest } from '@/lib/db';
import { useGuestToken } from '@/lib/hooks';
import { GatherCard } from '@/components/GatherCard';
import { Chip } from '@/components/Chip';
import { Search, User, Sparkles } from 'lucide-react';
import { UserProfileModal } from '@/components/UserProfileModal';

export function People() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const token = useGuestToken();
  const [searchParams, setSearchParams] = useSearchParams();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [currentUser, setCurrentUser] = useState<Guest | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  useEffect(() => {
    if (eventId) {
      Promise.all([db.getGuests(eventId), token ? db.getGuest(eventId, token) : Promise.resolve(null)]).then(([data, me]) => {
        setGuests(data);
        setCurrentUser(me); setLoading(false);
      });
    }
  }, [eventId, token]);

  useEffect(() => { search ? setSearchParams({ search }) : setSearchParams({}); }, [search, setSearchParams]);

  useEffect(() => {
    const searchName = searchParams.get('search');
    if (searchName && guests.length > 0 && !selectedGuest) {
      const found = guests.find(g => g.name === searchName);
      if (found) setSelectedGuest(found);
    }
  }, [searchParams, guests]);

  const allInterests = Array.from(new Set(guests.flatMap(g => g.interests)));
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? g.interests.includes(filter) : true;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="p-8 text-center text-stone-400">Loading directory...</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Common Interests Card */}
      {currentUser && (
        <button
          onClick={() => navigate(`/e/${eventId}/common-interests`)}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-5 rounded-2xl shadow-lg shadow-purple-500/20 flex items-center gap-4 text-left group transition-transform active:scale-[0.98]"
        >
          <span className="text-4xl">✨</span>
          <div className="flex-1">
            <h3 className="text-white font-black text-lg">See who shares your interests</h3>
            <p className="text-white/70 text-sm font-medium">Find your vibe tribe</p>
          </div>
          <Sparkles className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
        </button>
      )}

      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-stone-800">People</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-emerald-500 outline-none shadow-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Chip selected={filter === null} onClick={() => setFilter(null)} className="whitespace-nowrap">All</Chip>
          {allInterests.map(i => (<Chip key={i} selected={filter === i} onClick={() => setFilter(filter === i ? null : i)} className="whitespace-nowrap">{i}</Chip>))}
        </div>
      </header>

      {guests.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No one has joined yet. Be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredGuests.map(guest => (
            <GatherCard key={guest.id} className="p-6 flex flex-col gap-4 cursor-pointer hover:bg-stone-50 transition-colors active:scale-[0.99]" onClick={() => setSelectedGuest(guest)}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                  {guest.avatar_url ? <img src={guest.avatar_url} alt={guest.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-stone-200"><User className="w-8 h-8 text-stone-400" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-stone-900 truncate">{guest.name}</h3>
                  {guest.answers?.['hashem_connection'] && <p className="text-xs font-medium text-stone-500 mt-1">Knows Hashem from: <span className="text-stone-700">{guest.answers['hashem_connection']}</span></p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">{guest.interests.map(i => (<span key={i} className="text-xs bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg font-medium">{i}</span>))}</div>
            </GatherCard>
          ))}
        </div>
      )}
      <UserProfileModal guest={selectedGuest} currentUser={currentUser} isOpen={!!selectedGuest} onClose={() => setSelectedGuest(null)} />
    </div>
  );
}
