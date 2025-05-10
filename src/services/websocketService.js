// src/services/websocketService.js

import io from 'socket.io-client';

let socket = null;

/**
 * WebSocket 서버에 연결
 * @returns {SocketIOClient.Socket} 연결된 소켓 인스턴스
 */
export const connectWebSocket = () => {
  if (!socket) {
    // 개발 환경에서는 localhost, 프로덕션에서는 실제 서버 주소로 변경
    const SERVER_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : window.location.origin;
    
    socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    // 연결 이벤트 핸들러
    socket.on('connect', () => {
      console.log('WebSocket 연결 성공');
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocket 연결 끊김');
    });
    
    socket.on('error', (error) => {
      console.error('WebSocket 오류:', error);
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket 재연결 성공 (시도: ${attemptNumber})`);
    });
    
    socket.on('reconnect_error', (error) => {
      console.error('WebSocket 재연결 오류:', error);
    });
  }
  
  return socket;
};

/**
 * 지정된 채널 구독
 * @param {SocketIOClient.Socket} socket - 소켓 인스턴스
 * @param {string} channel - 구독할 채널명
 */
export const subscribeToChannel = (socket, channel) => {
  if (!socket) {
    console.error('소켓이 연결되지 않았습니다.');
    return;
  }
  
  console.log(`채널 구독: ${channel}`);
  socket.emit('subscribe', { channel });
};

/**
 * 지정된 채널 구독 해제
 * @param {SocketIOClient.Socket} socket - 소켓 인스턴스
 * @param {string} channel - 구독 해제할 채널명
 */
export const unsubscribeFromChannel = (socket, channel) => {
  if (!socket) {
    console.error('소켓이 연결되지 않았습니다.');
    return;
  }
  
  console.log(`채널 구독 해제: ${channel}`);
  socket.emit('unsubscribe', { channel });
};

/**
 * 소켓 연결 종료
 */
export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('WebSocket 연결 종료');
  }
};

/**
 * 소켓 인스턴스 가져오기
 * @returns {SocketIOClient.Socket|null} 소켓 인스턴스 또는 null
 */
export const getSocket = () => socket;

/**
 * 카스텀 이벤트 리스너 등록
 * @param {string} event - 이벤트 이름
 * @param {Function} callback - 콜백 함수
 */
export const addSocketListener = (event, callback) => {
  if (!socket) {
    console.error('소켓이 연결되지 않았습니다.');
    return;
  }
  
  socket.on(event, callback);
};

/**
 * 카스텀 이벤트 리스너 제거
 * @param {string} event - 이벤트 이름
 * @param {Function} callback - 제거할 콜백 함수
 */
export const removeSocketListener = (event, callback) => {
  if (!socket) {
    console.error('소켓이 연결되지 않았습니다.');
    return;
  }
  
  socket.off(event, callback);
};