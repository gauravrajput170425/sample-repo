import { createContext } from "react";
import type { Todo } from "../types/todo";
import type { TodoList } from "../types/todoList";

interface TodoListContext {
    list: TodoList[];
    addList: (list: TodoList) => void;
    deleteList: (id: string) => void;
    moveTodoList: (fromIndex: number, toIndex: number) => void;
    addTodo: (listId: string, todo: Todo) => void;
    toggleTodo: (listId: string, todoId: string) => void;
    updateListName: (listId: string, newName: string) => void;
    editTodo: (listId: string, todoId: string, text: string) => void;
    deleteTodo: (listId: string, todoId: string) => void;
    shareList: (listId: string, email: string, permission: 'edit' | 'view') => void;
}


export const TodoListContext = createContext<TodoListContext>({
    list: [],
    addList: () => {},
    deleteList: () => {},
    moveTodoList: () => {},
    addTodo: () => {},
    toggleTodo: () => {},
    updateListName: () => {},
    editTodo: () => {},
    deleteTodo: () => {},
    shareList: () => {},
});

