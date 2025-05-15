import db from './database';
import { sampleUsers, sampleTodoLists } from './sampleData';

/**
 * Initialize the database with sample data
 */
export function initializeDatabase(): void {
  loadSampleUsers();
  loadSampleTodoLists();
}

/**
 * Load sample users into the database
 */
function loadSampleUsers(): void {
  // Check if database already has users
  if (db.getUsers().length > 0) {
    console.log('Database already has users. Skipping sample user initialization.');
    return;
  }

  console.log('Loading sample users into database...');
  
  // Add each sample user to the database
  Object.values(sampleUsers).forEach(user => {
    db.addUser(user);
  });
  
  console.log(`Added ${Object.keys(sampleUsers).length} sample users.`);
}

/**
 * Load sample todo lists and todos into the database
 */
function loadSampleTodoLists(): void {
  // Check if database already has todo lists
  if (db.getTodoLists().length > 0) {
    console.log('Database already has todo lists. Skipping sample todo list initialization.');
    return;
  }

  console.log('Loading sample todo lists into database...');
  
  // Get admin user ID to assign as the owner of sample lists
  const adminUser = db.getUserByUsernameOrEmail('admin');
  
  if (!adminUser) {
    console.error('Admin user not found. Cannot load sample todo lists.');
    return;
  }
  
  // Add each sample todo list to the database
  Object.values(sampleTodoLists.lists).forEach(list => {
    db.addTodoList(list, adminUser.id);
  });
  
  // Add todos for each list
  Object.entries(sampleTodoLists.todos).forEach(([listId, todos]) => {
    todos.forEach(todo => {
      db.addTodo(listId, todo);
    });
  });
  
  console.log(`Added ${Object.keys(sampleTodoLists.lists).length} sample todo lists with todos.`);
} 