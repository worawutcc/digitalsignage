'use client';

import * as signalR from '@microsoft/signalr';
import { PlaylistDto, PlaylistStatus } from '@/types/playlist';

// SignalR Event Types
export interface PlaylistEventHandlers {
  onPlaylistCreated?: (playlist: PlaylistDto) => void;
  onPlaylistUpdated?: (playlist: PlaylistDto) => void;
  onPlaylistDeleted?: (data: { PlaylistId: number; DeletedBy?: string; Timestamp: string }) => void;
  onPlaylistStatusChanged?: (data: {
    PlaylistId: number;
    OldStatus: PlaylistStatus;
    NewStatus: PlaylistStatus;
    ChangedBy?: string;
    Timestamp: string;
  }) => void;
  onPlaylistReordered?: (data: {
    PlaylistId: number;
    NewOrder: number[];
    ReorderedBy?: string;
    Timestamp: string;
  }) => void;
  onDeviceAssignmentChanged?: (data: {
    PlaylistId: number;
    DeviceId: number;
    IsAssigned: boolean;
    ChangedBy?: string;
    Timestamp: string;
  }) => void;
  onBulkPlaylistAction?: (data: {
    Action: string;
    PlaylistIds: number[];
    PerformedBy?: string;
    Timestamp: string;
  }) => void;
  onAnalyticsUpdated?: (data: {
    PlaylistId: number;
    AnalyticsData: any;
    Timestamp: string;
  }) => void;
  onPlaylistViewed?: (data: {
    PlaylistId: number;
    DeviceId: number;
    Timestamp: string;
    UserId?: string;
  }) => void;
  onPlaybackStarted?: (data: {
    PlaylistId: number;
    DeviceId: number;
    MediaItemId: number;
    Timestamp: string;
  }) => void;
  onPlaybackStopped?: (data: {
    PlaylistId: number;
    DeviceId: number;
    Reason: string;
    Timestamp: string;
  }) => void;
}

export type ConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Disconnecting' | 'Reconnecting';

export interface PlaylistHubConnection {
  connection: signalR.HubConnection | null;
  state: ConnectionState;
  error: string | null;
}

/**
 * SignalR PlaylistHub Client
 * Manages real-time communication for playlist operations
 * Following TypeScript strict mode and Next.js App Router patterns
 */
export class PlaylistHubClient {
  private connection: signalR.HubConnection | null = null;
  private eventHandlers: PlaylistEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private isManualDisconnect = false;

  // State management
  private _state: ConnectionState = 'Disconnected';
  private _error: string | null = null;
  private stateChangeListeners: Array<(state: ConnectionState, error?: string) => void> = [];

  constructor(private hubUrl = '/playlist-hub') {
    this.setupConnection();
  }

  // Public getters
  get state(): ConnectionState {
    return this._state;
  }

