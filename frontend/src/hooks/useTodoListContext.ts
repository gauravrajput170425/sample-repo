import { useContext } from "react";
import { TodoListContext } from "../contexts/TodoListContext";

export const useTodoListContext = () => {
  const context = useContext(TodoListContext);
  
  if (context === undefined) {
    throw new Error("useTodoListContext must be used within a TodoListProvider");
  }
  
  return context;
}; 