export enum TodoStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2
}

export enum TodoPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

export interface Todo {
  id: string;
  text: string;
  status: TodoStatus;
  priority: TodoPriority;
}