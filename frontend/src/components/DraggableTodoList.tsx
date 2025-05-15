import { useDrag, useDrop } from 'react-dnd';
import type { TodoList } from '../types/todoList';
import TodoListComponent from './TodoList';
import { useRef } from 'react';
import { ItemTypes } from '../types/dndItemTypes';

interface DraggableTodoListProps {
  list: TodoList;
  index: number;
  moveList: (fromIndex: number, toIndex: number) => void;
  onDelete: () => void;
  onAddTodo: (listId: string, todoText: string) => void;
  onToggleTodo: (listId: string, todoId: string) => void;
}

const DraggableTodoList = ({ 
  list, 
  index, 
  moveList, 
  onDelete, 
  onAddTodo, 
  onToggleTodo 
}: DraggableTodoListProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Setup drag source
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TODO_LIST,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Setup drop target
  const [, drop] = useDrop({
    accept: ItemTypes.TODO_LIST,
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Get the bounding rectangle of the hover target
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) {
        return;
      }

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the item's height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveList(dragIndex, hoverIndex);
      
      // Update the drag item's index to match the new position
      item.index = hoverIndex;
    },
  });
  
  // Connect the drag source and drop target
  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div 
      ref={ref} 
      style={{ opacity, cursor: 'move' }}
      className="mb-6"
    >
      <TodoListComponent 
        list={list} 
        onDelete={onDelete}
        onAddTodo={onAddTodo}
        onToggleTodo={onToggleTodo}
      />
    </div>
  );
};

export default DraggableTodoList; 