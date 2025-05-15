"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const database_1 = __importDefault(require("./database"));
const sampleData_1 = require("./sampleData");
/**
 * Initialize the database with sample data
 */
function initializeDatabase() {
    loadSampleUsers();
    loadSampleTodoLists();
}
/**
 * Load sample users into the database
 */
function loadSampleUsers() {
    // Check if database already has users
    if (database_1.default.getUsers().length > 0) {
        console.log('Database already has users. Skipping sample user initialization.');
        return;
    }
    console.log('Loading sample users into database...');
    // Add each sample user to the database
    Object.values(sampleData_1.sampleUsers).forEach(user => {
        database_1.default.addUser(user);
    });
    console.log(`Added ${Object.keys(sampleData_1.sampleUsers).length} sample users.`);
}
/**
 * Load sample todo lists and todos into the database
 */
function loadSampleTodoLists() {
    // Check if database already has todo lists
    if (database_1.default.getTodoLists().length > 0) {
        console.log('Database already has todo lists. Skipping sample todo list initialization.');
        return;
    }
    console.log('Loading sample todo lists into database...');
    // Get admin user ID to assign as the owner of sample lists
    const adminUser = database_1.default.getUserByUsernameOrEmail('admin');
    if (!adminUser) {
        console.error('Admin user not found. Cannot load sample todo lists.');
        return;
    }
    // Add each sample todo list to the database
    Object.values(sampleData_1.sampleTodoLists.lists).forEach(list => {
        database_1.default.addTodoList(list, adminUser.id);
    });
    // Add todos for each list
    Object.entries(sampleData_1.sampleTodoLists.todos).forEach(([listId, todos]) => {
        todos.forEach(todo => {
            database_1.default.addTodo(listId, todo);
        });
    });
    console.log(`Added ${Object.keys(sampleData_1.sampleTodoLists.lists).length} sample todo lists with todos.`);
}
