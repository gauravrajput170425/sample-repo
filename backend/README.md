# Todo App Backend

A Node.js Express server that provides the same functionality as the localStorage service used in the frontend.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Start the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## API Endpoints

The server exposes the following endpoints:

### Todo Lists

- `GET /api/lists` - Retrieve all todo lists
- `POST /api/lists` - Create a new todo list
- `DELETE /api/lists/:listId` - Delete a todo list
- `PUT /api/lists` - Update all todo lists at once

### Todo Items

- `POST /api/lists/:listId/todos` - Add a todo to a specific list
- `PATCH /api/lists/:listId/todos/:todoId/toggle` - Toggle the status of a todo

## Health Check

- `GET /health` - Check if the server is running

## Integration with Frontend

To use this backend service instead of localStorage in the frontend, you'll need to update the frontend's service to make API calls to these endpoints instead of using localStorage.

## Database Structure

The application uses an in-memory database simulation for data persistence. The database is implemented in `src/db/database.ts` and provides the following features:

- Separate storage for users, todo lists, and todos
- CRUD operations for all data types
- Data integrity between related entities
- Simple API to interact with the data
- Singleton instance for application-wide access

The database structure separates the storage of todo lists and their todos to allow for more efficient data access and management. This approach:

1. Makes it easier to manage relationships between entities
2. Allows for more granular control over data operations
3. Simulates how a real database would work with foreign keys
4. Provides a cleaner separation of concerns

### Sample Data

The application includes sample data to help with development and testing:

- **Sample Users**: Pre-defined users with hashed passwords
  - admin (password123)
  - john (password123)
  - jane (password123)

- **Sample Todo Lists**: Multiple todo lists with various todos in different states
  - Work Tasks
  - Personal Tasks
  - Shopping List
  - Fitness Goals

The sample data is defined in `src/db/sampleData.ts` and loaded into the database at application startup via `src/db/dbInit.ts`.

### User Data

User authentication data is stored with password hashing and JWT token generation for secure access.

### Todo List Data

Todo lists and their associated todos are stored separately but linked by list ID, similar to how a relational database would implement a one-to-many relationship. 