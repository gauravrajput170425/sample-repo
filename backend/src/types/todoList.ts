import type { Todo } from "./todo";
import type { SharePermission } from "../db/database";

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
  permission?: SharePermission; // The permission level for the shared user
  accessTypes?: AccessType[];   // Legacy field
} 