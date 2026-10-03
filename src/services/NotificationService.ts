/**
 * NotificationService.ts
 *
 * Household notification and Watch Party coordination service for Aura Vega TV.
 *
 * Capabilities:
 *  - Fire TV push notifications (simulated in harness)
 *  - Watch party invite / accept / reject flows
 *  - Consensus-complete alerts
 *  - Ambient display integration
 */

import { VotingParticipant } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type NotificationType =
  | 'consensus_complete'
  | 'watch_party_invite'
  | 'member_joined'
  | 'member_voted'
  | 'content_starting'
  | 'ai_recommendation'
  | 'session_ended';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  targetProfileId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}

export interface WatchPartyInvite {
  id: string;
  hostName: string;
  hostProfileId: string;
  householdId: string;
  contentTitle: string;
  contentId: string;
  scheduledAt?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'started';
}

// ---------------------------------------------------------------------------
// Notification Delivery Adapter (Fire TV + ambient display)
// ---------------------------------------------------------------------------
class FireTVNotificationAdapter {
  private queue: AppNotification[] = [];

  async deliver(notification: AppNotification): Promise<boolean> {
    // In production: calls Fire TV Notification API
    // In harness: queues for UI overlay display
    this.queue.unshift(notification);
    if (this.queue.length > 50) this.queue.length = 50;
    console.log(`[FireTV Notification] ${notification.title}: ${notification.body}`);
    return true;
  }

  getPending(): AppNotification[] {
    return this.queue.filter(n => !n.read);
  }

  markRead(id: string): void {
    const n = this.queue.find(x => x.id === id);
    if (n) n.read = true;
  }

  markAllRead(): void {
    this.queue.forEach(n => { n.read = true; });
  }

  getCount(): number {
    return this.queue.filter(n => !n.read).length;
  }
}

// ---------------------------------------------------------------------------
// Main Notification Service
// ---------------------------------------------------------------------------
class NotificationService {
  private adapter = new FireTVNotificationAdapter();
  private invites: Map<string, WatchPartyInvite> = new Map();
  private listeners: ((notification: AppNotification) => void)[] = [];

  private createNotification(
    type: NotificationType,
    title: string,
    body: string,
    options?: Partial<AppNotification>,
  ): AppNotification {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
      ...options,
    };
  }

  subscribe(listener: (notification: AppNotification) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(notification: AppNotification): void {
    this.listeners.forEach(l => l(notification));
  }

  // --- Public notification methods ---

  async notifyConsensusComplete(
    contentTitle: string,
    score: number,
    participants: VotingParticipant[],
  ): Promise<void> {
    const notif = this.createNotification(
      'consensus_complete',
      '🤝 Consensus Reached!',
      `"${contentTitle}" wins with ${score}% match for ${participants.map(p => p.name).join(', ')}.`,
    );
    await this.adapter.deliver(notif);
    this.emit(notif);
  }

  async notifyMemberVoted(memberName: string, contentTitle: string): Promise<void> {
    const notif = this.createNotification(
      'member_voted',
      `🗳️ ${memberName} voted`,
      `${memberName} selected "${contentTitle}".`,
    );
    await this.adapter.deliver(notif);
    this.emit(notif);
  }

  async notifyAIRecommendation(contentTitle: string, matchScore: number, reason: string): Promise<void> {
    const notif = this.createNotification(
      'ai_recommendation',
      '🧠 AI Suggestion',
      `"${contentTitle}" (${matchScore}% match). ${reason}`,
    );
    await this.adapter.deliver(notif);
    this.emit(notif);
  }

  async sendWatchPartyInvite(
    hostProfileId: string,
    hostName: string,
    householdId: string,
    contentId: string,
    contentTitle: string,
  ): Promise<WatchPartyInvite> {
    const invite: WatchPartyInvite = {
      id: `invite_${Date.now()}`,
      hostName,
      hostProfileId,
      householdId,
      contentTitle,
      contentId,
      status: 'pending',
    };
    this.invites.set(invite.id, invite);

    const notif = this.createNotification(
      'watch_party_invite',
      `🎉 Watch Party Invite`,
      `${hostName} wants to watch "${contentTitle}" together. Join now?`,
    );
    await this.adapter.deliver(notif);
    this.emit(notif);
    return invite;
  }

  async respondToInvite(inviteId: string, accepted: boolean): Promise<void> {
    const invite = this.invites.get(inviteId);
    if (!invite) return;
    invite.status = accepted ? 'accepted' : 'rejected';
    if (accepted) {
      const notif = this.createNotification(
        'content_starting',
        '▶ Starting Playback',
        `"${invite.contentTitle}" is starting now. Enjoy your watch party!`,
      );
      await this.adapter.deliver(notif);
      this.emit(notif);
    }
  }

  // --- Accessors ---

  getPendingNotifications(): AppNotification[] {
    return this.adapter.getPending();
  }

  getUnreadCount(): number {
    return this.adapter.getCount();
  }

  markRead(id: string): void {
    this.adapter.markRead(id);
  }

  getInvites(): WatchPartyInvite[] {
    return Array.from(this.invites.values());
  }
}

export const notificationService = new NotificationService();
