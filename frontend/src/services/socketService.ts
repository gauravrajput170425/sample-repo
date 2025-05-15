import { io, Socket } from 'socket.io-client';
import type { TodoList } from '../types/todoList';
import type { Todo } from '../types/todo';

// Socket.IO event types
export enum SocketEvents {
  LIST_CREATED = 'list:created',
  LIST_DELETED = 'list:deleted',
  TODO_ADDED = 'todo:added',
  TODO_TOGGLED = 'todo:toggled',
  LISTS_UPDATED = 'lists:updated',
  LIST_SHARED = 'list:shared',
  JOIN_LIST_ROOM = 'join:list',
  LEAVE_LIST_ROOM = 'leave:list',
  AUTHENTICATE = 'authenticate'
}

// The backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Socket instances for different screens
const sockets: Record<string, Socket | null> = {
  main: null,
  detail: null
};

/**
 * Initializes the socket connection for a specific screen
 * @param screenType - 'main' for main list view, 'detail' for list details view
 * @param token - JWT auth token
 */
export const initializeSocket = (screenType: 'main' | 'detail' = 'main', token?: string): Socket => {
  if (sockets[screenType]) {
    return sockets[screenType] as Socket;
  }
  
  const newSocket = io(API_URL, {
    query: {
      screenType
    }
  });
  
  newSocket.on('connect', () => {
    console.log(`Connected to WebSocket server (${screenType}): ${newSocket.id}`);
    
    // Authenticate the socket connection if a token is provided
    if (token) {
      authenticateSocket(newSocket, token);
    }
  });
  
  newSocket.on('disconnect', () => {
    console.log(`Disconnected from WebSocket server (${screenType}): ${newSocket.id}`);
    sockets[screenType] = null;
  });
  
  sockets[screenType] = newSocket;
  return newSocket;
};

/**
 * Authenticates a socket connection with JWT token
 */
export const authenticateSocket = (socket: Socket, token: string): void => {
  if (!token) {
    console.log('No token available for socket authentication');
    return;
  }
  
  console.log('Authenticating socket connection');
  socket.emit(SocketEvents.AUTHENTICATE, { token });
};

/**
 * Returns the socket instance for a specific screen
 */
export const getSocket = (screenType: 'main' | 'detail' = 'main'): Socket => {
  if (!sockets[screenType]) {
    return initializeSocket(screenType);
  }
  return sockets[screenType] as Socket;
};

/**
 * Join a specific list room to receive targeted updates
 */
export const joinListRoom = (listId: string): void => {
  const socket = getSocket('detail');
  socket.emit(SocketEvents.JOIN_LIST_ROOM, { listId });
  console.log(`Joined room for list: ${listId}`);
};

/**
 * Leave a specific list room
 */
export const leaveListRoom = (listId: string): void => {
  const socket = getSocket('detail');
  socket.emit(SocketEvents.LEAVE_LIST_ROOM, { listId });
  console.log(`Left room for list: ${listId}`);
};

/**
 * Subscribes to list created events (main view)
 */
export const onListCreated = (callback: (list: TodoList) => void): void => {
  getSocket('main').on(SocketEvents.LIST_CREATED, callback);
};

/**
 * Subscribes to list deleted events
 */
export const onListDeleted = (callback: (data: { listId: string }) => void, screenType: 'main' | 'detail' = 'main'): void => {
  getSocket(screenType).on(SocketEvents.LIST_DELETED, callback);
};

/**
 * Subscribes to todo added events (detail view only)
 */
export const onTodoAdded = (callback: (data: { listId: string, todo: Todo }) => void): void => {
  getSocket('detail').on(SocketEvents.TODO_ADDED, callback);
};

/**
 * Subscribes to todo toggled events (detail view only)
 */
export const onTodoToggled = (callback: (data: { listId: string, todo: Todo }) => void): void => {
  getSocket('detail').on(SocketEvents.TODO_TOGGLED, callback);
};

/**
 * Subscribes to lists updated events (main view only)
 */
export const onListsUpdated = (callback: (data: { lists: TodoList[] }) => void): void => {
  getSocket('main').on(SocketEvents.LISTS_UPDATED, callback);
};

/**
 * Subscribes to list shared events (main view only)
 */
export const onListShared = (callback: (data: { list: TodoList }) => void): void => {
  getSocket('main').on(SocketEvents.LIST_SHARED, callback);
};

/**
 * Unsubscribe from all socket events for a specific screen
 */
export const unsubscribeAll = (screenType: 'main' | 'detail' = 'main'): void => {
  const socket = getSocket(screenType);
  
  if (screenType === 'main') {
    socket.off(SocketEvents.LIST_CREATED);
    socket.off(SocketEvents.LIST_DELETED);
    socket.off(SocketEvents.LISTS_UPDATED);
    socket.off(SocketEvents.LIST_SHARED);
  } else {
    socket.off(SocketEvents.TODO_ADDED);
    socket.off(SocketEvents.TODO_TOGGLED);
    socket.off(SocketEvents.LIST_DELETED);
  }
};

/**
 * Disconnects the socket for a specific screen
 */
export const disconnectSocket = (screenType: 'main' | 'detail' = 'main'): void => {
  if (sockets[screenType]) {
    sockets[screenType].disconnect();
    sockets[screenType] = null;
  }
}; 