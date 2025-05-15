"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTodo = exports.updateLists = exports.toggleTodo = exports.addTodo = exports.deleteList = exports.removeSharing = exports.shareList = exports.getUserByEmail = exports.addList = exports.getListOwner = exports.hasWriteAccessToList = exports.hasAccessToList = exports.isListOwnedByUser = exports.getAllAccessibleLists = exports.getSharedLists = exports.getUserLists = exports.getAllLists = void 0;
const todo_1 = require("../types/todo");
const database_1 = __importDefault(require("../db/database"));
/**
 * Retrieves all todo lists from memory
 * @returns {TodoList[]} Array of todo lists
 */
const getAllLists = () => {
    const lists = database_1.default.getTodoLists();
    // For each list, get its todos and attach them
    return lists.map(list => {
        const todos = database_1.default.getTodos(list.id);
        return {
            ...list,
            todos
        };
    });
};
exports.getAllLists = getAllLists;
/**
 * Retrieves all todo lists for a specific user
 * @param {string} userId - ID of the user
 * @returns {TodoList[]} Array of todo lists belonging to the user
 */
const getUserLists = (userId) => {
    const lists = database_1.default.getUserTodoLists(userId);
    // For each list, get its todos and attach them
    return lists.map(list => {
        const todos = database_1.default.getTodos(list.id);
        return {
            ...list,
            todos,
            isOwner: true
        };
    });
};
exports.getUserLists = getUserLists;
/**
 * Retrieves all lists shared with a specific user
 * @param {string} userId - ID of the user
 * @returns {TodoList[]} Array of todo lists shared with the user
 */
const getSharedLists = (userId) => {
    const lists = database_1.default.getSharedTodoLists(userId);
    // For each list, get its todos and attach them
    return lists.map(list => {
        const todos = database_1.default.getTodos(list.id);
        return {
            ...list,
            todos
        };
    });
};
exports.getSharedLists = getSharedLists;
/**
 * Retrieves all lists a user has access to (owned + shared)
 * @param {string} userId - ID of the user
 * @returns {TodoList[]} Array of accessible todo lists
 */
const getAllAccessibleLists = (userId) => {
    const ownedLists = (0, exports.getUserLists)(userId);
    const sharedLists = (0, exports.getSharedLists)(userId);
    return [...ownedLists, ...sharedLists];
};
exports.getAllAccessibleLists = getAllAccessibleLists;
/**
 * Checks if a list is owned by a user
 * @param {string} userId - ID of the user
 * @param {string} listId - ID of the list
 * @returns {boolean} Whether the user owns the list
 */
const isListOwnedByUser = (userId, listId) => {
    return database_1.default.isListOwnedByUser(userId, listId);
};
exports.isListOwnedByUser = isListOwnedByUser;
/**
 * Checks if a user has access to a list (either owns it or it's shared with them)
 * @param {string} userId - ID of the user
 * @param {string} listId - ID of the list
 * @returns {boolean} Whether the user has access to the list
 */
const hasAccessToList = (userId, listId) => {
    return database_1.default.hasAccessToList(userId, listId);
};
exports.hasAccessToList = hasAccessToList;
/**
 * Checks if a user has write access to a list
 * @param {string} userId - ID of the user
 * @param {string} listId - ID of the list
 * @returns {boolean} Whether the user has write access to the list
 */
const hasWriteAccessToList = (userId, listId) => {
    return database_1.default.hasWriteAccessToList(userId, listId);
};
exports.hasWriteAccessToList = hasWriteAccessToList;
/**
 * Gets the owner of a list
 * @param {string} listId - ID of the list
 * @returns {string|undefined} The ID of the owner, or undefined if not found
 */
const getListOwner = (listId) => {
    return database_1.default.getListOwner(listId);
};
exports.getListOwner = getListOwner;
/**
 * Adds a new todo list to storage
 * @param {TodoList} list - The todo list to add
 * @param {string} userId - ID of the user who owns the list
 */
const addList = (list, userId) => {
    const newList = { ...list, todos: [] };
    database_1.default.addTodoList(newList, userId);
};
exports.addList = addList;
/**
 * Gets a user by their email address
 * @param {string} email - Email address to look up
 * @returns {Object|null} User object without password or null if not found
 */
