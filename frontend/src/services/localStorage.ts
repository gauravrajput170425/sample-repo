import type { Todo } from "../types/todo";
import { TodoStatus } from "../types/todo";
import type { TodoList } from "../types/todoList";
import * as authService from './authService';
import * as todoListService from './todoListService';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

/**
 * Service for interacting with the backend API
 * This replaces the previous localStorage implementation
 */
export const services = {
  /**
   * Retrieves all todo lists from the API
   * @returns {Promise<TodoList[]>} Promise resolving to an array of all todo lists
   */
  getAllLists: async (): Promise<TodoList[]> => {
    try {
      const headers = authService.getAuthHeader();
      console.log('Getting all lists with auth headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/lists`, {
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to get lists:', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorData 
        });
        throw new Error(errorData.error || `Failed to fetch todo lists: ${response.status} ${response.statusText}`);
      }
      
      const lists = await response.json();
      
      // Convert string dates back to Date objects
      return lists.map((list: any) => ({
        ...list,
        createdAt: new Date(list.createdAt)
      }));
    } catch (error) {
      console.error("Error retrieving todo lists from API:", error);
      return [];
    }
  },
  
  /**
   * Adds a new todo list via the API
   * @param {TodoList} list - The todo list to add
   * @returns {Promise<TodoList>} Promise resolving to the created todo list
   */
  addList: async (list: TodoList): Promise<TodoList> => {
    try {
      const response = await fetch(`${API_BASE_URL}/lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({ name: list.name })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add list: ${response.status} ${response.statusText}`);
      }
      
      const newList = await response.json();
      return {
        ...newList,
        createdAt: new Date(newList.createdAt)
      };
    } catch (error) {
      console.error("Error adding todo list to API:", error);
      throw error;
    }
  },
  
  /**
   * Deletes a todo list by its ID via the API
   * @param {string} id - ID of the todo list to delete
   * @returns {Promise<void>}
   */
  deleteList: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/lists/${id}`, {
        method: "DELETE",
        headers: {
          ...authService.getAuthHeader()
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete list: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting todo list from API:", error);
      throw error;
    }
  },
  
  /**
   * Adds a todo item to a specific todo list via the API
   * @param {string} listId - ID of the todo list
   * @param {Todo} todo - Todo item to add
   * @returns {Promise<Todo>} Promise resolving to the created todo
   */
  addTodo: async (listId: string, todo: Omit<Todo, "id" | "status">): Promise<Todo> => {
    try {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({ text: todo.text })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add todo: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error adding todo to API:", error);
      throw error;
    }
  },
  
  /**
   * Toggles the status of a todo item via the API
   * @param {string} listId - ID of the todo list
   * @param {string} todoId - ID of the todo item to toggle
   * @returns {Promise<Todo>} Promise resolving to the updated todo
   */
  toggleTodo: async (listId: string, todoId: string): Promise<Todo> => {
    try {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}/todos/${todoId}/toggle`, {
        method: "PATCH",
        headers: {
          ...authService.getAuthHeader()
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to toggle todo: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error toggling todo status via API:", error);
      throw error;
    }
  },
  
  /**
   * Updates all todo lists at once via the API
   * @param {TodoList[]} lists - Array of todo lists to save
   * @returns {Promise<void>}
   */
  updateLists: async (lists: TodoList[]): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/lists`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({ lists })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update lists: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating todo lists via API:", error);
      throw error;
    }
  },
  
  /**
   * Shares a todo list with another user via the API
   * @param {string} listId - ID of the todo list to share
   * @param {string} email - Email of the user to share with
   * @param {string} permission - Permission to grant ('read' or 'write')
   * @returns {Promise<any>} Promise resolving to the share response
   */
  shareList: async (listId: string, email: string, permission: 'read' | 'write'): Promise<any> => {
    return todoListService.shareTodoList(listId, email, permission);
  }
}; 