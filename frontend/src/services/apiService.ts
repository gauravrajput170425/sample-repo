import type { Todo } from "../types/todo";
import type { TodoList } from "../types/todoList";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Service for interacting with the backend API
 * - Provides the same functionality as the localStorage service
 * - Can be used as a drop-in replacement for the localStorage service
 */
export const apiService = {
  /**
   * Retrieves all todo lists from the API
   * @returns {Promise<TodoList[]>} Promise resolving to an array of all todo lists
   */
  getAllLists: async (): Promise<TodoList[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/lists`);
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: list.name })
      });
      
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
      await fetch(`${API_BASE_URL}/lists/${id}`, {
        method: "DELETE"
      });
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
  addTodo: async (listId: string, todo: Todo): Promise<Todo> => {
    try {
      const response = await fetch(`${API_BASE_URL}/lists/${listId}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: todo.text })
      });
      
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
        method: "PATCH"
      });
      
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
      await fetch(`${API_BASE_URL}/lists`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ lists })
      });
    } catch (error) {
      console.error("Error updating todo lists via API:", error);
      throw error;
    }
  }
}; 