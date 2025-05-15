import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { User } from '../types/user';
import { TodoList } from '../types/todoList';
import { Todo, TodoStatus } from '../types/todo';

// Sample users (passwords are hashed versions of 'password123')
export const sampleUsers: { [key: string]: User } = {
  admin: {
    id: uuidv4(),
    username: 'admin',
    email: 'admin@example.com',
    password: '$2b$10$6EwITJ7hpMxPeg0Z8D5PaOcG7FO5ZJ3A/SnQiCtpVbRgPLJDFZEYW', // password123
    createdAt: new Date().toISOString()
  },
  john: {
    id: uuidv4(),
    username: 'john',
    email: 'john@example.com',
    password: '$2b$10$6EwITJ7hpMxPeg0Z8D5PaOcG7FO5ZJ3A/SnQiCtpVbRgPLJDFZEYW', // password123
    createdAt: new Date().toISOString()
  },
  jane: {
    id: uuidv4(),
    username: 'jane',
    email: 'jane@example.com',
    password: '$2b$10$6EwITJ7hpMxPeg0Z8D5PaOcG7FO5ZJ3A/SnQiCtpVbRgPLJDFZEYW', // password123
    createdAt: new Date().toISOString()
  }
};

// Sample todo lists with associated todos
export const sampleTodoLists: { 
  lists: { [key: string]: TodoList }, 
  todos: { [key: string]: Todo[] } 
} = {
  lists: {
    work: {
      id: uuidv4(),
      name: "Work Tasks",
      todos: [],
      createdAt: new Date()
    },
    personal: {
      id: uuidv4(),
      name: "Personal Tasks",
      todos: [],
      createdAt: new Date()
    },
    shopping: {
      id: uuidv4(),
      name: "Shopping List",
      todos: [],
      createdAt: new Date()
    },
    fitness: {
      id: uuidv4(),
      name: "Fitness Goals",
      todos: [],
      createdAt: new Date()
    }
  },
  todos: {}
};

// Initialize todos for each list
sampleTodoLists.todos[sampleTodoLists.lists.work.id] = [
  {
    id: uuidv4(),
    text: "Complete project proposal",
    status: TodoStatus.TODO
  },
  {
    id: uuidv4(),
    text: "Review code pull requests",
    status: TodoStatus.IN_PROGRESS
  },
  {
    id: uuidv4(),
    text: "Update documentation",
    status: TodoStatus.COMPLETED
  },
  {
    id: uuidv4(),
    text: "Prepare for team meeting",
    status: TodoStatus.TODO
  }
];

sampleTodoLists.todos[sampleTodoLists.lists.personal.id] = [
  {
    id: uuidv4(),
    text: "Pay utility bills",
    status: TodoStatus.TODO
  },
  {
    id: uuidv4(),
    text: "Call mom",
    status: TodoStatus.COMPLETED
  },
  {
    id: uuidv4(),
    text: "Schedule dentist appointment",
    status: TodoStatus.TODO
  }
];

sampleTodoLists.todos[sampleTodoLists.lists.shopping.id] = [
  {
    id: uuidv4(),
    text: "Milk",
    status: TodoStatus.TODO
  },
  {
    id: uuidv4(),
    text: "Eggs",
    status: TodoStatus.TODO
  },
  {
    id: uuidv4(),
    text: "Bread",
    status: TodoStatus.TODO
  },
  {
    id: uuidv4(),
    text: "Fruits",
    status: TodoStatus.IN_PROGRESS
  }
];

sampleTodoLists.todos[sampleTodoLists.lists.fitness.id] = [
  {
    id: uuidv4(),
    text: "30 minutes cardio",
    status: TodoStatus.IN_PROGRESS
  },
  {
    id: uuidv4(),
    text: "Meal prep for the week",
    status: TodoStatus.TODO
  },
  {
    id: uuidv4(),
    text: "Track water intake",
    status: TodoStatus.COMPLETED
  }
];

// Helper function to create a consistent hashed password for sample data
export async function createHashedPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 10);
} 