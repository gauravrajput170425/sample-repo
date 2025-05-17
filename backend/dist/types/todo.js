"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoPriority = exports.TodoStatus = void 0;
var TodoStatus;
(function (TodoStatus) {
    TodoStatus[TodoStatus["TODO"] = 0] = "TODO";
    TodoStatus[TodoStatus["IN_PROGRESS"] = 1] = "IN_PROGRESS";
    TodoStatus[TodoStatus["COMPLETED"] = 2] = "COMPLETED";
})(TodoStatus || (exports.TodoStatus = TodoStatus = {}));
var TodoPriority;
(function (TodoPriority) {
    TodoPriority[TodoPriority["LOW"] = 0] = "LOW";
    TodoPriority[TodoPriority["MEDIUM"] = 1] = "MEDIUM";
    TodoPriority[TodoPriority["HIGH"] = 2] = "HIGH";
})(TodoPriority || (exports.TodoPriority = TodoPriority = {}));
