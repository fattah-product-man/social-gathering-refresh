import React from 'react';
import { useParams } from 'react-router-dom';

export function MiniGames() {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-stone-800">Mini Games</h1>
        <p className="text-stone-500 font-medium">Coming soon! 🎮</p>
      </header>
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-stone-100">
        <div className="text-6xl mb-4">🎲</div>
        <h2 className="text-xl font-bold text-stone-800 mb-2">Games are being prepared</h2>
        <p className="text-stone-500">Check back during the event for fun mini-games!</p>
      </div>
    </div>
  );
}
