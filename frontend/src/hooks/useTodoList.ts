import { useState, useEffect, useCallback } from "react";
import { TodoStatus } from "../types/todo";
import type { Todo } from "../types/todo";
import type { TodoList } from "../types/todoList";
import { services } from "../services/localStorage";
import { useSocketEvents } from "./useSocketEvents";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useTodoList = () => {
    const [lists, setLists] = useState<TodoList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { authState, logout } = useAuth();
    const navigate = useNavigate();

    // Handle authentication errors
    const handleAuthError = useCallback((error: any) => {
        console.error("Authentication error:", error);
        const errorMessage = error?.message || "Unknown error";
        
        // If we get a 401 or 403 error, log the user out and redirect to login
        if (errorMessage.includes("401") || errorMessage.includes("403") ||
            errorMessage.includes("Missing authentication token") || 
            errorMessage.includes("Invalid or expired token")) {
            console.log("Authentication error detected, logging out");
            logout();
            navigate("/login");
        }
        
        setError(errorMessage);
    }, [logout, navigate]);

    // Load initial data from localStorage
    useEffect(() => {
        const fetchLists = async () => {
            try {
                if (!authState.isAuthenticated) {
                    console.log("Not authenticated, skipping fetchLists");
                    setLists([]);
                    setIsLoading(false);
                    return;
                }
                
                console.log("Fetching lists with auth state:", {
                    isAuthenticated: authState.isAuthenticated,
                    token: authState.token ? `${authState.token.substring(0, 10)}...` : 'none'
                });
                
                setIsLoading(true);
                setError(null);
                const storedLists = await services.getAllLists();
                setLists(storedLists);
            } catch (error: any) {
                console.error("Error loading todo lists:", error);
                handleAuthError(error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchLists();
    }, [authState.isAuthenticated, authState.token, handleAuthError]);

    // Handle socket events for real-time updates
    const handleListCreated = useCallback((list: TodoList) => {
        // We'll receive the new list from the socket
        setLists((prevLists) => [...prevLists, list]);
    }, []);

    const handleListDeleted = useCallback((data: { listId: string }) => {
        setLists((prevLists) => prevLists.filter((list) => list.id !== data.listId));
    }, []);

    const handleListsUpdated = useCallback((data: { lists: TodoList[] }) => {
        // Convert string dates back to Date objects
        const processedLists = data.lists.map((list) => ({
            ...list,
            createdAt: new Date(list.createdAt)
        }));
        setLists(processedLists);
    }, []);

    const handleListShared = useCallback((data: { list: TodoList }) => {
        // When a list is shared with this user, add it to their lists
        console.log("List shared with you:", data.list);
        
        // Show a notification (you can implement a toast notification system)
        if (window.Notification && Notification.permission === "granted") {
            new Notification("New Todo List Shared", {
                body: `"${data.list.name}" has been shared with you (${data.list.permission} permission)`
            });
        }
        
        setLists((prevLists) => {
            // Check if we already have this list (unlikely but possible)
            const existingIndex = prevLists.findIndex(list => list.id === data.list.id);
            
            if (existingIndex >= 0) {
                // Update the existing list
                const updatedLists = [...prevLists];
                updatedLists[existingIndex] = {
                    ...data.list,
                    createdAt: new Date(data.list.createdAt) // Ensure date is a Date object
                };
                return updatedLists;
            } else {
                // Add the new shared list with proper date conversion
                return [...prevLists, {
                    ...data.list,
                    createdAt: new Date(data.list.createdAt)
                }];
            }
        });
    }, []);

    useSocketEvents({
        // Only listen for events relevant to the main list view
        screenType: 'main',
        onListCreated: handleListCreated,
        onListDeleted: handleListDeleted,
        onListsUpdated: handleListsUpdated,
        onListShared: handleListShared
        // Removed onTodoAdded and onTodoToggled as they're now handled in list-specific components
    });

    // Sync to localStorage whenever lists change
    useEffect(() => {
        if (authState.isAuthenticated && lists.length > 0) {
            services.updateLists(lists).catch(error => {
                console.error("Error updating lists:", error);
                handleAuthError(error);
            });
        }
    }, [authState.isAuthenticated, handleAuthError]);

    const addList = async (list: TodoList) => {
        try {
            // The server will emit a socket event, so we don't need to update the state here
            await services.addList(list);
        } catch (error: any) {
            console.error("Error adding list:", error);
            handleAuthError(error);
        }
    };

    const deleteList = async (id: string) => {
        try {
            // The server will emit a socket event, so we don't need to update the state here
            await services.deleteList(id);
        } catch (error: any) {
            console.error("Error deleting list:", error);
            handleAuthError(error);
        }
    };

    // Function to move a list from one position to another
    const moveTodoList = (fromIndex: number, toIndex: number) => {
        setLists((prevLists) => {
            const result = [...prevLists];
            const [removed] = result.splice(fromIndex, 1);
            result.splice(toIndex, 0, removed);
            
            // Update the server with the new order
            services.updateLists(result).catch(error => {
                console.error("Error updating lists order:", error);
                handleAuthError(error);
            });
            
            return result;
        });
    };

    const addTodo = async (listId: string, todo: Omit<Todo, "id" | "status">) => {
        try {
            // The server will emit a socket event, so we don't need to update the state here
            await services.addTodo(listId, todo);
        } catch (error: any) {
            console.error("Error adding todo:", error);
            handleAuthError(error);
        }
    };

    const toggleTodo = async (listId: string, todoId: string) => {
        try {
            // The server will emit a socket event, so we don't need to update the state here
            await services.toggleTodo(listId, todoId);
        } catch (error: any) {
            console.error("Error toggling todo:", error);
            handleAuthError(error);
        }
    };

    const updateListName = (listId: string, newName: string) => {
        setLists((prevLists) => {
            const updatedLists = prevLists.map((list) => {
                if (list.id === listId) {
                    return {
                        ...list,
                        name: newName,
                    };
                }
                return list;
            });
            
            // Update the server with the changes
            services.updateLists(updatedLists).catch(error => {
                console.error("Error updating list name:", error);
                handleAuthError(error);
            });
            
            return updatedLists;
        });
    };

    const editTodo = (listId: string, todoId: string, text: string) => {
        setLists((prevLists) => {
            const updatedLists = prevLists.map((list) => {
                if (list.id === listId) {
                    return {
                        ...list,
                        todos: list.todos.map((todo) => {
                            if (todo.id === todoId) {
                                return {
                                    ...todo,
                                    text,
                                };
                            }
                            return todo;
                        }),
                    };
                }
                return list;
            });
            
            // Update the server with the changes
            services.updateLists(updatedLists).catch(error => {
                console.error("Error updating todo text:", error);
                handleAuthError(error);
            });
            
            return updatedLists;
        });
    };

    const deleteTodo = (listId: string, todoId: string) => {
        setLists((prevLists) => {
            const updatedLists = prevLists.map((list) => {
                if (list.id === listId) {
                    return {
                        ...list,
                        todos: list.todos.filter((todo) => todo.id !== todoId),
                    };
                }
                return list;
            });
            
            // Update the server with the changes
            services.updateLists(updatedLists).catch(error => {
                console.error("Error deleting todo:", error);
                handleAuthError(error);
            });
            
            return updatedLists;
        });
    };

    const shareList = async (listId: string, email: string, permission: 'edit' | 'view') => {
        try {
            // Convert permission from 'edit'/'view' to 'write'/'read' for the API
            const apiPermission = permission === 'edit' ? 'write' : 'read';
            
            // Call the API to share the list
            await services.shareList(listId, email, apiPermission);
            
            // We don't need to update the state as this doesn't affect the current user's view
            // The shared user will see the list when they log in
            
            console.log(`List ${listId} shared with ${email} (${permission} permission)`);
        } catch (error: any) {
            console.error("Error sharing list:", error);
            handleAuthError(error);
        }
    };

    return {
        list: lists,
        isLoading,
        error,
        addList,
        deleteList,
        moveTodoList,
        addTodo,
        toggleTodo,
        updateListName,
        editTodo,
        deleteTodo,
        shareList,
    };
};