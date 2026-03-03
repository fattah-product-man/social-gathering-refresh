// Types
export interface Event {
  id: string;
  name: string;
  host_name: string;
  reveal_matches: boolean;
  admin_passcode: string;
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

// Mock Data Store (LocalStorage) - Demo Mode
const MOCK_DELAY = 300;

const getMockData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setMockData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// DB Abstraction (Demo mode only - localStorage)
export const db = {
  async getEvent(id: string): Promise<Event | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const events = getMockData<Event>('mock_events');
    let event = events.find(e => e.id === id);
    
    if (!event && id === 'demo') {
      event = {
        id: 'demo',
        name: 'Ramadan Iftar 2026',
        host_name: 'Hashem',
        reveal_matches: false,
        admin_passcode: '1234',
        created_at: new Date().toISOString(),
        start_time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString()
      };
      setMockData('mock_events', [...events, event]);
    }
    return event || null;
  },

  async createGuest(guest: Omit<Guest, 'id' | 'created_at'>): Promise<Guest | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const guests = getMockData<Guest>('mock_guests');
    const newGuest: Guest = {
      ...guest,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    setMockData('mock_guests', [...guests, newGuest]);
    return newGuest;
  },

  async findGuestByName(eventId: string, name: string): Promise<Guest | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const guests = getMockData<Guest>('mock_guests');
    return guests.find(g => g.event_id === eventId && g.name.toLowerCase() === name.toLowerCase()) || null;
  },

  async getGuest(eventId: string, token: string): Promise<Guest | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const guests = getMockData<Guest>('mock_guests');
    return guests.find(g => g.event_id === eventId && g.guest_token === token) || null;
  },

  async getGuests(eventId: string): Promise<Guest[]> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const guests = getMockData<Guest>('mock_guests');
    if (guests.length === 0 && eventId === 'demo') {
      const fakeGuests: Guest[] = [
        {
          id: '1', event_id: 'demo', guest_token: 'fake1', name: 'Ali', energy_level: 'Social butterfly',
          goals: ['Make new friends', 'Explore ideas'], interests: ['AI/ML', 'Startups', 'Foodie'], answers: {}, created_at: new Date().toISOString()
        },
        {
          id: '2', event_id: 'demo', guest_token: 'fake2', name: 'Sara', energy_level: 'Balanced',
          goals: ['Find collaborators', 'Just vibe'], interests: ['Painting', 'Solo travel', 'Fiction'], answers: {}, created_at: new Date().toISOString()
        },
        {
          id: '3', event_id: 'demo', guest_token: 'fake3', name: 'Omar', energy_level: 'Chill',
          goals: ['Meet mentors'], interests: ['Finance', 'Spiritual growth'], answers: {}, created_at: new Date().toISOString()
        }
      ];
      setMockData('mock_guests', fakeGuests);
      return fakeGuests;
    }
    return guests.filter(g => g.event_id === eventId);
  },

  async updateGuest(eventId: string, token: string, updates: Partial<Guest>): Promise<Guest | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const guests = getMockData<Guest>('mock_guests');
    const index = guests.findIndex(g => g.event_id === eventId && g.guest_token === token);
    if (index === -1) return null;
    
    const updatedGuest = { ...guests[index], ...updates };
    guests[index] = updatedGuest;
    setMockData('mock_guests', guests);
    return updatedGuest;
  },

  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const feedbacks = getMockData<Feedback>('mock_feedback');
    const newFeedback: Feedback = {
      ...feedback,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    setMockData('mock_feedback', [...feedbacks, newFeedback]);
    return newFeedback;
  },

  async getWallPosts(eventId: string): Promise<WallPost[]> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const posts = getMockData<WallPost>('mock_wall_posts');
    return posts.filter(p => p.event_id === eventId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async createWallPost(post: Omit<WallPost, 'id' | 'created_at'>): Promise<WallPost | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const posts = getMockData<WallPost>('mock_wall_posts');
    const newPost: WallPost = {
      ...post,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    setMockData('mock_wall_posts', [newPost, ...posts]);
    return newPost;
  },

  async saveScore(score: Omit<Score, 'id' | 'created_at'>): Promise<Score | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const scores = getMockData<Score>('mock_scores');
    const newScore: Score = {
      ...score,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    setMockData('mock_scores', [...scores, newScore]);
    return newScore;
  },

  async getLeaderboard(eventId: string, gameId: string): Promise<Score[]> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const scores = getMockData<Score>('mock_scores');
    return scores
      .filter(s => s.event_id === eventId && s.game_id === gameId)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  },

  async toggleRevealMatches(eventId: string, reveal: boolean): Promise<Event | null> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const events = getMockData<Event>('mock_events');
    const index = events.findIndex(e => e.id === eventId);
    if (index === -1) return null;
    
    events[index].reveal_matches = reveal;
    setMockData('mock_events', events);
    return events[index];
  }
};
