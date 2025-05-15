import type { Todo } from "../types/todo";
import { TodoStatus } from "../types/todo";
import type { TodoList } from "../types/todoList";
import { v4 as uuidv4 } from 'uuid';
import db, { SharePermission } from '../db/database';

/**
 * Retrieves all todo lists from memory
 * @returns {TodoList[]} Array of todo lists
 */
export const getAllLists = (): TodoList[] => {
  const lists = db.getTodoLists();
  
  // For each list, get its todos and attach them
  return lists.map(list => {
    const todos = db.getTodos(list.id);
    return {
      ...list,
      todos
    };
  });
};

/**
 * Retrieves all todo lists for a specific user
 * @param {string} userId - ID of the user
 * @returns {TodoList[]} Array of todo lists belonging to the user
 */
export const getUserLists = (userId: string): TodoList[] => {
  const lists = db.getUserTodoLists(userId);
  
  // For each list, get its todos and attach them
  return lists.map(list => {
    const todos = db.getTodos(list.id);
    return {
      ...list,
      todos,
      isOwner: true
    };
  });
};

/**
 * Retrieves all lists shared with a specific user
 * @param {string} userId - ID of the user
 * @returns {TodoList[]} Array of todo lists shared with the user
 */
export const getSharedLists = (userId: string): TodoList[] => {
  const lists = db.getSharedTodoLists(userId);
  
  // For each list, get its todos and attach them
  return lists.map(list => {
    const todos = db.getTodos(list.id);
    return {
      ...list,
      todos
    };
  });
};

/**
 * Retrieves all lists a user has access to (owned + shared)
 * @param {string} userId - ID of the user
 * @returns {TodoList[]} Array of accessible todo lists
 */
export const getAllAccessibleLists = (userId: string): TodoList[] => {
  const ownedLists = getUserLists(userId);
  const sharedLists = getSharedLists(userId);
  return [...ownedLists, ...sharedLists];
};

/**
 * Checks if a list is owned by a user
 * @param {string} userId - ID of the user
 * @param {string} listId - ID of the list
 * @returns {boolean} Whether the user owns the list
 */
export const isListOwnedByUser = (userId: string, listId: string): boolean => {
  return db.isListOwnedByUser(userId, listId);
};

/**
 * Checks if a user has access to a list (either owns it or it's shared with them)
 * @param {string} userId - ID of the user
 * @param {string} listId - ID of the list
 * @returns {boolean} Whether the user has access to the list
 */
export const hasAccessToList = (userId: string, listId: string): boolean => {
  return db.hasAccessToList(userId, listId);
};

/**
 * Checks if a user has write access to a list
 * @param {string} userId - ID of the user
 * @param {string} listId - ID of the list
 * @returns {boolean} Whether the user has write access to the list
 */
export const hasWriteAccessToList = (userId: string, listId: string): boolean => {
  return db.hasWriteAccessToList(userId, listId);
};

/**
 * Gets the owner of a list
 * @param {string} listId - ID of the list
 * @returns {string|undefined} The ID of the owner, or undefined if not found
 */
export const getListOwner = (listId: string): string | undefined => {
  return db.getListOwner(listId);
};

/**
 * Adds a new todo list to storage
 * @param {TodoList} list - The todo list to add
 * @param {string} userId - ID of the user who owns the list
 */
export const addList = (list: TodoList, userId: string): void => {
  const newList = { ...list, todos: [] };
  db.addTodoList(newList, userId);
};

/**
 * Gets a user by their email address
 * @param {string} email - Email address to look up
 * @returns {Object|null} User object without password or null if not found
 */
