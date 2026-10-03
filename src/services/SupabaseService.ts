/**
 * SupabaseService.ts
 *
 * Unified Supabase client for Aura Vega TV.
 * Handles database persistence, real-time presence/sync, and vector storage.
 *
 * Architecture:
 *  - PostgreSQL: Households, profiles, sessions, analytics events
 *  - Realtime: Broadcast + Presence channels (co-viewing sync)
 *  - pgvector: AI embedding storage for semantic recommendations
 */

import { MediaItem, VotingParticipant, ViewingContext } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface HouseholdSession {
  id: string;
  householdId: string;
  startedAt: string;
  endedAt?: string;
  participants: string[];
  selectedContent?: string;
  consensusScore: number;
}

export interface ViewingEvent {
  sessionId: string;
  profileId: string;
  mediaId: string;
  eventType: 'start' | 'pause' | 'resume' | 'stop' | 'seek' | 'vote';
  position?: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface PresenceState {
  profileId: string;
  name: string;
  status: 'online' | 'away' | 'voting';
  currentVote?: string;
  lastSeen: string;
}

// ---------------------------------------------------------------------------
// Mock Supabase Client (production-ready interface, simulator-safe fallback)
// ---------------------------------------------------------------------------
class SupabaseClient {
  private readonly url: string;
  private readonly anonKey: string;

  // In-memory store for simulator/offline operation
  private store: Map<string, unknown[]> = new Map();
  private realtimeChannels: Map<string, ((payload: unknown) => void)[]> = new Map();

  constructor() {
    // Pull from environment; fall back to demo values for simulator
    this.url = process.env.SUPABASE_URL ?? 'https://xyzcompany.supabase.co';
    this.anonKey = process.env.SUPABASE_ANON_KEY ?? 'demo-anon-key';
    this.initializeTables();
  }

  private initializeTables(): void {
    ['households', 'profiles', 'sessions', 'events', 'embeddings', 'watchlist'].forEach(
      (t) => this.store.set(t, []),
    );
  }

  // ---------- Database Operations ----------

  async from(table: string) {
    const self = this;
    return {
      async insert(rows: unknown[]) {
        const existing = (self.store.get(table) ?? []) as unknown[];
        self.store.set(table, [...existing, ...rows]);
        return { data: rows, error: null };
      },
      async select(_cols?: string) {
        return { data: self.store.get(table) ?? [], error: null };
      },
      async upsert(rows: unknown[]) {
        const existing = (self.store.get(table) ?? []) as unknown[];
        self.store.set(table, [...existing, ...rows]);
        return { data: rows, error: null };
      },
      eq(_col: string, _val: unknown) {
        return this;
      },
      order(_col: string, _opts?: { ascending: boolean }) {
        return this;
      },
      limit(_n: number) {
        return this;
      },
    };
  }

  // ---------- Realtime Operations ----------

  channel(name: string) {
    const self = this;
    if (!self.realtimeChannels.has(name)) {
      self.realtimeChannels.set(name, []);
    }
    return {
      on(_event: string, _filter: Record<string, string>, cb: (payload: unknown) => void) {
        self.realtimeChannels.get(name)!.push(cb);
        return this;
      },
      subscribe(cb?: (status: string) => void) {
        cb?.('SUBSCRIBED');
        return this;
      },
      async send(payload: { type: string; event: string; payload: unknown }) {
        const listeners = self.realtimeChannels.get(name) ?? [];
        listeners.forEach((fn) => fn(payload.payload));
      },
    };
  }

  // ---------- Storage (CDN layer) ----------

  storage = {
    from: (_bucket: string) => ({
      upload: async (_path: string, _file: unknown) => ({ data: { path: _path }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `${this.url}/storage/v1/object/public/${path}` } }),
    }),
  };

  // ---------- RPC / Edge Functions ----------
  async rpc(fnName: string, params?: Record<string, unknown>) {
    console.log(`[Supabase RPC] ${fnName}`, params);
    return { data: null, error: null };
  }
}

// Singleton
const supabase = new SupabaseClient();

// ---------------------------------------------------------------------------
// Session Persistence Service
// ---------------------------------------------------------------------------
export class SessionService {
  async createSession(
    householdId: string,
    participants: VotingParticipant[],
  ): Promise<HouseholdSession> {
    const session: HouseholdSession = {
      id: `session_${Date.now()}`,
      householdId,
      startedAt: new Date().toISOString(),
      participants: participants.map((p) => p.id),
      consensusScore: 0,
    };
    const db = await supabase.from('sessions');
    await db.insert([session]);
    return session;
  }

  async updateConsensus(sessionId: string, score: number, selectedContent: string): Promise<void> {
    const db = await supabase.from('sessions');
    await db.upsert([{ id: sessionId, consensusScore: score, selectedContent }]);
  }

  async logViewingEvent(event: ViewingEvent): Promise<void> {
    const db = await supabase.from('events');
    await db.insert([{ ...event, timestamp: new Date().toISOString() }]);
  }
}

// ---------------------------------------------------------------------------
// Real-Time Presence & Sync Service
// ---------------------------------------------------------------------------
export class RealtimeSyncService {
  private presenceMap: Map<string, PresenceState> = new Map();
  private channelName: string;

  constructor(householdId: string) {
    this.channelName = `household:${householdId}`;
  }

  async joinSession(profile: VotingParticipant, onPresenceUpdate: (states: PresenceState[]) => void): Promise<void> {
    const presence: PresenceState = {
      profileId: profile.id,
      name: profile.name,
      status: 'online',
      lastSeen: new Date().toISOString(),
    };
    this.presenceMap.set(profile.id, presence);

    const channel = supabase.channel(this.channelName);
    channel
      .on('presence', { event: 'sync' }, () => {
        onPresenceUpdate(Array.from(this.presenceMap.values()));
      })
      .on('broadcast', { event: 'vote' }, (payload: unknown) => {
        const { profileId, vote } = payload as { profileId: string; vote: string };
        const state = this.presenceMap.get(profileId);
        if (state) {
          this.presenceMap.set(profileId, { ...state, status: 'voting', currentVote: vote });
          onPresenceUpdate(Array.from(this.presenceMap.values()));
        }
      })
      .subscribe();
  }

  async broadcastVote(profileId: string, mediaId: string): Promise<void> {
    const state = this.presenceMap.get(profileId);
    if (state) {
      this.presenceMap.set(profileId, { ...state, status: 'voting', currentVote: mediaId });
    }
    const ch = supabase.channel(this.channelName);
    await ch.send({ type: 'broadcast', event: 'vote', payload: { profileId, vote: mediaId } });
  }

  getPresence(): PresenceState[] {
    return Array.from(this.presenceMap.values());
  }
}

// ---------------------------------------------------------------------------
// Analytics Service
// ---------------------------------------------------------------------------
export class AnalyticsService {
  async trackEvent(
    eventType: string,
    properties: Record<string, unknown>,
    profileId: string,
  ): Promise<void> {
    const db = await supabase.from('events');
    await db.insert([{
      eventType,
      properties,
      profileId,
      timestamp: new Date().toISOString(),
    }]);
  }

  async trackSession(context: ViewingContext, selectedMedia: MediaItem): Promise<void> {
    await this.trackEvent('session_start', {
      timeOfDay: context.timeOfDay,
      weather: context.weatherCondition,
      selectedTitle: selectedMedia.title,
      selectedId: selectedMedia.id,
    }, 'system');
  }
}

export { supabase };
export const sessionService = new SessionService();
export const analyticsService = new AnalyticsService();
