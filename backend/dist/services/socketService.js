"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitListShared = exports.emitListsUpdated = exports.emitTodoToggled = exports.emitTodoAdded = exports.emitListDeleted = exports.emitListCreated = exports.initializeSocketHandlers = exports.SocketEvents = void 0;
const userService_1 = require("./userService");
const dataStore = __importStar(require("./dataStore"));
// Socket.IO event types
var SocketEvents;
(function (SocketEvents) {
    SocketEvents["LIST_CREATED"] = "list:created";
    SocketEvents["LIST_DELETED"] = "list:deleted";
    SocketEvents["TODO_ADDED"] = "todo:added";
    SocketEvents["TODO_TOGGLED"] = "todo:toggled";
    SocketEvents["LISTS_UPDATED"] = "lists:updated";
    SocketEvents["LIST_SHARED"] = "list:shared";
    SocketEvents["JOIN_LIST_ROOM"] = "join:list";
    SocketEvents["LEAVE_LIST_ROOM"] = "leave:list";
    SocketEvents["AUTHENTICATE"] = "authenticate";
})(SocketEvents || (exports.SocketEvents = SocketEvents = {}));
// Map to store authenticated socket users
const authenticatedSockets = new Map();
// Initialize socket handler
const initializeSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        // Set up authentication
        socket.on(SocketEvents.AUTHENTICATE, ({ token }) => {
            const user = (0, userService_1.verifyToken)(token);
            if (user) {
                // Store the user info with this socket
                authenticatedSockets.set(socket.id, user);
            }
            else {
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
exports.initializeSocketHandlers = initializeSocketHandlers;
/**
 * Emits an event when a new todo list is created, only to authenticated users
 */
const emitListCreated = (io, list) => {
    // This gets the owner of the list
    const ownerId = dataStore.getListOwner(list.id);
    if (!ownerId)
        return;
    // Only emit to sockets that belong to the owner
    for (const [socketId, user] of authenticatedSockets.entries()) {
        if (user.userId === ownerId) {
            io.to(socketId).emit(SocketEvents.LIST_CREATED, list);
        }
    }
};
exports.emitListCreated = emitListCreated;
/**
 * Emits an event when a todo list is deleted, only to users with access
 */
const emitListDeleted = (io, listId) => {
    // First, get the owner ID, which we need even though the list is being deleted
    const ownerId = dataStore.getListOwner(listId);
    if (!ownerId)
        return;
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
exports.emitListDeleted = emitListDeleted;
/**
 * Emits an event when a todo is added to a list, only to users with access
 */
const emitTodoAdded = (io, listId, todo) => {
    // Only emit to the specific list room (users who have joined it have already been permission-checked)
    io.to(`list:${listId}`).emit(SocketEvents.TODO_ADDED, { listId, todo });
};
exports.emitTodoAdded = emitTodoAdded;
/**
 * Emits an event when a todo's status is toggled, only to users with access
 */
const emitTodoToggled = (io, listId, todo) => {
    // Only emit to the specific list room (users who have joined it have already been permission-checked)
    io.to(`list:${listId}`).emit(SocketEvents.TODO_TOGGLED, { listId, todo });
};
exports.emitTodoToggled = emitTodoToggled;
/**
 * Emits an event when all lists are updated, only to the owner
 */
const emitListsUpdated = (io, lists, userId) => {
    // Find all sockets for this user
    for (const [socketId, user] of authenticatedSockets.entries()) {
        if (user.userId === userId) {
            io.to(socketId).emit(SocketEvents.LISTS_UPDATED, { lists });
        }
    }
};
exports.emitListsUpdated = emitListsUpdated;
/**
 * Emits an event when a list is shared with a user
 */
const emitListShared = (io, listId, targetUserId, permission) => {
    // First retrieve the list details
    const list = dataStore.getAllLists().find(l => l.id === listId);
    if (!list)
        return;
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
exports.emitListShared = emitListShared;