export const getUserByEmail = (email: string): { id: string, username: string, email: string } | null => {
  const user = db.getUserByUsernameOrEmail(email);
  if (!user) return null;
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Shares a todo list with another user
 * @param {string} listId - ID of the list to share
 * @param {string} ownerUserId - ID of the list owner
 * @param {string} targetUserEmail - Email of the user to share with
 * @param {SharePermission} permission - Permission to grant ('read' or 'write')
 * @returns {boolean} Success indicator
 */
export const shareList = (
  listId: string,
  ownerUserId: string,
  targetUserEmail: string,
  permission: SharePermission
): boolean => {
  // Find the target user by email
  const targetUser = db.getUsers().find(user => user.email === targetUserEmail);
  if (!targetUser) {
    return false;
  }

  return db.shareTodoList(listId, ownerUserId, targetUser.id, permission);
};

/**
 * Removes sharing for a list
 * @param {string} listId - ID of the list
 * @param {string} ownerUserId - ID of the list owner
 * @param {string} targetUserId - ID of the user to remove sharing for
 * @returns {boolean} Success indicator
 */
export const removeSharing = (
  listId: string,
  ownerUserId: string,
  targetUserId: string
): boolean => {
  return db.removeSharing(listId, ownerUserId, targetUserId);
};

/**
 * Deletes a todo list by its ID
 * @param {string} id - ID of the todo list to delete
 * @param {string} userId - ID of the user who owns the list
 */
export const deleteList = (id: string, userId: string): void => {
  db.deleteTodoList(id, userId);
};

/**
 * Adds a todo item to a specific todo list
 * @param {string} listId - ID of the todo list
 * @param {Todo} todo - Todo item to add
 * @returns {boolean} Success indicator
 */
export const addTodo = (listId: string, todo: Todo): boolean => {
  const result = db.addTodo(listId, todo);
  return result !== null;
};

/**
 * Toggles the status of a todo item
 * @param {string} listId - ID of the todo list
 * @param {string} todoId - ID of the todo item to toggle
 * @returns {boolean} Success indicator
 */
export const toggleTodo = (listId: string, todoId: string): boolean => {
  const todo = db.getTodoById(listId, todoId);
  
  if (!todo) {
    return false;
  }
  
  // Cycle through the states: TODO -> IN_PROGRESS -> COMPLETED -> TODO
  const nextStatus = (() => {
    switch (todo.status) {
      case TodoStatus.TODO:
        return TodoStatus.IN_PROGRESS;
      case TodoStatus.IN_PROGRESS:
        return TodoStatus.COMPLETED;
      case TodoStatus.COMPLETED:
        return TodoStatus.TODO;
      default:
        return TodoStatus.TODO;
    }
  })();
  
  const result = db.updateTodo(listId, todoId, { status: nextStatus });
  return result !== null;
};

/**
 * Updates all todo lists at once
 * @param {TodoList[]} lists - Array of todo lists to save
 * @param {string} userId - ID of the user who owns the lists
 */
export const updateLists = (lists: TodoList[], userId: string): void => {
  // This is a more complex operation with our database structure
  // We need to handle each list and its todos separately
  
  // First, get current lists for this user to compare
  const currentLists = db.getUserTodoLists(userId);
  
  // For each new list
  lists.forEach(newList => {
    const { id, name, todos = [] } = newList;
    
    // Check if list exists and is owned by the user
    const existingList = currentLists.find(list => list.id === id);
    const isOwnedByUser = db.isListOwnedByUser(userId, id);
    const hasWriteAccess = db.hasWriteAccessToList(userId, id);
    
    if (existingList && isOwnedByUser) {
      // Update existing list
      db.updateTodoList(id, { name });
      
      // Get current todos to compare
      const currentTodos = db.getTodos(id);
      
      // Handle todos
      todos.forEach(todo => {
        const existingTodo = currentTodos.find(t => t.id === todo.id);
        
        if (existingTodo) {
          // Update existing todo
          db.updateTodo(id, todo.id, todo);
        } else {
          // Add new todo
          db.addTodo(id, todo);
        }
      });
      
      // Remove todos that no longer exist
      currentTodos.forEach(currentTodo => {
        if (!todos.some(t => t.id === currentTodo.id)) {
          db.deleteTodo(id, currentTodo.id);
        }
      });
    } else if (hasWriteAccess) {
      // User has write access to a shared list, so update its todos
      const currentTodos = db.getTodos(id);
      
      // Handle todos
      todos.forEach(todo => {
        const existingTodo = currentTodos.find(t => t.id === todo.id);
        
        if (existingTodo) {
          // Update existing todo
          db.updateTodo(id, todo.id, todo);
        } else {
          // Add new todo
          db.addTodo(id, todo);
        }
      });
      
      // Remove todos that no longer exist
      currentTodos.forEach(currentTodo => {
        if (!todos.some(t => t.id === currentTodo.id)) {
          db.deleteTodo(id, currentTodo.id);
        }
      });
    } else if (!existingList) {
      // Add new list with todos
      const newListWithoutTodos: TodoList = { 
        id, 
        name, 
        todos: [], // Add empty todos array to satisfy the type
        createdAt: newList.createdAt || new Date() 
      };
      
      db.addTodoList(newListWithoutTodos, userId);
      
      // Add todos
      todos.forEach(todo => {
        db.addTodo(id, todo);
      });
    }
  });
  
  // Remove lists that no longer exist (only for those owned by the user)
  currentLists.forEach(currentList => {
    if (!lists.some(l => l.id === currentList.id)) {
      db.deleteTodoList(currentList.id, userId);
    }
  });
};

/**
 * Updates a todo item with the given properties
 * @param {string} listId - ID of the todo list
 * @param {string} todoId - ID of the todo item to update
 * @param {Partial<Todo>} updates - Properties to update
 * @returns {Todo | null} Updated todo or null if not found
 */
export const updateTodo = (listId: string, todoId: string, updates: Partial<Todo>): Todo | null => {
  return db.updateTodo(listId, todoId, updates);
}; 