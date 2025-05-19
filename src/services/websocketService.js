// src/services/websocketService.js
import { io } from 'socket.io-client';
import { EventEmitter } from 'events';

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.socket = null;
  }

  /**
   * Establish socket connection. Subsequent calls reuse the existing socket.
   */
  connect(options = {}) {
    if (this.socket) return this.socket;

    this.socket = io(options.url || undefined);
    this.socket.on('connect', () => {
      console.log('[WS] connected', this.socket.id);
      this.emit('connect');
    });
    this.socket.on('disconnect', () => {
      console.log('[WS] disconnected');
      this.emit('disconnect');
    });
    this.socket.on('error', (err) => {
      console.error('[WS]', err);
      this.emit('error', err);
    });

    // Forward all other events
    this.socket.onAny((event, ...args) => {
      if (['connect', 'disconnect', 'error'].includes(event)) return;
      this.emit(event, ...args);
    });

    return this.socket;
  }

  /**
   * Disconnect from the socket server.
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to a channel on the server.
   */
  subscribe(channel) {
    if (!this.socket) this.connect();
    if (this.socket) {
      this.socket.emit('subscribe', channel);
    }
  }

  /**
   * Unsubscribe from a channel on the server.
   */
  unsubscribe(channel) {
    if (this.socket) {
      this.socket.emit('unsubscribe', channel);
    }
  }
}

export default new WebSocketService();
