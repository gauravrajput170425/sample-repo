import { Server, Socket } from 'socket.io';
import { TodoList } from '../types/todoList';
import { Todo } from '../types/todo';
import { verifyToken } from './userService';
import * as dataStore from './dataStore';

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

// Track authenticated users with sockets
interface SocketUser {
  userId: string;
  username: string;
}

// Map to store authenticated socket users
const authenticatedSockets = new Map<string, SocketUser>();

// Initialize socket handler
export const initializeSocketHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    
    // Set up authentication
    socket.on(SocketEvents.AUTHENTICATE, ({ token }) => {
      const user = verifyToken(token);
      if (user) {
        // Store the user info with this socket
        authenticatedSockets.set(socket.id, user);
      } else {
        console.log(`Socket ${socket.id} authentication failed`);
      }
    });

    // Handle joining a list room with permission check
    socket.on(SocketEvents.JOIN_LIST_ROOM, ({ listId }) => {
      const user = authenticatedSockets.get(socket.id);
      
      // Only allow joining if authenticated and has access to the list
      if (user && dataStore.hasAccessToList(user.userId, listId)) {
        socket.join(`list:${listId}`);
      }
    });

    // Handle leaving a list room
    socket.on(SocketEvents.LEAVE_LIST_ROOM, ({ listId }) => {
      socket.leave(`list:${listId}`);
    });

    socket.on('disconnect', () => {
      // Clean up authentication info on disconnect
      authenticatedSockets.delete(socket.id);
    });
  });
};

/**
 * Emits an event when a new todo list is created, only to authenticated users
 */
export const emitListCreated = (io: Server, list: TodoList): void => {
  // This gets the owner of the list
  const ownerId = dataStore.getListOwner(list.id);
  
  if (!ownerId) return;
  
  // Only emit to sockets that belong to the owner
  for (const [socketId, user] of authenticatedSockets.entries()) {
    if (user.userId === ownerId) {
      io.to(socketId).emit(SocketEvents.LIST_CREATED, list);
    }
  }
};

/**
 * Emits an event when a todo list is deleted, only to users with access
 */
export const emitListDeleted = (io: Server, listId: string): void => {
  // First, get the owner ID, which we need even though the list is being deleted
  const ownerId = dataStore.getListOwner(listId);
  
  if (!ownerId) return;
  
  // Find all authenticated sockets that have access to this list
  for (const [socketId, user] of authenticatedSockets.entries()) {
    // Either the owner or someone with whom the list was shared
    if (dataStore.hasAccessToList(user.userId, listId)) {
      io.to(socketId).emit(SocketEvents.LIST_DELETED, { listId });
    }
  }
  
  // Also emit to the specific list room
  io.to(`list:${listId}`).emit(SocketEvents.LIST_DELETED, { listId });
};

/**
 * Emits an event when a todo is added to a list, only to users with access
 */
export const emitTodoAdded = (io: Server, listId: string, todo: Todo): void => {
  // Only emit to the specific list room (users who have joined it have already been permission-checked)
  io.to(`list:${listId}`).emit(SocketEvents.TODO_ADDED, { listId, todo });
};

/**
 * Emits an event when a todo's status is toggled, only to users with access
 */
export const emitTodoToggled = (io: Server, listId: string, todo: Todo): void => {
  // Only emit to the specific list room (users who have joined it have already been permission-checked)
  io.to(`list:${listId}`).emit(SocketEvents.TODO_TOGGLED, { listId, todo });
};

/**
 * Emits an event when all lists are updated, only to the owner
 */
export const emitListsUpdated = (io: Server, lists: TodoList[], userId: string): void => {
  // Find all sockets for this user
  for (const [socketId, user] of authenticatedSockets.entries()) {
    if (user.userId === userId) {
      io.to(socketId).emit(SocketEvents.LISTS_UPDATED, { lists });
    }
  }
};

/**
 * Emits an event when a list is shared with a user
 */
export const emitListShared = (io: Server, listId: string, targetUserId: string, permission: string): void => {
  // First retrieve the list details
  const list = dataStore.getAllLists().find(l => l.id === listId);
  
  if (!list) return;
  
  // Find all sockets belonging to the target user
  for (const [socketId, user] of authenticatedSockets.entries()) {
    if (user.userId === targetUserId) {
      // Add permission info to the list object
      const listWithPermission = {
        ...list,
        isShared: true,
        permission: permission,
        isOwner: false
      };
      
      // Emit the shared list to the target user
      io.to(socketId).emit(SocketEvents.LIST_SHARED, { list: listWithPermission });
    }
  }
}; 