  get error(): string | null {
    return this._error;
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Setup SignalR connection with proper configuration
   */
  private setupConnection(): void {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        withCredentials: true,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          const jitter = Math.random() * 0.3 * delay;
          return delay + jitter;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupConnectionEvents();
    this.setupEventHandlers();
  }

  /**
   * Setup connection state management
   */
  private setupConnectionEvents(): void {
    if (!this.connection) return;

    this.connection.onclose((error) => {
      console.log('PlaylistHub connection closed', error);
      this.updateState('Disconnected', error?.message);
      
      if (!this.isManualDisconnect) {
        this.scheduleReconnect();
      }
    });

    this.connection.onreconnecting((error) => {
      console.log('PlaylistHub reconnecting...', error);
      this.updateState('Reconnecting', error?.message);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('PlaylistHub reconnected', connectionId);
      this.reconnectAttempts = 0;
      this.updateState('Connected');
      this._error = null;
    });
  }

  /**
   * Setup event handlers for all SignalR events
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Playlist CRUD events
    this.connection.on('PlaylistCreated', (playlist: PlaylistDto) => {
      this.eventHandlers.onPlaylistCreated?.(playlist);
    });

    this.connection.on('PlaylistUpdated', (playlist: PlaylistDto) => {
      this.eventHandlers.onPlaylistUpdated?.(playlist);
    });

    this.connection.on('PlaylistDeleted', (data) => {
      this.eventHandlers.onPlaylistDeleted?.(data);
    });

    this.connection.on('PlaylistStatusChanged', (data) => {
      this.eventHandlers.onPlaylistStatusChanged?.(data);
    });

    this.connection.on('PlaylistReordered', (data) => {
      this.eventHandlers.onPlaylistReordered?.(data);
    });

    // Device assignment events
    this.connection.on('DeviceAssignmentChanged', (data) => {
      this.eventHandlers.onDeviceAssignmentChanged?.(data);
    });

    // Bulk operation events
    this.connection.on('BulkPlaylistAction', (data) => {
      this.eventHandlers.onBulkPlaylistAction?.(data);
    });

    // Analytics events
    this.connection.on('AnalyticsUpdated', (data) => {
      this.eventHandlers.onAnalyticsUpdated?.(data);
    });

    // Playback tracking events
    this.connection.on('PlaylistViewed', (data) => {
      this.eventHandlers.onPlaylistViewed?.(data);
    });

    this.connection.on('PlaybackStarted', (data) => {
      this.eventHandlers.onPlaybackStarted?.(data);
    });

    this.connection.on('PlaybackStopped', (data) => {
      this.eventHandlers.onPlaybackStopped?.(data);
    });
  }

  /**
   * Connect to the PlaylistHub
   */
  async connect(): Promise<void> {
    if (!this.connection || this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.isManualDisconnect = false;
    this.updateState('Connecting');

    try {
      await this.connection.start();
      this.reconnectAttempts = 0;
      this.updateState('Connected');
      this._error = null;
      console.log('Connected to PlaylistHub');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      console.error('Failed to connect to PlaylistHub:', errorMessage);
      this.updateState('Disconnected', errorMessage);
      this.scheduleReconnect();
      throw error;
    }
  }

  /**
   * Disconnect from the PlaylistHub
   */
  async disconnect(): Promise<void> {
    if (!this.connection) return;

    this.isManualDisconnect = true;
    this.updateState('Disconnecting');

    try {
      await this.connection.stop();
      this.updateState('Disconnected');
      console.log('Disconnected from PlaylistHub');
    } catch (error) {
      console.error('Error disconnecting from PlaylistHub:', error);
      this.updateState('Disconnected', error instanceof Error ? error.message : 'Disconnect error');
    }
  }

  /**
   * Schedule automatic reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || this.isManualDisconnect) {
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    setTimeout(async () => {
      if (!this.isManualDisconnect && this._state === 'Disconnected') {
        try {
          await this.connect();
        } catch (error) {
          console.error('Reconnection attempt failed:', error);
        }
      }
    }, delay);
  }

  /**
   * Register event handlers
   */
  onEvents(handlers: PlaylistEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Remove event handlers
   */
  offEvents(handlerNames: Array<keyof PlaylistEventHandlers>): void {
    handlerNames.forEach(name => {
      delete this.eventHandlers[name];
    });
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(listener: (state: ConnectionState, error?: string) => void): () => void {
    this.stateChangeListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.stateChangeListeners.indexOf(listener);
      if (index > -1) {
        this.stateChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Update connection state and notify listeners
   */
  private updateState(state: ConnectionState, error?: string): void {
    this._state = state;
    this._error = error || null;
    this.stateChangeListeners.forEach(listener => listener(state, error));
  }

  // Client-to-server methods

  /**
   * Join playlist monitoring group
   */
  async joinPlaylistGroup(playlistId: number): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to PlaylistHub');
    }
    await this.connection!.invoke('JoinPlaylistGroup', playlistId);
  }

  /**
   * Leave playlist monitoring group
   */
  async leavePlaylistGroup(playlistId: number): Promise<void> {
    if (!this.isConnected) return;
    await this.connection!.invoke('LeavePlaylistGroup', playlistId);
  }

  /**
   * Join device monitoring group
   */
  async joinDeviceGroup(deviceId: number): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to PlaylistHub');
    }
    await this.connection!.invoke('JoinDeviceGroup', deviceId);
  }

  /**
   * Leave device monitoring group
   */
  async leaveDeviceGroup(deviceId: number): Promise<void> {
    if (!this.isConnected) return;
    await this.connection!.invoke('LeaveDeviceGroup', deviceId);
  }

  /**
   * Report playlist view activity
   */
  async reportPlaylistView(playlistId: number, deviceId: number): Promise<void> {
    if (!this.isConnected) return;
    const timestamp = new Date();
    await this.connection!.invoke('ReportPlaylistView', playlistId, deviceId, timestamp);
  }

  /**
   * Report playback started
   */
  async reportPlaybackStarted(playlistId: number, deviceId: number, mediaItemId: number): Promise<void> {
    if (!this.isConnected) return;
    await this.connection!.invoke('ReportPlaybackStarted', playlistId, deviceId, mediaItemId);
  }

  /**
   * Report playback stopped
   */
  async reportPlaybackStopped(playlistId: number, deviceId: number, reason: string): Promise<void> {
    if (!this.isConnected) return;
    await this.connection!.invoke('ReportPlaybackStopped', playlistId, deviceId, reason);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.isManualDisconnect = true;
    this.stateChangeListeners = [];
    this.eventHandlers = {};
    
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

// Singleton instance
let playlistHubClient: PlaylistHubClient | null = null;

/**
 * Get singleton PlaylistHub client instance
 */
export function getPlaylistHubClient(): PlaylistHubClient {
  if (typeof window === 'undefined') {
    throw new Error('PlaylistHubClient can only be used in the browser');
  }

  if (!playlistHubClient) {
    playlistHubClient = new PlaylistHubClient();
  }

  return playlistHubClient;
}

/**
 * Initialize PlaylistHub connection (call once in app startup)
 */
export async function initializePlaylistHub(): Promise<PlaylistHubClient> {
  const client = getPlaylistHubClient();
  await client.connect();
  return client;
}

/**
 * Cleanup PlaylistHub connection (call in app cleanup)
 */
export function cleanupPlaylistHub(): void {
  if (playlistHubClient) {
    playlistHubClient.dispose();
    playlistHubClient = null;
  }
}