"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleTodoLists = exports.sampleUsers = void 0;
exports.createHashedPassword = createHashedPassword;
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const todo_1 = require("../types/todo");
// Sample users (passwords are hashed versions of 'password123')
exports.sampleUsers = {
    admin: {
        id: (0, uuid_1.v4)(),
        username: 'admin',
        email: 'admin@example.com',
        password: '$2b$10$6EwITJ7hpMxPeg0Z8D5PaOcG7FO5ZJ3A/SnQiCtpVbRgPLJDFZEYW', // password123
        createdAt: new Date().toISOString()
    },
    john: {
        id: (0, uuid_1.v4)(),
        username: 'john',
        email: 'john@example.com',
        password: '$2b$10$6EwITJ7hpMxPeg0Z8D5PaOcG7FO5ZJ3A/SnQiCtpVbRgPLJDFZEYW', // password123
        createdAt: new Date().toISOString()
    },
    jane: {
        id: (0, uuid_1.v4)(),
        username: 'jane',
        email: 'jane@example.com',
        password: '$2b$10$6EwITJ7hpMxPeg0Z8D5PaOcG7FO5ZJ3A/SnQiCtpVbRgPLJDFZEYW', // password123
        createdAt: new Date().toISOString()
    }
};
// Sample todo lists with associated todos
exports.sampleTodoLists = {
    lists: {
        work: {
            id: (0, uuid_1.v4)(),
            name: "Work Tasks",
            todos: [],
            createdAt: new Date()
        },
        personal: {
            id: (0, uuid_1.v4)(),
            name: "Personal Tasks",
            todos: [],
            createdAt: new Date()
        },
        shopping: {
            id: (0, uuid_1.v4)(),
            name: "Shopping List",
            todos: [],
            createdAt: new Date()
        },
        fitness: {
            id: (0, uuid_1.v4)(),
            name: "Fitness Goals",
            todos: [],
            createdAt: new Date()
        }
    },
    todos: {}
};
// Initialize todos for each list
exports.sampleTodoLists.todos[exports.sampleTodoLists.lists.work.id] = [
    {
        id: (0, uuid_1.v4)(),
        text: "Complete project proposal",
        status: todo_1.TodoStatus.TODO
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Review code pull requests",
        status: todo_1.TodoStatus.IN_PROGRESS
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Update documentation",
        status: todo_1.TodoStatus.COMPLETED
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Prepare for team meeting",
        status: todo_1.TodoStatus.TODO
    }
];
exports.sampleTodoLists.todos[exports.sampleTodoLists.lists.personal.id] = [
    {
        id: (0, uuid_1.v4)(),
        text: "Pay utility bills",
        status: todo_1.TodoStatus.TODO
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Call mom",
        status: todo_1.TodoStatus.COMPLETED
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Schedule dentist appointment",
        status: todo_1.TodoStatus.TODO
    }
];
exports.sampleTodoLists.todos[exports.sampleTodoLists.lists.shopping.id] = [
    {
        id: (0, uuid_1.v4)(),
        text: "Milk",
        status: todo_1.TodoStatus.TODO
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Eggs",
        status: todo_1.TodoStatus.TODO
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Bread",
        status: todo_1.TodoStatus.TODO
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Fruits",
        status: todo_1.TodoStatus.IN_PROGRESS
    }
];
exports.sampleTodoLists.todos[exports.sampleTodoLists.lists.fitness.id] = [
    {
        id: (0, uuid_1.v4)(),
        text: "30 minutes cardio",
        status: todo_1.TodoStatus.IN_PROGRESS
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Meal prep for the week",
        status: todo_1.TodoStatus.TODO
    },
    {
        id: (0, uuid_1.v4)(),
        text: "Track water intake",
        status: todo_1.TodoStatus.COMPLETED
    }
];
// Helper function to create a consistent hashed password for sample data
async function createHashedPassword(plainPassword) {
    return bcrypt_1.default.hash(plainPassword, 10);
}
