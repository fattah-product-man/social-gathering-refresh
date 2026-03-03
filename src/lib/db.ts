import { supabase } from '@/integrations/supabase/client';

// Types
export interface Event {
  id: string;
  name: string;
  host_name: string;
  reveal_matches: boolean;
  admin_passcode?: string; // never returned from events_public view
  created_at: string;
  start_time?: string;
}

export interface Guest {
  id: string;
  event_id: string;
  guest_token: string;
  name: string;
  avatar_url?: string;
  instagram?: string;
  energy_level: 'Chill' | 'Balanced' | 'Social butterfly';
  goals: string[];
  interests: string[];
  answers: Record<string, string>;
  created_at: string;
  color?: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  guest_token: string;
  responses: Record<string, string>;
  created_at: string;
}

export interface Score {
  id: string;
  event_id: string;
  guest_token: string;
  guest_name: string;
  game_id: string;
  score: number;
  created_at: string;
  metadata?: any;
}

export interface WallPost {
  id: string;
  event_id: string;
  guest_token: string;
  guest_name: string;
  message: string;
  gif_url: string;
  created_at: string;
}

// DB Abstraction — Supabase
export const db = {
  async getEvent(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events_public')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as Event;
  },

  async createGuest(guest: Omit<Guest, 'id' | 'created_at'>): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .insert({
        event_id: guest.event_id,
        guest_token: guest.guest_token,
        name: guest.name,
        avatar_url: guest.avatar_url || null,
        instagram: guest.instagram || null,
        energy_level: guest.energy_level || 'Balanced',
        goals: guest.goals || [],
        interests: guest.interests || [],

        answers: guest.answers || {},
        color: guest.color || null,
      })
      .select()
      .single();
    if (error) { console.error('createGuest error:', error); return null; }
    return data as unknown as Guest;
  },

  async findGuestByName(eventId: string, name: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .ilike('name', name)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as Guest;
  },

  async getGuest(eventId: string, token: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .eq('guest_token', token)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as Guest;
  },

  async getGuests(eventId: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId);
    if (error) { console.error('getGuests error:', error); return []; }
    return (data || []) as unknown as Guest[];
  },

  async updateGuest(eventId: string, token: string, updates: Partial<Guest>): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('event_id', eventId)
      .eq('guest_token', token)
      .select()
      .single();
    if (error) { console.error('updateGuest error:', error); return null; }
    return data as unknown as Guest;
  },

  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback | null> {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single();
    if (error) { console.error('createFeedback error:', error); return null; }
    return data as unknown as Feedback;
  },

  async getWallPosts(eventId: string): Promise<WallPost[]> {
    const { data, error } = await supabase
      .from('wall_posts')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) { console.error('getWallPosts error:', error); return []; }
    return (data || []) as unknown as WallPost[];
  },

  async createWallPost(post: Omit<WallPost, 'id' | 'created_at'>): Promise<WallPost | null> {
    const { data, error } = await supabase
      .from('wall_posts')
      .insert(post)
      .select()
      .single();
    if (error) { console.error('createWallPost error:', error); return null; }
    return data as unknown as WallPost;
  },

  async saveScore(score: Omit<Score, 'id' | 'created_at'>): Promise<Score | null> {
    const { data, error } = await supabase
      .from('scores')
      .insert(score)
      .select()
      .single();
    if (error) { console.error('saveScore error:', error); return null; }
    return data as unknown as Score;
  },

  async getLeaderboard(eventId: string, gameId: string): Promise<Score[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('event_id', eventId)
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(10);
    if (error) { console.error('getLeaderboard error:', error); return []; }
    return (data || []) as unknown as Score[];
  },

  async toggleRevealMatches(eventId: string, reveal: boolean, passcode: string): Promise<Event | null> {
    const { data, error } = await supabase.functions.invoke('admin-action', {
      body: { event_id: eventId, passcode, action: 'toggle_reveal', payload: { reveal } },
    });
    if (error) { console.error('toggleRevealMatches error:', error); return null; }
    return data as Event;
  },

  async adminVerify(eventId: string, passcode: string): Promise<{ verified: boolean; event?: Event } | null> {
    const { data, error } = await supabase.functions.invoke('admin-action', {
      body: { event_id: eventId, passcode, action: 'verify' },
    });
    if (error) { console.error('adminVerify error:', error); return null; }
    return data;
  },

  async adminGetGuests(eventId: string, passcode: string): Promise<Guest[]> {
    const { data, error } = await supabase.functions.invoke('admin-action', {
      body: { event_id: eventId, passcode, action: 'get_guests' },
    });
    if (error) { console.error('adminGetGuests error:', error); return []; }
    return data as Guest[];
  },

  async uploadAvatar(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
    if (error) { console.error('uploadAvatar error:', error); return null; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return urlData.publicUrl;
  },
};
