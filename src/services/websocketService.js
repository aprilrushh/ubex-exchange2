// src/services/websocketService.js
import { io } from 'socket.io-client';
import { EventEmitter } from 'events';

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WS] Dev mode: skipping WS');
      return;
    }
    this.socket = io();          // uses /socket.io proxy
    this.socket.on('connect', () => console.log('[WS] connected', this.socket.id));
    this.socket.on('error', err => console.error('[WS]', err));
  }
}

export default new WebSocketService();
