import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as dataStore from '../services/dataStore';
import * as socketService from '../services/socketService';
import type { TodoList } from '../types/todoList';
import type { Todo } from '../types/todo';
import { TodoStatus, TodoPriority } from '../types/todo';
import { Server } from 'socket.io';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { SharePermission } from '../db/database';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * GET /api/lists
 * Retrieve all todo lists for the authenticated user
 */
router.get('/', (req: AuthRequest, res: Response) => {
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
router.get('/owned', (req: AuthRequest, res: Response) => {
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
router.get('/shared', (req: AuthRequest, res: Response) => {
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
router.get('/:listId', (req: AuthRequest, res: Response) => {
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
router.post('/', (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const newList: TodoList = {
    id: uuidv4(),
    name,
    todos: [],
    createdAt: new Date()
  };
  
  dataStore.addList(newList, userId);
  
  // Emit socket event
  const io = req.app.get('io') as Server;
  socketService.emitListCreated(io, newList);
  
  res.status(201).json(newList);
});

/**
 * POST /api/lists/:listId/share
 * Share a todo list with another user
 */
router.post('/:listId/share', (req: AuthRequest, res: Response) => {
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
  const success = dataStore.shareList(
    listId, 
    userId, 
    email, 
    permission as SharePermission
  );
  
  if (!success) {
    return res.status(404).json({ error: 'List or target user not found' });
  }
  
  // Emit socket event to the target user
  const io = req.app.get('io') as Server;
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
router.delete('/:listId/share/:targetUserId', (req: AuthRequest, res: Response) => {
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
router.delete('/:listId', (req: AuthRequest, res: Response) => {
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
  const io = req.app.get('io') as Server;
  socketService.emitListDeleted(io, listId);
  
  res.status(204).end();
});

/**
 * POST /api/lists/:listId/todos
 * Add a todo to a specific list
 */
router.post('/:listId/todos', (req: AuthRequest, res: Response) => {
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
  
  const newTodo: Todo = {
    id: uuidv4(),
    text,
    status: status !== undefined ? status : TodoStatus.TODO,
    priority: priority !== undefined ? priority : TodoPriority.MEDIUM
  };
  
  const success = dataStore.addTodo(listId, newTodo);
  
  if (!success) {
    return res.status(404).json({ error: 'Todo list not found' });
  }
  
  // Emit socket event
  const io = req.app.get('io') as Server;
  socketService.emitTodoAdded(io, listId, newTodo);
  
  res.status(201).json(newTodo);
});

/**
 * PATCH /api/lists/:listId/todos/:todoId/toggle
 * Toggle the status of a todo
 */
router.patch('/:listId/todos/:todoId/toggle', (req: AuthRequest, res: Response) => {
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
  const io = req.app.get('io') as Server;
  if (todo) {
    socketService.emitTodoToggled(io, listId, todo);
  }
  
  res.json(todo);
});

/**
 * PUT /api/lists/:listId/todos/:todoId
 * Update a specific todo item
 */
router.put('/:listId/todos/:todoId', (req: AuthRequest, res: Response) => {
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
  const processedUpdates: Partial<Todo> = {};
  
  if (updates.title) {
    processedUpdates.text = updates.title;
  }
  
  if (updates.completed !== undefined) {
    processedUpdates.status = updates.completed ? TodoStatus.COMPLETED : TodoStatus.TODO;
  }
  
  if (updates.priority !== undefined) {
    processedUpdates.priority = updates.priority;
  }
  
  // Apply other updates directly
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'title' && key !== 'completed' && key !== 'priority') {
      (processedUpdates as any)[key] = value;
    }
  });
  
  // Update the todo
  const updatedTodo = dataStore.updateTodo(listId, todoId, processedUpdates);
  
  if (!updatedTodo) {
    return res.status(404).json({ error: 'Todo list or todo item not found' });
  }
  
  // Emit socket event for the update
  const io = req.app.get('io') as Server;
  socketService.emitTodoAdded(io, listId, updatedTodo); // Reusing the todo added event
  
  res.json(updatedTodo);
});

/**
 * PUT /api/lists
 * Update all todo lists at once
 */
router.put('/', (req: AuthRequest, res: Response) => {
  const { lists } = req.body;
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!Array.isArray(lists)) {
    return res.status(400).json({ error: 'Lists must be an array' });
  }
  
  // Convert string dates back to Date objects
  const processedLists = lists.map((list: any) => ({
    ...list,
    createdAt: new Date(list.createdAt)
  }));
  
  // Filter lists to only include those owned by the user
  const userLists = processedLists.filter((list: TodoList) => 
    dataStore.isListOwnedByUser(userId, list.id)
  );
  
  dataStore.updateLists(userLists, userId);
  
  // Emit socket event
  const io = req.app.get('io') as Server;
  socketService.emitListsUpdated(io, userLists, userId);
  
  res.status(200).json({ success: true });
});

export default router; 