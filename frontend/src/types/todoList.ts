import type { Todo } from "./todo";

export enum AccessType {
  EDIT = 0,
  VIEW = 1
}

export interface TodoList {
  id: string;
  name: string;
  todos: Todo[];
  createdAt: Date;
  isOwner?: boolean;      // Whether the current user is the owner
  isShared?: boolean;     // Whether the list is shared with the current user
  permission?: 'read' | 'write'; // The permission level for the shared user
  accessTypes?: AccessType[];
}