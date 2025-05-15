import * as authService from './authService';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export const fetchTodoLists = async () => {
  try {
    const headers = authService.getAuthHeader();
    console.log('Fetching todo lists with headers:', headers);
    
    const response = await fetch(`${API_URL}/lists`, {
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const statusText = response.statusText || 'Unknown error';
      const errorMessage = errorData.error || `Failed to fetch todo lists: ${response.status} ${statusText}`;
      console.error('API Error:', { status: response.status, message: errorMessage, data: errorData });
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch todo lists:', error);
    throw error;
  }
};

export const fetchOwnedTodoLists = async () => {
  const response = await fetch(`${API_URL}/lists/owned`, {
    headers: {
      ...authService.getAuthHeader()
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch owned todo lists');
  }
  
  return response.json();
};

export const fetchSharedTodoLists = async () => {
  const response = await fetch(`${API_URL}/lists/shared`, {
    headers: {
      ...authService.getAuthHeader()
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch shared todo lists');
  }
  
  return response.json();
};

export const fetchTodoList = async (listId: string) => {
  const response = await fetch(`${API_URL}/lists/${listId}`, {
    headers: {
      ...authService.getAuthHeader()
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch todo list');
  }
  
  return response.json();
};

export const createTodoList = async (title: string) => {
  const response = await fetch(`${API_URL}/lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    },
    body: JSON.stringify({ name: title })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create todo list');
  }
  
  return response.json();
};

export const updateTodoList = async (listId: string, title: string) => {
  const response = await fetch(`${API_URL}/lists/${listId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    },
    body: JSON.stringify({ title })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update todo list');
  }
  
  return response.json();
};

export const deleteTodoList = async (listId: string) => {
  const response = await fetch(`${API_URL}/lists/${listId}`, {
    method: 'DELETE',
    headers: {
      ...authService.getAuthHeader()
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete todo list');
  }
  
  return response.json();
};

export const shareTodoList = async (listId: string, email: string, permission: 'read' | 'write') => {
  try {
    const response = await fetch(`${API_URL}/lists/${listId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader()
      },
      body: JSON.stringify({ email, permission })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to share todo list');
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to share todo list:', error);
    throw error;
  }
};

export const createTodo = async (listId: string, title: string) => {
  const response = await fetch(`${API_URL}/lists/${listId}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    },
    body: JSON.stringify({ text: title })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create todo');
  }
  
  return response.json();
};

export const updateTodo = async (listId: string, todoId: string, updates: { title?: string; completed?: boolean }) => {
  const response = await fetch(`${API_URL}/lists/${listId}/todos/${todoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authService.getAuthHeader()
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  
  return response.json();
};

export const toggleTodo = async (listId: string, todoId: string) => {
  const response = await fetch(`${API_URL}/lists/${listId}/todos/${todoId}/toggle`, {
    method: 'PATCH',
    headers: {
      ...authService.getAuthHeader()
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to toggle todo');
  }
  
  return response.json();
};

export const deleteTodo = async (listId: string, todoId: string) => {
  const response = await fetch(`${API_URL}/lists/${listId}/todos/${todoId}`, {
    method: 'DELETE',
    headers: {
      ...authService.getAuthHeader()
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
  
  return response.json();
}; 