const getUserByEmail = (email) => {
    const user = database_1.default.getUserByUsernameOrEmail(email);
    if (!user)
        return null;
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.getUserByEmail = getUserByEmail;
/**
 * Shares a todo list with another user
 * @param {string} listId - ID of the list to share
 * @param {string} ownerUserId - ID of the list owner
 * @param {string} targetUserEmail - Email of the user to share with
 * @param {SharePermission} permission - Permission to grant ('read' or 'write')
 * @returns {boolean} Success indicator
 */
const shareList = (listId, ownerUserId, targetUserEmail, permission) => {
    // Find the target user by email
    const targetUser = database_1.default.getUsers().find(user => user.email === targetUserEmail);
    if (!targetUser) {
        return false;
    }
    return database_1.default.shareTodoList(listId, ownerUserId, targetUser.id, permission);
};
exports.shareList = shareList;
/**
 * Removes sharing for a list
 * @param {string} listId - ID of the list
 * @param {string} ownerUserId - ID of the list owner
 * @param {string} targetUserId - ID of the user to remove sharing for
 * @returns {boolean} Success indicator
 */
const removeSharing = (listId, ownerUserId, targetUserId) => {
    return database_1.default.removeSharing(listId, ownerUserId, targetUserId);
};
exports.removeSharing = removeSharing;
/**
 * Deletes a todo list by its ID
 * @param {string} id - ID of the todo list to delete
 * @param {string} userId - ID of the user who owns the list
 */
const deleteList = (id, userId) => {
    database_1.default.deleteTodoList(id, userId);
};
exports.deleteList = deleteList;
/**
 * Adds a todo item to a specific todo list
 * @param {string} listId - ID of the todo list
 * @param {Todo} todo - Todo item to add
 * @returns {boolean} Success indicator
 */
const addTodo = (listId, todo) => {
    const result = database_1.default.addTodo(listId, todo);
    return result !== null;
};
exports.addTodo = addTodo;
/**
 * Toggles the status of a todo item
 * @param {string} listId - ID of the todo list
 * @param {string} todoId - ID of the todo item to toggle
 * @returns {boolean} Success indicator
 */
const toggleTodo = (listId, todoId) => {
    const todo = database_1.default.getTodoById(listId, todoId);
    if (!todo) {
        return false;
    }
    // Cycle through the states: TODO -> IN_PROGRESS -> COMPLETED -> TODO
    const nextStatus = (() => {
        switch (todo.status) {
            case todo_1.TodoStatus.TODO:
                return todo_1.TodoStatus.IN_PROGRESS;
            case todo_1.TodoStatus.IN_PROGRESS:
                return todo_1.TodoStatus.COMPLETED;
            case todo_1.TodoStatus.COMPLETED:
                return todo_1.TodoStatus.TODO;
            default:
                return todo_1.TodoStatus.TODO;
        }
    })();
    const result = database_1.default.updateTodo(listId, todoId, { status: nextStatus });
    return result !== null;
};
exports.toggleTodo = toggleTodo;
/**
 * Updates all todo lists at once
 * @param {TodoList[]} lists - Array of todo lists to save
 * @param {string} userId - ID of the user who owns the lists
 */
const updateLists = (lists, userId) => {
    // This is a more complex operation with our database structure
    // We need to handle each list and its todos separately
    // First, get current lists for this user to compare
    const currentLists = database_1.default.getUserTodoLists(userId);
    // For each new list
    lists.forEach(newList => {
        const { id, name, todos = [] } = newList;
        // Check if list exists and is owned by the user
        const existingList = currentLists.find(list => list.id === id);
        const isOwnedByUser = database_1.default.isListOwnedByUser(userId, id);
        const hasWriteAccess = database_1.default.hasWriteAccessToList(userId, id);
        if (existingList && isOwnedByUser) {
            // Update existing list
            database_1.default.updateTodoList(id, { name });
            // Get current todos to compare
            const currentTodos = database_1.default.getTodos(id);
            // Handle todos
            todos.forEach(todo => {
                const existingTodo = currentTodos.find(t => t.id === todo.id);
                if (existingTodo) {
                    // Update existing todo
                    database_1.default.updateTodo(id, todo.id, todo);
                }
                else {
                    // Add new todo
                    database_1.default.addTodo(id, todo);
                }
            });
            // Remove todos that no longer exist
            currentTodos.forEach(currentTodo => {
                if (!todos.some(t => t.id === currentTodo.id)) {
                    database_1.default.deleteTodo(id, currentTodo.id);
                }
            });
        }
        else if (hasWriteAccess) {
            // User has write access to a shared list, so update its todos
            const currentTodos = database_1.default.getTodos(id);
            // Handle todos
            todos.forEach(todo => {
                const existingTodo = currentTodos.find(t => t.id === todo.id);
                if (existingTodo) {
                    // Update existing todo
                    database_1.default.updateTodo(id, todo.id, todo);
                }
                else {
                    // Add new todo
                    database_1.default.addTodo(id, todo);
                }
            });
            // Remove todos that no longer exist
            currentTodos.forEach(currentTodo => {
                if (!todos.some(t => t.id === currentTodo.id)) {
                    database_1.default.deleteTodo(id, currentTodo.id);
                }
            });
        }
        else if (!existingList) {
            // Add new list with todos
            const newListWithoutTodos = {
                id,
                name,
                todos: [], // Add empty todos array to satisfy the type
                createdAt: newList.createdAt || new Date()
            };
            database_1.default.addTodoList(newListWithoutTodos, userId);
            // Add todos
            todos.forEach(todo => {
                database_1.default.addTodo(id, todo);
            });
        }
    });
    // Remove lists that no longer exist (only for those owned by the user)
    currentLists.forEach(currentList => {
        if (!lists.some(l => l.id === currentList.id)) {
            database_1.default.deleteTodoList(currentList.id, userId);
        }
    });
};
exports.updateLists = updateLists;
/**
 * Updates a todo item with the given properties
 * @param {string} listId - ID of the todo list
 * @param {string} todoId - ID of the todo item to update
 * @param {Partial<Todo>} updates - Properties to update
 * @returns {Todo | null} Updated todo or null if not found
 */
const updateTodo = (listId, todoId, updates) => {
    return database_1.default.updateTodo(listId, todoId, updates);
};
exports.updateTodo = updateTodo;
