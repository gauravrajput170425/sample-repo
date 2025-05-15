"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// In-memory storage for the application data
class Database {
    constructor() {
        this.users = [];
        this.todoLists = [];
        this.todos = new Map(); // Map of listId to todos
        this.userTodoLists = new Map(); // Map of userId to listIds
        this.sharedTodoLists = new Map(); // Map of userId to shared lists
    }
    // User methods
    getUsers() {
        return [...this.users];
    }
    getUserById(userId) {
        return this.users.find(user => user.id === userId);
    }
    getUserByUsernameOrEmail(usernameOrEmail) {
        return this.users.find(user => user.username === usernameOrEmail || user.email === usernameOrEmail);
    }
    addUser(user) {
        this.users.push(user);
        // Initialize empty array for user's todo lists
        this.userTodoLists.set(user.id, []);
        // Initialize empty array for lists shared with the user
        this.sharedTodoLists.set(user.id, []);
        return user;
    }
    // TodoList methods
    getTodoLists() {
        // We need to return TodoList objects with empty todos arrays
        return this.todoLists.map(list => ({
            ...list,
            todos: []
        }));
    }
    // Get todo lists for a specific user
    getUserTodoLists(userId) {
        const userListIds = this.userTodoLists.get(userId) || [];
        return this.todoLists
            .filter(list => userListIds.includes(list.id))
            .map(list => ({
            ...list,
            todos: []
        }));
    }
    // Get todo lists shared with a specific user
    getSharedTodoLists(userId) {
        const sharedEntries = this.sharedTodoLists.get(userId) || [];
        return sharedEntries.map(entry => {
            const list = this.todoLists.find(l => l.id === entry.listId);
            if (!list)
                return null;
            return {
                ...list,
                todos: [],
                isShared: true,
                permission: entry.permission
            };
        }).filter(Boolean);
    }
    // Get all accessible lists for a user (owned + shared)
    getAllAccessibleLists(userId) {
        const ownedLists = this.getUserTodoLists(userId).map(list => ({
            ...list,
            isOwner: true
        }));
        const sharedLists = this.getSharedTodoLists(userId);
        return [...ownedLists, ...sharedLists];
    }
    getTodoListById(listId) {
        const list = this.todoLists.find(list => list.id === listId);
        if (!list)
            return undefined;
        return {
            ...list,
            todos: []
        };
    }
    // Check if a user owns a todo list
    isListOwnedByUser(userId, listId) {
        const userListIds = this.userTodoLists.get(userId) || [];
        return userListIds.includes(listId);
    }
    // Check if a todo list is shared with a user
    isListSharedWithUser(userId, listId) {
        const sharedEntries = this.sharedTodoLists.get(userId) || [];
        return sharedEntries.find(entry => entry.listId === listId);
    }
    // Check if a user has access to a list (either owns it or it's shared with them)
    hasAccessToList(userId, listId) {
        return this.isListOwnedByUser(userId, listId) || !!this.isListSharedWithUser(userId, listId);
    }
    // Check if a user has write access to a list
    hasWriteAccessToList(userId, listId) {
        // If the user owns the list, they have write access
        if (this.isListOwnedByUser(userId, listId)) {
            return true;
        }
        // Check if the list is shared with the user with write permission
        const sharedEntry = this.isListSharedWithUser(userId, listId);
        return sharedEntry?.permission === 'write';
    }
    // Get the owner of a list
    getListOwner(listId) {
        for (const [userId, listIds] of this.userTodoLists.entries()) {
            if (listIds.includes(listId)) {
                return userId;
            }
        }
        return undefined;
    }
    addTodoList(todoList, userId) {
        // Store the list without the todos
        const { todos, ...listWithoutTodos } = todoList;
        const newList = {
            ...listWithoutTodos,
            todos: [] // Keep the type correct
        };
        this.todoLists.push(newList);
        // Initialize empty todos array for this list
        this.todos.set(todoList.id, todos || []);
        // Associate the list with the user
        const userLists = this.userTodoLists.get(userId) || [];
        userLists.push(todoList.id);
        this.userTodoLists.set(userId, userLists);
        return newList;
    }
    // Share a todo list with another user
    shareTodoList(listId, ownerUserId, targetUserId, permission) {
        // Check if the list exists and the owner owns it
        if (!this.isListOwnedByUser(ownerUserId, listId)) {
            return false;
        }
        // Check if the target user exists
        if (!this.getUserById(targetUserId)) {
            return false;
        }
        // Get the shared lists for the target user
        const sharedLists = this.sharedTodoLists.get(targetUserId) || [];
        // Check if the list is already shared with the user
        const existingIndex = sharedLists.findIndex(entry => entry.listId === listId);
        if (existingIndex >= 0) {
            // Update the existing permission
            sharedLists[existingIndex].permission = permission;
        }
        else {
            // Add a new shared entry
            sharedLists.push({ listId, permission });
        }
        // Update the shared lists for the user
        this.sharedTodoLists.set(targetUserId, sharedLists);
        return true;
    }
    // Remove sharing for a todo list
    removeSharing(listId, ownerUserId, targetUserId) {
        // Check if the list exists and the owner owns it
        if (!this.isListOwnedByUser(ownerUserId, listId)) {
            return false;
        }
        // Get the shared lists for the target user
        const sharedLists = this.sharedTodoLists.get(targetUserId) || [];
        // Filter out the list to unshare
        const updatedSharedLists = sharedLists.filter(entry => entry.listId !== listId);
        // Update the shared lists for the user
        this.sharedTodoLists.set(targetUserId, updatedSharedLists);
        return sharedLists.length !== updatedSharedLists.length;
    }
    updateTodoList(listId, updates) {
        const index = this.todoLists.findIndex(list => list.id === listId);
        if (index === -1)
            return null;
        // Don't update todos here - they're stored separately
        const { todos, ...updatesWithoutTodos } = updates;
        this.todoLists[index] = {
            ...this.todoLists[index],
            ...updatesWithoutTodos
        };
        return {
            ...this.todoLists[index],
            todos: []
        };
    }
    deleteTodoList(listId, userId) {
        const initialLength = this.todoLists.length;
        this.todoLists = this.todoLists.filter(list => list.id !== listId);
        // Also remove all todos associated with this list
        this.todos.delete(listId);
        // Remove the list from the user's lists
        const userLists = this.userTodoLists.get(userId) || [];
        const updatedUserLists = userLists.filter(id => id !== listId);
        this.userTodoLists.set(userId, updatedUserLists);
        // Remove any shares for this list
        for (const [userId, sharedLists] of this.sharedTodoLists.entries()) {
            const updatedSharedLists = sharedLists.filter(entry => entry.listId !== listId);
            this.sharedTodoLists.set(userId, updatedSharedLists);
        }
        return initialLength > this.todoLists.length;
    }
    // Todo methods
    getTodos(listId) {
        return this.todos.get(listId) || [];
    }
    getTodoById(listId, todoId) {
        const todos = this.todos.get(listId);
        if (!todos)
            return undefined;
        return todos.find(todo => todo.id === todoId);
    }
    addTodo(listId, todo) {
        if (!this.todos.has(listId)) {
            // Check if the list exists
            const listExists = this.todoLists.some(list => list.id === listId);
            if (!listExists)
                return null;
            // Initialize the todos array for this list
            this.todos.set(listId, []);
        }
        const todos = this.todos.get(listId);
        todos.push(todo);
        return todo;
    }
    updateTodo(listId, todoId, updates) {
        const todos = this.todos.get(listId);
        if (!todos)
            return null;
        const index = todos.findIndex(todo => todo.id === todoId);
        if (index === -1)
            return null;
        todos[index] = { ...todos[index], ...updates };
        return todos[index];
    }
    deleteTodo(listId, todoId) {
        const todos = this.todos.get(listId);
        if (!todos)
            return false;
        const initialLength = todos.length;
        const newTodos = todos.filter(todo => todo.id !== todoId);
        this.todos.set(listId, newTodos);
        return initialLength > newTodos.length;
    }
}
// Create and export a singleton instance
const db = new Database();
exports.default = db;
