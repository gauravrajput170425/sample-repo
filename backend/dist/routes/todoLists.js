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
const express_1 = require("express");
const uuid_1 = require("uuid");
const dataStore = __importStar(require("../services/dataStore"));
const socketService = __importStar(require("../services/socketService"));
const todo_1 = require("../types/todo");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
/**
 * GET /api/lists
 * Retrieve all todo lists for the authenticated user
 */
router.get('/', (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Get all lists the user has access to (owned + shared)
    const lists = dataStore.getAllAccessibleLists(userId);
    res.json(lists);
});
/**
 * GET /api/lists/owned
 * Retrieve all todo lists owned by the authenticated user
 */
router.get('/owned', (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Only get lists owned by this user
    const lists = dataStore.getUserLists(userId);
    res.json(lists);
});
/**
 * GET /api/lists/shared
 * Retrieve all todo lists shared with the authenticated user
 */
router.get('/shared', (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Only get lists shared with this user
    const lists = dataStore.getSharedLists(userId);
    res.json(lists);
});
/**
 * GET /api/lists/:listId
 * Retrieve a specific todo list with all its todos
 */
router.get('/:listId', (req, res) => {
    const { listId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Check if the user has access to the list
    if (!dataStore.hasAccessToList(userId, listId)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    const isOwner = dataStore.isListOwnedByUser(userId, listId);
    const lists = isOwner
        ? dataStore.getUserLists(userId)
        : dataStore.getSharedLists(userId);
    const list = lists.find(l => l.id === listId);
    if (!list) {
        return res.status(404).json({ error: 'Todo list not found' });
    }
    res.json(list);
});
/**
 * POST /api/lists
 * Create a new todo list
 */
router.post('/', (req, res) => {
    const { name } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    const newList = {
        id: (0, uuid_1.v4)(),
        name,
        todos: [],
        createdAt: new Date()
    };
    dataStore.addList(newList, userId);
    // Emit socket event
    const io = req.app.get('io');
    socketService.emitListCreated(io, newList);
    res.status(201).json(newList);
});
/**
 * POST /api/lists/:listId/share
 * Share a todo list with another user
 */
router.post('/:listId/share', (req, res) => {
    const { listId } = req.params;
    const { email, permission } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Validate inputs
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    if (!permission || !['read', 'write'].includes(permission)) {
        return res.status(400).json({ error: 'Valid permission (read/write) is required' });
    }
    // Check if the user owns the list
    if (!dataStore.isListOwnedByUser(userId, listId)) {
        return res.status(403).json({ error: 'Only the list owner can share it' });
    }
    // Find the target user by email to get their ID
    const targetUser = dataStore.getUserByEmail(email);
    if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
    }
    // Share the list
    const success = dataStore.shareList(listId, userId, email, permission);
    if (!success) {
        return res.status(404).json({ error: 'List or target user not found' });
    }
    // Emit socket event to the target user
    const io = req.app.get('io');
    socketService.emitListShared(io, listId, targetUser.id, permission);
    res.status(200).json({
        success: true,
        message: `List shared with ${email} (${permission} permission)`
    });
});
/**
 * DELETE /api/lists/:listId/share/:targetUserId
 * Remove sharing for a todo list
 */
router.delete('/:listId/share/:targetUserId', (req, res) => {
    const { listId, targetUserId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Check if the user owns the list
    if (!dataStore.isListOwnedByUser(userId, listId)) {
        return res.status(403).json({ error: 'Only the list owner can modify sharing' });
    }
    // Remove the sharing
    const success = dataStore.removeSharing(listId, userId, targetUserId);
    if (!success) {
        return res.status(404).json({ error: 'Shared list not found' });
    }
    res.status(204).end();
});
/**
 * DELETE /api/lists/:listId
 * Delete a todo list
 */
router.delete('/:listId', (req, res) => {
    const { listId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Check if the user owns the list
    if (!dataStore.isListOwnedByUser(userId, listId)) {
        return res.status(403).json({ error: 'Only the list owner can delete it' });
    }
    dataStore.deleteList(listId, userId);
    // Emit socket event
    const io = req.app.get('io');
    socketService.emitListDeleted(io, listId);
    res.status(204).end();
});
/**
 * POST /api/lists/:listId/todos
 * Add a todo to a specific list
 */
router.post('/:listId/todos', (req, res) => {
    const { listId } = req.params;
    const { text, priority, status } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Check if the user has write access to the list
    if (!dataStore.hasWriteAccessToList(userId, listId)) {
        return res.status(403).json({ error: 'Write access required' });
    }
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    const newTodo = {
        id: (0, uuid_1.v4)(),
        text,
        status: status !== undefined ? status : todo_1.TodoStatus.TODO,
        priority: priority !== undefined ? priority : todo_1.TodoPriority.MEDIUM
    };
    const success = dataStore.addTodo(listId, newTodo);
    if (!success) {
        return res.status(404).json({ error: 'Todo list not found' });
    }
    // Emit socket event
    const io = req.app.get('io');
    socketService.emitTodoAdded(io, listId, newTodo);
    res.status(201).json(newTodo);
});
/**
 * PATCH /api/lists/:listId/todos/:todoId/toggle
 * Toggle the status of a todo
 */
router.patch('/:listId/todos/:todoId/toggle', (req, res) => {
    const { listId, todoId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Check if the user has write access to the list
    if (!dataStore.hasWriteAccessToList(userId, listId)) {
        return res.status(403).json({ error: 'Write access required' });
    }
    const success = dataStore.toggleTodo(listId, todoId);
    if (!success) {
        return res.status(404).json({ error: 'Todo list or todo item not found' });
    }
    // Find the updated todo to return
    const lists = dataStore.getAllAccessibleLists(userId);
    const list = lists.find(l => l.id === listId);
    const todo = list?.todos.find(t => t.id === todoId);
    // Emit socket event
    const io = req.app.get('io');
    if (todo) {
        socketService.emitTodoToggled(io, listId, todo);
    }
    res.json(todo);
});
/**
 * PUT /api/lists/:listId/todos/:todoId
 * Update a specific todo item
 */
router.put('/:listId/todos/:todoId', (req, res) => {
    const { listId, todoId } = req.params;
    const updates = req.body; // Can include title/text, priority and other properties
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Check if the user has write access to the list
    if (!dataStore.hasWriteAccessToList(userId, listId)) {
        return res.status(403).json({ error: 'Write access required' });
    }
    // Convert property names if needed (frontend uses 'title', backend might use 'text')
    const processedUpdates = {};
    if (updates.title) {
        processedUpdates.text = updates.title;
    }
    if (updates.completed !== undefined) {
        processedUpdates.status = updates.completed ? todo_1.TodoStatus.COMPLETED : todo_1.TodoStatus.TODO;
    }
    if (updates.priority !== undefined) {
        processedUpdates.priority = updates.priority;
    }
    // Apply other updates directly
    Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'title' && key !== 'completed' && key !== 'priority') {
            processedUpdates[key] = value;
        }
    });
    // Update the todo
    const updatedTodo = dataStore.updateTodo(listId, todoId, processedUpdates);
    if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo list or todo item not found' });
    }
    // Emit socket event for the update
    const io = req.app.get('io');
    socketService.emitTodoAdded(io, listId, updatedTodo); // Reusing the todo added event
    res.json(updatedTodo);
});
/**
 * PUT /api/lists
 * Update all todo lists at once
 */
router.put('/', (req, res) => {
    const { lists } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (!Array.isArray(lists)) {
        return res.status(400).json({ error: 'Lists must be an array' });
    }
    // Convert string dates back to Date objects
    const processedLists = lists.map((list) => ({
        ...list,
        createdAt: new Date(list.createdAt)
    }));
    // Filter lists to only include those owned by the user
    const userLists = processedLists.filter((list) => dataStore.isListOwnedByUser(userId, list.id));
    dataStore.updateLists(userLists, userId);
    // Emit socket event
    const io = req.app.get('io');
    socketService.emitListsUpdated(io, userLists, userId);
    res.status(200).json({ success: true });
});
exports.default = router;
