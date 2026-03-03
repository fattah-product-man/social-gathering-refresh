import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, Guest } from '@/lib/db';
import { useGuestToken } from '@/lib/hooks';
import { ArrowLeft, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserProfileModal } from '@/components/UserProfileModal';

export function CommonInterests() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const token = useGuestToken();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [currentUser, setCurrentUser] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  useEffect(() => {
    if (eventId && token) {
      Promise.all([db.getGuests(eventId), db.getGuest(eventId, token)]).then(([allGuests, me]) => {
        setCurrentUser(me);
        if (me) {
          const matched = allGuests
            .filter(g => g.guest_token !== token)
            .map(g => ({
              guest: g,
              common: g.interests.filter(i => me.interests.includes(i))
            }))
            .filter(m => m.common.length > 0)
            .sort((a, b) => b.common.length - a.common.length);
          setGuests(matched.map(m => m.guest));
        }
        setLoading(false);
      });
    }
  }, [eventId, token]);

  const getCommonInterests = (guest: Guest) => {
    if (!currentUser) return [];
    return guest.interests.filter(i => currentUser.interests.includes(i));
  };

  if (loading) return <div className="p-8 text-center text-stone-400">Finding your people...</div>;

  return (
    <div className="space-y-6 pb-20">
      <header className="space-y-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 font-medium mb-2">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-black text-stone-800">Common Interests</h1>
        </div>
        <p className="text-stone-500 font-medium">People who share your vibes</p>
      </header>

      {guests.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No matches yet. More people need to join!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {guests.map((guest, idx) => {
            const common = getCommonInterests(guest);
            return (
              <motion.div
                key={guest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedGuest(guest)}
                className="relative p-6 rounded-2xl cursor-pointer transition-all active:scale-[0.98] bg-white border border-stone-100 shadow-sm overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                      {guest.avatar_url ? <img src={guest.avatar_url} alt={guest.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-stone-200"><User className="w-7 h-7 text-stone-400" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-stone-900 truncate">{guest.name}</h3>
                      <p className="text-sm text-purple-600 font-bold">{common.length} shared interest{common.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {guest.interests.map(i => {
                      const isCommon = common.includes(i);
                      return (
                        <span key={i} className={`text-xs px-3 py-1.5 rounded-lg font-bold ${isCommon ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}>
                          {isCommon && '✨ '}{i}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <UserProfileModal guest={selectedGuest} currentUser={currentUser} isOpen={!!selectedGuest} onClose={() => setSelectedGuest(null)} />
    </div>
  );
}
