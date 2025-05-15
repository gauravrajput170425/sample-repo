import { useEffect } from 'react';
import * as socketService from '../services/socketService';
import type { TodoList } from '../types/todoList';
import type { Todo } from '../types/todo';
import { useAuth } from '../contexts/AuthContext';

interface UseSocketEventsProps {
  listId?: string; // Optional listId for list-specific events
  screenType?: 'main' | 'detail'; // Type of screen
  onListCreated?: (list: TodoList) => void;
  onListDeleted?: (data: { listId: string }) => void;
  onTodoAdded?: (data: { listId: string, todo: Todo }) => void;
  onTodoToggled?: (data: { listId: string, todo: Todo }) => void;
  onListsUpdated?: (data: { lists: TodoList[] }) => void;
  onListShared?: (data: { list: TodoList }) => void;
}

/**
 * A hook for subscribing to socket events
 * @param listId - Optional list ID to join a specific list room
 * @param screenType - Type of screen ('main' or 'detail')
 * @param callbacks - Event callbacks
 */
export const useSocketEvents = ({
  listId,
  screenType = 'main',
  onListCreated,
  onListDeleted,
  onTodoAdded,
  onTodoToggled,
  onListsUpdated,
  onListShared
}: UseSocketEventsProps) => {
  const { authState } = useAuth();
  
  useEffect(() => {
    // Don't set up socket if not authenticated
    if (!authState.isAuthenticated) {
      return;
    }
    
    // Initialize socket connection for the specific screen type
    socketService.initializeSocket(screenType, authState.token || undefined);

    // Join list-specific room if listId is provided
    if (listId && screenType === 'detail') {
      socketService.joinListRoom(listId);
    }

    // Set up event listeners if callbacks are provided
    if (onListCreated && screenType === 'main') {
      socketService.onListCreated(onListCreated);
    }
    
    if (onListDeleted) {
      socketService.onListDeleted(onListDeleted, screenType);
    }
    
    if (onTodoAdded && screenType === 'detail') {
      socketService.onTodoAdded(onTodoAdded);
    }
    
    if (onTodoToggled && screenType === 'detail') {
      socketService.onTodoToggled(onTodoToggled);
    }
    
    if (onListsUpdated && screenType === 'main') {
      socketService.onListsUpdated(onListsUpdated);
    }
    
    if (onListShared && screenType === 'main') {
      socketService.onListShared(onListShared);
    }

    // Clean up on unmount
    return () => {
      if (listId && screenType === 'detail') {
        socketService.leaveListRoom(listId);
      }
      socketService.unsubscribeAll(screenType);
    };
  }, [
    listId,
    screenType,
    onListCreated,
    onListDeleted,
    onTodoAdded,
    onTodoToggled,
    onListsUpdated,
    onListShared,
    authState.isAuthenticated,
    authState.token
  ]);

  return {
    disconnectSocket: () => socketService.disconnectSocket(screenType)
  };
}; 