import type { ReactNode } from "react";
import { TodoListContext } from "./TodoListContext";
import { useTodoList } from "../hooks/useTodoList";

interface TodoListProviderProps {
  children: ReactNode;
}

export const TodoListProvider = ({ children }: TodoListProviderProps) => {
  const todoListContext = useTodoList();

  return (
    <TodoListContext.Provider value={todoListContext}>
      {children}
    </TodoListContext.Provider>
  );
}; 